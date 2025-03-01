# /path/to/PyDraGo/pydrago/core/serializers.py
from rest_framework import serializers
from .models import Diagram

class DiagramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagram
        fields = ['id', 'name', 'description', 'json_data', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']