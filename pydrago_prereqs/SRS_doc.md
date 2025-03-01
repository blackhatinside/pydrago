<!-- SRS_doc.md -->
# Software Requirements Specification for PyDraGo

## 1. Introduction
PyDraGo is a multi-user collaborative diagramming tool built using Django, React Flow, and the Yjs CRDT library. It allows multiple users to work on the same diagram concurrently, with real-time updates and conflict resolution.

## 2. Functional Requirements
1. Users can create, edit, and delete diagram elements (nodes and edges) in real-time.
2. Multiple users can collaborate on the same diagram simultaneously.
3. Changes made by one user are propagated to all other connected users in real-time.
4. Conflicts arising from concurrent edits are automatically resolved using the Yjs CRDT algorithm.
5. Users can save and load diagrams.
6. Users can export diagrams as image files.

## 3. Non-functional Requirements
1. The application should be responsive and perform well with multiple concurrent users.
2. The user interface should be intuitive and easy to use.
3. The application should be secure and protect user data.
4. The application should be scalable to handle increasing numbers of users and diagrams.

## 4. System Architecture
The system will follow a client-server architecture:
- Front-end: React Flow with Yjs integration for real-time collaboration.
- Back-end: Django server with Ypy (Python bindings for Yrs, the Rust implementation of Yjs).
- Database: PostgreSQL for persistent storage of diagram data.

## 5. Project Directory Structure
PyDraGo/
├── backend/
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── app/
│       ├── __init__.py
│       ├── models.py
│       ├── views.py
│       └── urls.py
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js
│   │   ├── components/
│   │   └── styles/
│   └── public/
│       └── index.html
├── README.md
└── .gitignore