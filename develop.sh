#!/bin/bash

SESSION_NAME="economy-tracker"

# Start a new tmux session
tmux new-session -d -s $SESSION_NAME

tmux rename-window -t $SESSION_NAME:0 'docker'
tmux send-keys -t $SESSION_NAME:0 'docker compose -f docker-compose-dev.yml up' C-m

tmux new-window -t $SESSION_NAME:1 -n 'client'
tmux send-keys -t $SESSION_NAME:1 'cd client && npm run dev' C-m

tmux new-window -t $SESSION_NAME:2 -n 'server'
tmux send-keys -t $SESSION_NAME:2 'cd server && npm run dev' C-m

tmux new-window -t $SESSION_NAME:3 -n 'drizzle'
tmux send-keys -t $SESSION_NAME:3 'cd server && npm run db:studio' C-m
# Window 3: Empty terminal
tmux new-window -t $SESSION_NAME:4 -n 'terminal'

# Attach to the tmux session
tmux attach-session -t $SESSION_NAME