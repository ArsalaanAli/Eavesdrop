(trap 'kill 0' SIGINT; \
    (cd backend && source venv/bin/activate && python3 main.py) & \
    (cd frontend && npm run dev))
