#!/bin/bash
# Smart Campus Equipment Borrowing System - 1-Click macOS Launcher

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=================================================="
echo "  Starting Smart Campus Equipment Borrowing Server "
echo "=================================================="

# Open browser after 1 second
(sleep 1.5 && open "http://localhost:8080") &

# Start python backend server
PYTHONUNBUFFERED=1 python3 server.py
