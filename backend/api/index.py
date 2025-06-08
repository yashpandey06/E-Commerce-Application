from main import app

# This is the handler that Vercel will use
def handler(request, context):
    return app(request, context)

# For compatibility with different ASGI servers
application = app