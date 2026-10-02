# Avero POS Example

Working merchant POS and customer-display software for Avero custom hardware solutions.

Target hardware:
- HP ElitePOS 10.1-inch customer display
- 1280 × 800
- 16:10
- Touch

## Architecture

- React merchant POS
- Standalone customer-display kiosk mode: ?display=1
- Node.js real-time device-sync backend
- One-time pairing codes
- Device authentication tokens
- MongoDB persistence for paired devices
- Render deployment configuration

## Backend environment

Set:
- MONGO_URL — MongoDB connection string
- MONGO_DB — database name (defaults to avero)

The backend exposes /health, /pairing/create, /pairing/claim, /device/stream and /device/state.

## Deployment

The included render.yaml can be used to create the device-sync backend on Render. After deployment, use the generated backend URL in the merchant POS Customer Display settings and on the customer-display setup screen.

Pairing data is persisted in MongoDB when MONGO_URL is configured.
