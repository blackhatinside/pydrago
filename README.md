# PyDraGo

A collaborative diagramming tool built with Django, React Flow, and CRDT (Conflict-free Replicated Data Types).

## Project Overview

PyDraGo allows multiple users to work simultaneously on diagrams with real-time synchronization. It uses Y-CRDT (via y-py on the backend and Yjs on the frontend) to manage concurrent operations without conflicts.

## Technology Stack

- **Backend**: Django, Django Channels, y-py (Python bindings for Y-CRDT)
- **Frontend**: React, React Flow, Yjs
- **Communication**: WebSockets

## Setup Instructions

1. Clone the repository
2. Create and activate virtual environment:
   ```
   python -m venv MyEnv
   source MyEnv/bin/activate  # Unix/Linux
   # OR
   .\MyEnv\Scripts\activate  # Windows
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```
   python manage.py migrate
   ```
5. Start the server:
   ```
   python manage.py runserver
   ```

## Project Structure

```
pydrago/
├── core/               # Main Django app
│   ├── consumers.py    # WebSocket consumers
│   ├── models.py       # Data models
│   ├── views.py        # API views
│   └── ...
├── pydrago/            # Django project settings
│   ├── asgi.py         # ASGI configuration for WebSockets
│   ├── settings.py     # Project settings
│   └── ...
└── frontend/           # React frontend
    └── ...
```

## Change Log

### Version 0.2.0 (Frontend Implementation)
- Added React frontend with React Flow integration
- Implemented Yjs provider for CRDT synchronization
- Created diagram editor with collaborative editing capabilities
- Added undo/redo functionality
- Implemented custom nodes and edges

### Version 0.1.0 (Initial Setup)
- Created Django project and core app
- Set up basic project structure
- Added requirements.txt and initial documentation
