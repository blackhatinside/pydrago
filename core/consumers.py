# /path/to/PyDraGo/pydrago/core/consumers.py
import json
import y_py as Y
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Diagram

class DiagramConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.diagram_id = self.scope['url_route']['kwargs']['diagram_id']
        self.room_group_name = f'diagram_{self.diagram_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Initialize Y.Doc for this diagram
        self.ydoc = Y.YDoc()
        
        # Load or create diagram data
        diagram_data = await self.get_diagram_data(self.diagram_id)
        if diagram_data:
            # Apply saved state to ydoc
            Y.apply_update(self.ydoc, bytes(diagram_data))
        
        # Accept the connection
        await self.accept()
        
        # Send the initial state to the client
        initial_state = Y.encode_state_as_update(self.ydoc)
        await self.send(text_data=json.dumps({
            'type': 'sync',
            'data': list(initial_state)  # Convert bytes to list for JSON serialization
        }))

    async def disconnect(self, close_code):
        # Save current state before disconnecting
        state_update = Y.encode_state_as_update(self.ydoc)
        await self.save_diagram_data(self.diagram_id, state_update)
        
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'update':
            # Apply the update to the shared document
            update_data = bytes(data['update'])
            Y.apply_update(self.ydoc, update_data)
            
            # Save the current state
            state_update = Y.encode_state_as_update(self.ydoc)
            await self.save_diagram_data(self.diagram_id, state_update)
            
            # Broadcast the update to all clients in the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'diagram_update',
                    'update': list(update_data)
                }
            )
        
        elif message_type == 'sync':
            # Client is requesting to sync
            sync_step = data.get('sync_step', 0)
            
            if sync_step == 0:
                # Send state vector to client
                state_vector = Y.encode_state_vector(self.ydoc)
                await self.send(text_data=json.dumps({
                    'type': 'sync',
                    'sync_step': 1,
                    'state_vector': list(state_vector)
                }))
            
            elif sync_step == 1:
                # Client sent their state vector, respond with the diff
                client_state_vector = bytes(data['state_vector'])
                update = Y.encode_state_as_update(self.ydoc, client_state_vector)
                await self.send(text_data=json.dumps({
                    'type': 'sync',
                    'sync_step': 2,
                    'update': list(update)
                }))

    async def diagram_update(self, event):
        # Send update to the WebSocket
        await self.send(text_data=json.dumps({
            'type': 'update',
            'update': event['update']
        }))

    @database_sync_to_async
    def get_diagram_data(self, diagram_id):
        try:
            diagram = Diagram.objects.get(id=diagram_id)
            return diagram.yjs_data
        except Diagram.DoesNotExist:
            return None

    @database_sync_to_async
    def save_diagram_data(self, diagram_id, data):
        Diagram.objects.update_or_create(
            id=diagram_id,
            defaults={'yjs_data': bytes(data)}
        )
