# Deployment

## Environment Variables

The application requires the following environment variables to run:

- `VITE_API_BASE_URL`: Base URL for the REST API.
- `VITE_SOCKET_URL`: WebSocket server URL. This variable is required and has no default; builds will fail if it is missing.

Copy `.env.example` to your environment file and provide values for these variables before building or deploying the app.
