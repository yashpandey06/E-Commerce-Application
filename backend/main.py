from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt  # This should now work with PyJWT
from datetime import datetime, timedelta, timezone
import os
from enum import Enum
import asyncpg
from dotenv import load_dotenv
import paypalrestsdk
import asyncio
from typing import Optional, List
import re

load_dotenv()

# PayPal Configuration
paypal_client_id = os.getenv("PAYPAL_CLIENT_ID")
paypal_client_secret = os.getenv("PAYPAL_CLIENT_SECRET")
paypal_mode = os.getenv("PAYPAL_MODE", "sandbox")

if paypal_client_id and paypal_client_secret:
    paypalrestsdk.configure({
        "mode": paypal_mode,
        "client_id": paypal_client_id,
        "client_secret": paypal_client_secret
    })

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")

async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)

async def sql(query: str, params: list = None):
    conn = await get_db_connection()
    try:
        if params:
            result = await conn.fetch(query, *params)
        else:
            result = await conn.fetch(query)
        return [dict(record) for record in result]
    finally:
        await conn.close()

def run_async(func):
    """Decorator to run async functions in Flask routes"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(func(*args, **kwargs))
        finally:
            loop.close()
    return wrapper

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

# CORS setup
CORS(app, origins=[
    "http://localhost:3000",
    "https://localhost:3000",
    "https://localhost:3001",
    "https://kommercio.netlify.app",
    "https://www.kommercio.netlify.app",
    "*"
], supports_credentials=True)

# Enums
class UserRole(str, Enum):
    CUSTOMER = "customer"
    VENDOR = "vendor"
    ADMIN = "admin"

# Utility functions
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Token format invalid!'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = data.get('sub')
            user_id = data.get('user_id')
            
            if not email or not user_id:
                return jsonify({'message': 'Token is invalid!'}), 401
                
            # Get user from database
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                user = loop.run_until_complete(
                    sql("SELECT * FROM users WHERE email = $1 AND id = $2", [email, user_id])
                )
                if not user:
                    return jsonify({'message': 'User not found!'}), 401
                current_user = user[0]
            finally:
                loop.close()
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Health check endpoints
@app.route('/')
def root():
    return jsonify({"message": "E-commerce API is running on Flask!", "status": "healthy"})

@app.route('/health')
@run_async
async def health_check():
    try:
        result = await sql("SELECT 1 as test")
        return jsonify({
            "status": "healthy",
            "database": "connected" if result else "disconnected",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }), 500

# Auth endpoints
@app.route('/auth/signup', methods=['POST'])
@run_async
async def signup():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', UserRole.CUSTOMER.value)
    
    if not email or not username or not password:
        return jsonify({"message": "Email, username, and password are required"}), 400
    
    if not validate_email(email):
        return jsonify({"message": "Invalid email format"}), 400
    
    # Check if user exists
    existing_user = await sql("SELECT id FROM users WHERE email = $1", [email])
    if existing_user:
        return jsonify({"message": "Email already registered"}), 400
    
    # Check if username exists
    existing_username = await sql("SELECT id FROM users WHERE username = $1", [username])
    if existing_username:
        return jsonify({"message": "Username already taken"}), 400
    
    # Hash password and create user
    hashed_password = generate_password_hash(password)
    result = await sql(
        "INSERT INTO users (email, username, hashed_password, role) VALUES ($1, $2, $3, $4) RETURNING id",
        [email, username, hashed_password, role]
    )
    
    return jsonify({"message": "User created successfully", "user_id": result[0]["id"]}), 201

@app.route('/auth/token', methods=['POST'])
@run_async
async def login():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    
    user = await sql("SELECT * FROM users WHERE email = $1", [email])
    if not user or not check_password_hash(user[0]["hashed_password"], password):
        return jsonify({"message": "Incorrect email or password"}), 401
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user[0]["email"], "user_id": user[0]["id"]}, 
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user[0]["email"], "user_id": user[0]["id"]}
    )
    
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    })

@app.route('/auth/refresh', methods=['POST'])
@run_async
async def refresh_token():
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        return jsonify({"message": "Refresh token is required"}), 400
    
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user_id = payload.get("user_id")
        if email is None or user_id is None:
            return jsonify({"message": "Invalid refresh token"}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Refresh token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid refresh token"}), 401
    
    user = await sql("SELECT * FROM users WHERE email = $1 AND id = $2", [email, user_id])
    if not user:
        return jsonify({"message": "User not found"}), 401
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user[0]["email"], "user_id": user[0]["id"]}, 
        expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(
        data={"sub": user[0]["email"], "user_id": user[0]["id"]}
    )
    
    return jsonify({
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    })

@app.route('/auth/me', methods=['GET'])
@token_required
def get_current_user_info(current_user):
    return jsonify({
        "id": current_user["id"],
        "email": current_user["email"],
        "username": current_user["username"],
        "role": current_user["role"]
    })

@app.route('/auth/profile', methods=['PUT'])
@token_required
@run_async
async def update_profile(current_user):
    data = request.get_json()
    
    if not data:
        return jsonify({
            "id": current_user["id"],
            "email": current_user["email"],
            "username": current_user["username"],
            "role": current_user["role"]
        })
    
    update_fields = []
    params = []
    param_count = 1
    
    for field, value in data.items():
        if field in ['username', 'email'] and value:
            if field == "email":
                if not validate_email(value):
                    return jsonify({"message": "Invalid email format"}), 400
                # Check if email already exists
                existing_email = await sql(
                    "SELECT id FROM users WHERE email = $1 AND id != $2", 
                    [value, current_user["id"]]
                )
                if existing_email:
                    return jsonify({"message": "Email already registered"}), 400
            elif field == "username":
                # Check if username already exists
                existing_username = await sql(
                    "SELECT id FROM users WHERE username = $1 AND id != $2", 
                    [value, current_user["id"]]
                )
                if existing_username:
                    return jsonify({"message": "Username already taken"}), 400
            
            update_fields.append(f"{field} = ${param_count}")
            params.append(value)
            param_count += 1
    
    if not update_fields:
        return jsonify({
            "id": current_user["id"],
            "email": current_user["email"],
            "username": current_user["username"],
            "role": current_user["role"]
        })
    
    query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ${param_count} RETURNING *"
    params.append(current_user["id"])
    
    result = await sql(query, params)
    return jsonify({
        "id": result[0]["id"],
        "email": result[0]["email"],
        "username": result[0]["username"],
        "role": result[0]["role"]
    })

@app.route('/auth/password', methods=['PUT'])
@token_required
@run_async
async def update_password(current_user):
    data = request.get_json()
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({"message": "Current password and new password are required"}), 400
    
    # Verify current password
    if not check_password_hash(current_user["hashed_password"], current_password):
        return jsonify({"message": "Incorrect current password"}), 400
    
    # Hash new password
    new_hashed_password = generate_password_hash(new_password)
    
    await sql("UPDATE users SET hashed_password = $1 WHERE id = $2", 
             [new_hashed_password, current_user["id"]])
    
    return jsonify({"message": "Password updated successfully"})

# Product endpoints
@app.route('/products', methods=['GET'])
@run_async
async def get_products():
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 20))
    category = request.args.get('category')
    search = request.args.get('search')
    
    query = "SELECT * FROM products WHERE is_active = true"
    params = []
    
    if category and category != "all":
        query += " AND category = $" + str(len(params) + 1)
        params.append(category)
    
    if search:
        query += " AND name ILIKE $" + str(len(params) + 1)
        params.append(f"%{search}%")
    
    query += " ORDER BY created_at DESC LIMIT $" + str(len(params) + 1) + " OFFSET $" + str(len(params) + 2)
    params.extend([limit, skip])
    
    products = await sql(query, params)
    
    # Convert price to float for all products
    for product in products:
        product["price"] = float(product["price"])
    
    # Get total count
    count_query = "SELECT COUNT(*) as total FROM products WHERE is_active = true"
    count_params = []
    
    if category and category != "all":
        count_query += " AND category = $1"
        count_params.append(category)
    
    if search:
        if count_params:
            count_query += " AND name ILIKE $2"
        else:
            count_query += " AND name ILIKE $1"
        count_params.append(f"%{search}%")
    
    total_result = await sql(count_query, count_params)
    total = total_result[0]["total"] if total_result else 0
    
    return jsonify({
        "products": products,
        "total": total,
        "skip": skip,
        "limit": limit
    })

@app.route('/products/<int:product_id>', methods=['GET'])
@run_async
async def get_product(product_id):
    product = await sql("SELECT * FROM products WHERE id = $1 AND is_active = true", [product_id])
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    # Convert price to float
    product[0]["price"] = float(product[0]["price"])
    return jsonify(product[0])

@app.route('/vendor/products', methods=['POST'])
@token_required
@run_async
async def create_product(current_user):
    if current_user["role"] not in [UserRole.VENDOR.value, UserRole.ADMIN.value]:
        return jsonify({"message": "Not authorized to create products"}), 403
    
    data = request.get_json()
    
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    stock = data.get('stock')
    category = data.get('category')
    image_url = data.get('image_url')
    
    if not all([name, description, price is not None, stock is not None, category]):
        return jsonify({"message": "Name, description, price, stock, and category are required"}), 400
    
    result = await sql(
        """INSERT INTO products (name, description, price, stock, category, image_url, vendor_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *""",
        [name, description, price, stock, category, image_url, current_user["id"]]
    )
    return jsonify(result[0]), 201

@app.route('/vendor/products/<int:product_id>', methods=['PUT'])
@token_required
@run_async
async def update_product(current_user, product_id):
    # Check if product exists and belongs to user
    product = await sql("SELECT * FROM products WHERE id = $1", [product_id])
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    if product[0]["vendor_id"] != current_user["id"] and current_user["role"] != UserRole.ADMIN.value:
        return jsonify({"message": "Not authorized to update this product"}), 403
    
    data = request.get_json()
    
    # Build update query dynamically
    update_fields = []
    params = []
    param_count = 1
    
    for field in ['name', 'description', 'price', 'stock', 'category', 'image_url']:
        if field in data and data[field] is not None:
            update_fields.append(f"{field} = ${param_count}")
            params.append(data[field])
            param_count += 1
    
    if not update_fields:
        return jsonify(product[0])
    
    query = f"UPDATE products SET {', '.join(update_fields)} WHERE id = ${param_count} RETURNING *"
    params.append(product_id)
    
    result = await sql(query, params)
    return jsonify(result[0])

@app.route('/vendor/products/<int:product_id>', methods=['DELETE'])
@token_required
@run_async
async def delete_product(current_user, product_id):
    product = await sql("SELECT * FROM products WHERE id = $1", [product_id])
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    if product[0]["vendor_id"] != current_user["id"] and current_user["role"] != UserRole.ADMIN.value:
        return jsonify({"message": "Not authorized to delete this product"}), 403
    
    await sql("UPDATE products SET is_active = false WHERE id = $1", [product_id])
    return jsonify({"message": "Product deleted successfully"})

# Cart endpoints
@app.route('/cart', methods=['GET'])
@token_required
@run_async
async def get_cart(current_user):
    cart_items = await sql("""
        SELECT ci.*, p.name, p.price, p.image_url 
        FROM cart_items ci 
        JOIN products p ON ci.product_id = p.id 
        WHERE ci.user_id = $1
    """, [current_user["id"]])
    
    total = sum(float(item["price"]) * item["quantity"] for item in cart_items)
    
    items = [
        {
            "id": item["id"],
            "product_id": item["product_id"],
            "quantity": item["quantity"],
            "product": {
                "id": item["product_id"],
                "name": item["name"],
                "price": float(item["price"]),  # Convert to float
                "image_url": item["image_url"]
            }
        }
        for item in cart_items
    ]
    
    return jsonify({
        "items": items,
        "total": total,
        "item_count": len(cart_items)
    })

@app.route('/cart/items', methods=['POST'])
@token_required
@run_async
async def add_to_cart(current_user):
    data = request.get_json()
    
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return jsonify({"message": "Product ID is required"}), 400
    
    # Check if product exists
    product = await sql("SELECT * FROM products WHERE id = $1", [product_id])
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    # Check if item already in cart
    existing_item = await sql(
        "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
        [current_user["id"], product_id]
    )
    
    if existing_item:
        # Update quantity
        result = await sql(
            "UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2 RETURNING *",
            [quantity, existing_item[0]["id"]]
        )
        return jsonify(result[0])
    else:
        # Create new cart item
        result = await sql(
            "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
            [current_user["id"], product_id, quantity]
        )
        return jsonify(result[0]), 201

@app.route('/cart/items/<int:item_id>', methods=['PUT'])
@token_required
@run_async
async def update_cart_item(current_user, item_id):
    data = request.get_json()
    quantity = data.get('quantity')
    
    if quantity is None:
        return jsonify({"message": "Quantity is required"}), 400
    
    cart_item = await sql(
        "SELECT * FROM cart_items WHERE id = $1 AND user_id = $2",
        [item_id, current_user["id"]]
    )
    
    if not cart_item:
        return jsonify({"message": "Cart item not found"}), 404
    
    if quantity <= 0:
        # Remove item if quantity is 0 or less
        await sql("DELETE FROM cart_items WHERE id = $1", [item_id])
        return jsonify({"message": "Item removed from cart"})
    else:
        # Update quantity
        result = await sql(
            "UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *",
            [quantity, item_id]
        )
        return jsonify(result[0])

@app.route('/cart/items/<int:item_id>', methods=['DELETE'])
@token_required
@run_async
async def remove_from_cart(current_user, item_id):
    cart_item = await sql(
        "SELECT * FROM cart_items WHERE id = $1 AND user_id = $2",
        [item_id, current_user["id"]]
    )
    
    if not cart_item:
        return jsonify({"message": "Cart item not found"}), 404
    
    await sql("DELETE FROM cart_items WHERE id = $1", [item_id])
    return jsonify({"message": "Item removed from cart"})

# PayPal Payment endpoints
@app.route('/checkout', methods=['POST'])
@token_required
@run_async
async def create_payment(current_user):
    data = request.get_json()
    payment_method = data.get('payment_method', 'paypal')
    return_url = data.get('return_url', 'https://your-frontend-domain.vercel.app/payment/success')
    cancel_url = data.get('cancel_url', 'https://your-frontend-domain.vercel.app/payment/cancel')
    
    # Get cart items
    cart_items = await sql("""
        SELECT ci.*, p.name, p.price, p.image_url 
        FROM cart_items ci 
        JOIN products p ON ci.product_id = p.id 
        WHERE ci.user_id = $1
    """, [current_user["id"]])
    
    if not cart_items:
        return jsonify({"message": "Cart is empty"}), 400
    
    # Calculate total with proper float conversion
    total_amount = sum(float(item["price"]) * item["quantity"] for item in cart_items)
    
    if payment_method == "paypal" and paypal_client_id:
        # Create PayPal payment
        items = []
        for item in cart_items:
            items.append({
                "name": item["name"],
                "sku": str(item["product_id"]),
                "price": str(float(item["price"])),  # Ensure float conversion
                "currency": "USD",
                "quantity": item["quantity"]
            })
        
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": return_url,
                "cancel_url": cancel_url
            },
            "transactions": [{
                "item_list": {
                    "items": items
                },
                "amount": {
                    "total": str(total_amount),
                    "currency": "USD"
                },
                "description": f"Order for {current_user['username']}"
            }]
        })
        
        if payment.create():
            # Store payment info temporarily
            order_result = await sql(
                "INSERT INTO orders (user_id, total_amount, payment_intent_id, status) VALUES ($1, $2, $3, $4) RETURNING *",
                [current_user["id"], total_amount, payment.id, "pending_payment"]
            )
            order = order_result[0]
            
            # Create order items
            for cart_item in cart_items:
                await sql(
                    "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
                    [order["id"], cart_item["product_id"], cart_item["quantity"], float(cart_item["price"])]
                )
            
            # Get approval URL
            approval_url = None
            for link in payment.links:
                if link.rel == "approval_url":
                    approval_url = link.href
                    break
            
            return jsonify({
                "payment_id": payment.id,
                "order_id": order["id"],
                "approval_url": approval_url,
                "total_amount": total_amount
            })
        else:
            return jsonify({"message": f"PayPal payment creation failed: {payment.error}"}), 400
    
    else:
        # Fallback to mock payment for other methods
        order_result = await sql(
            "INSERT INTO orders (user_id, total_amount, payment_intent_id) VALUES ($1, $2, $3) RETURNING *",
            [current_user["id"], total_amount, f"mock_{int(datetime.now(timezone.utc).timestamp())}"]
        )
        order = order_result[0]
        
        # Create order items with proper float conversion
        for cart_item in cart_items:
            await sql(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
                [order["id"], cart_item["product_id"], cart_item["quantity"], float(cart_item["price"])]
            )
        
        # Clear cart
        await sql("DELETE FROM cart_items WHERE user_id = $1", [current_user["id"]])
        
        return jsonify({
            "order_id": order["id"],
            "total_amount": total_amount,
            "payment_intent_id": order["payment_intent_id"],
            "status": "created"
        })

@app.route('/payment/execute', methods=['POST'])
@token_required
@run_async
async def execute_payment(current_user):
    data = request.get_json()
    payment_id = data.get('payment_id')
    payer_id = data.get('payer_id')
    
    if not payment_id or not payer_id:
        return jsonify({"message": "Payment ID and Payer ID are required"}), 400
    
    try:
        # Find the payment and execute it
        payment = paypalrestsdk.Payment.find(payment_id)
        
        if payment.execute({"payer_id": payer_id}):
            # Payment successful, update order status
            await sql(
                "UPDATE orders SET status = 'created' WHERE payment_intent_id = $1 AND user_id = $2",
                [payment_id, current_user["id"]]
            )
            
            # Clear cart
            await sql("DELETE FROM cart_items WHERE user_id = $1", [current_user["id"]])
            
            # Get order details
            order = await sql(
                "SELECT * FROM orders WHERE payment_intent_id = $1 AND user_id = $2",
                [payment_id, current_user["id"]]
            )
            
            return jsonify({
                "status": "success",
                "payment_id": payment.id,
                "order_id": order[0]["id"] if order else None,
                "message": "Payment completed successfully"
            })
        else:
            return jsonify({"message": f"Payment execution failed: {payment.error}"}), 400
            
    except Exception as e:
        return jsonify({"message": f"Payment execution error: {str(e)}"}), 400

@app.route('/payment/cancel', methods=['GET'])
def payment_cancelled():
    return jsonify({"status": "cancelled", "message": "Payment was cancelled by user"})

# Order management endpoints
@app.route('/orders', methods=['GET'])
@token_required
@run_async
async def get_user_orders(current_user):
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 20))
    
    # Get orders with items separately to avoid array aggregation issues
    orders = await sql("""
        SELECT o.id, o.total_amount, o.status, o.created_at, o.payment_intent_id,
               COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1 AND o.status != 'pending_payment'
        GROUP BY o.id, o.total_amount, o.status, o.created_at, o.payment_intent_id
        ORDER BY o.created_at DESC
        LIMIT $2 OFFSET $3
    """, [current_user["id"], limit, skip])
    
    # Convert total_amount to float for each order
    for order in orders:
        order["total_amount"] = float(order["total_amount"])
    
    # Get items for each order
    for order in orders:
        items = await sql("""
            SELECT oi.id, oi.product_id, oi.quantity, oi.price,
                   p.name as product_name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        """, [order["id"]])
        
        # Convert item prices to float
        for item in items:
            item["price"] = float(item["price"])
        
        order["items"] = items
    
    return jsonify(orders)

@app.route('/orders/<int:order_id>', methods=['GET'])
@token_required
@run_async
async def get_order_details(current_user, order_id):
    # Get order details
    order = await sql("""
        SELECT o.id, o.total_amount, o.status, o.created_at, o.payment_intent_id
        FROM orders o
        WHERE o.id = $1 AND o.user_id = $2
    """, [order_id, current_user["id"]])
    
    if not order:
        return jsonify({"message": "Order not found"}), 404
    
    # Convert total_amount to float
    order[0]["total_amount"] = float(order[0]["total_amount"])
    
    # Get order items
    items = await sql("""
        SELECT oi.id, oi.product_id, oi.quantity, oi.price,
               p.name as product_name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
    """, [order_id])
    
    # Convert item prices to float
    for item in items:
        item["price"] = float(item["price"])
    
    order_details = order[0]
    order_details["items"] = items
    
    return jsonify(order_details)

@app.route('/orders/<int:order_id>/cancel', methods=['PUT'])
@token_required
@run_async
async def cancel_order(current_user, order_id):
    order = await sql("SELECT * FROM orders WHERE id = $1 AND user_id = $2", [order_id, current_user["id"]])
    
    if not order:
        return jsonify({"message": "Order not found"}), 404
    
    if order[0]["status"] not in ["created", "pending_payment"]:
        return jsonify({"message": "Cannot cancel order that is not in created or pending status"}), 400
    
    await sql("UPDATE orders SET status = 'cancelled' WHERE id = $1", [order_id])
    
    return jsonify({"message": "Order cancelled successfully"})

@app.route('/orders/<int:order_id>/status', methods=['PUT'])
@token_required
@run_async
async def update_order_status(current_user, order_id):
    # Check if user is admin or vendor
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.VENDOR.value]:
        return jsonify({"message": "Not authorized to update order status"}), 403
    
    data = request.get_json()
    status = data.get('status')
    
    # Valid statuses
    valid_statuses = ["created", "confirmed", "shipped", "delivered", "cancelled", "pending_payment"]
    if status not in valid_statuses:
        return jsonify({"message": f"Invalid status. Must be one of: {valid_statuses}"}), 400
    
    # Update order status
    result = await sql(
        "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
        [status, order_id]
    )
    
    if not result:
        return jsonify({"message": "Order not found"}), 404
    
    return jsonify({"message": f"Order status updated to {status}"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)