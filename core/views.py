# /path/to/PyDraGo/pydrago/core/views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
import json
import y_py as Y

from .models import Diagram
from .serializers import DiagramSerializer

class DiagramViewSet(viewsets.ModelViewSet):
    queryset = Diagram.objects.all()
    serializer_class = DiagramSerializer

    def _extract_reactflow_data(self, json_data):
        """Extract ReactFlow-compatible data from complex JSON structure."""
        if not json_data:
            return {'nodes': [], 'edges': []}

        # If it's already in ReactFlow format
        if 'nodes' in json_data and 'edges' in json_data and 'config' not in json_data:
            return json_data

        # Extract from the nested structure
        if 'config' in json_data and isinstance(json_data['config'], list) and json_data['config']:
            config = json_data['config'][0]  # Use first config item
            return {
                'nodes': config.get('nodes', []),
                'edges': config.get('edges', []),
                'id': config.get('id', 'multiple')
            }

        return {'nodes': [], 'edges': []}

    def _restore_full_structure(self, reactflow_data, original_json=None):
        """Restore the full JSON structure from ReactFlow data."""
        if not original_json:
            # Create a minimal structure if no original exists
            return {
                'id': reactflow_data.get('id', str(self.get_object().id)),
                'config': [
                    {
                        'edges': reactflow_data.get('edges', []),
                        'nodes': reactflow_data.get('nodes', []),
                        'id': reactflow_data.get('id', 'multiple')
                    }
                ]
            }

        # Update the original structure with new data
        result = original_json.copy()
        if 'config' in result and isinstance(result['config'], list) and result['config']:
            result['config'][0]['nodes'] = reactflow_data.get('nodes', [])
            result['config'][0]['edges'] = reactflow_data.get('edges', [])

        return result

    @action(detail=True, methods=['post'])
    def import_json(self, request, pk=None):
        diagram = self.get_object()
        json_data = request.data

        try:
            # Extract ReactFlow-compatible data
            reactflow_data = self._extract_reactflow_data(json_data)

            # Create a Y.Doc and populate it with the data
            ydoc = Y.YDoc()
            ymap = ydoc.get_map('diagram')

            with ydoc.begin_transaction() as txn:
                # Process nodes
                nodes_array = Y.Array(reactflow_data.get('nodes', []))
                ymap.set(txn, 'nodes', nodes_array)

                # Process edges
                edges_array = Y.Array(reactflow_data.get('edges', []))
                ymap.set(txn, 'edges', edges_array)

                # Store diagram ID
                ymap.set(txn, 'id', reactflow_data.get('id', 'multiple'))

            # Save the Yjs state
            state_update = Y.encode_state_as_update(ydoc)
            diagram.yjs_data = bytes(state_update)
            diagram.json_data = json_data  # Store original structure
            diagram.save()

            return Response({'status': 'imported'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def export_json(self, request, pk=None):
        diagram = self.get_object()

        if diagram.json_data:
            # Return the stored JSON representation if available
            return Response(diagram.json_data)

        if not diagram.yjs_data:
            return Response({'error': 'No data available'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Recreate data from Y.Doc
            ydoc = Y.YDoc()
            Y.apply_update(ydoc, diagram.yjs_data)
            ymap = ydoc.get_map('diagram')

            # Extract nodes and edges
            reactflow_data = {
                'nodes': [node for node in ymap.get('nodes')] if ymap.get('nodes') else [],
                'edges': [edge for edge in ymap.get('edges')] if ymap.get('edges') else [],
                'id': ymap.get('id', 'multiple')
            }

            # Restore the full structure
            json_data = self._restore_full_structure(reactflow_data, diagram.json_data)

            # Update the stored JSON
            diagram.json_data = json_data
            diagram.save()

            return Response(json_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)