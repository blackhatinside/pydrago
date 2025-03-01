# /path/to/PyDraGo/pydrago/pydrago/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import DiagramViewSet

# Create a router for our API views
router = DefaultRouter()
router.register(r'diagrams', DiagramViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]