# /path/to/PyDraGo/pydrago/pydrago/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path

from core.consumers import DiagramConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pydrago.settings')

# Initialize Django ASGI application
django_asgi_app = get_asgi_application()

# WebSocket URL patterns
websocket_urlpatterns = [
    path('ws/diagram/<str:diagram_id>/', DiagramConsumer.as_asgi()),
]

# Configure the ASGI application
application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})