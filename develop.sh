#!/bin/bash

SESSION_NAME="economy-tracker"

# Start a new tmux session
tmux new-session -d -s $SESSION_NAME

# Window 1: Docker Compose
tmux rename-window -t $SESSION_NAME:0 'docker'
tmux send-keys -t $SESSION_NAME:0 'docker compose -f docker-compose-dev.yml up' C-m
# Window 2: Next.js
tmux new-window -t $SESSION_NAME:1 -n 'nextjs'
tmux send-keys -t $SESSION_NAME:1 'cd next && npm run dev' C-m

# Window 3: Empty terminal
tmux new-window -t $SESSION_NAME:2 -n 'terminal'

# Attach to the tmux session
tmux attach-session -t $SESSION_NAME
