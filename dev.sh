#!/usr/bin/env bash
set -e
export PATH="$PWD/.node/bin:$PATH"

# Run server and client dev servers concurrently
npm run dev:server &
SERVER_PID=$!

npm run dev:client &
CLIENT_PID=$!

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null" EXIT INT TERM

wait

