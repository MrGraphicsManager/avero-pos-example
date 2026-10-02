# Avero POS Example

Production-oriented merchant POS and customer-display software for Avero custom hardware solutions.

Target hardware:
- HP ElitePOS 10.1-inch customer display
- 1280 × 800
- 16:10
- Touch

## Architecture

- React merchant POS
- Standalone customer-display kiosk mode: `?display=1`
- Node.js real-time device-sync backend
- One-time pairing codes
- Separate merchant/device authentication tokens
- MongoDB persistence for paired devices
- Render deployment configuration
- GitHub Actions build validation

## Production setup

### Backend environment

Set:
- `MONGO_URL` — MongoDB connection string
- `MONGO_DB` — database name (defaults to `avero`)

### Render

The root `render.yaml` defines the Node backend service. After deployment, copy the Render service URL into the merchant POS under **Customer Display → Sync Server**.

### Pairing

1. Merchant saves the backend URL.
2. Merchant selects **Generate Code**.
3. The backend creates a one-time code valid for 10 minutes.
4. Customer display opens with `?display=1` and enters the backend URL + code.
5. The backend returns a device token.
6. The display stores the token and connects to the authenticated SSE stream.
7. Merchant POS publishes order/payment state through the authenticated API.

## Important

Pairing data is persistent only when `MONGO_URL` is configured. Without MongoDB, pairing falls back to process memory and will be lost after a backend restart.

The public Avero website is separate from this example application. This repository is the actual POS/customer-display software example.
