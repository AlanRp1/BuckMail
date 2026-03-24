# BuckMail - Temporary Gamer Email Service

BuckMail is a temporary email service with a cyberpunk/gamer aesthetic. Users can generate unique addresses and receive emails in real-time.

## 🚀 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB, Socket.io, Mongoose.
- **Security**: Helmet, Express Rate Limit, HTML Sanitization (via frontend/backend logic).
- **Automation**: MongoDB TTL (Time-To-Live) for auto-deleting emails and addresses after 1 hour.

## 🛠️ Installation & Local Setup

### 1. Prerequisites
- Node.js installed
- MongoDB installed and running locally (or a MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd backend
npm install
# Create/edit .env file
# MONGO_URI=mongodb://localhost:27017/buckmail
# EMAIL_DOMAIN=buckmail.com
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create/edit .env.local file
# VITE_API_URL=http://localhost:5000
npm run dev
```

## 📡 Webhook Integration (Receiving Real Emails)

To receive real emails on your domain (e.g., `buckmail.com`), you need an email provider that supports Webhooks like **Mailgun**, **SendGrid Inbound Parse**, or **Cloudflare Email Routing**.

### Example with Mailgun:
1. Set up your domain in Mailgun.
2. Go to **Receiving** -> **Routes**.
3. Create a route with:
   - **ExpressionType**: `match_recipient(".*@buckmail.com")`
   - **Action**: `forward("https://your-backend-url.com/api/webhook/receive")`
   - **Priority**: 0

The backend is already structured to handle typical Mailgun POST data.

## 🧪 Testing Locally
Since you don't have a real domain/webhook active locally, you can use the provided test script:

```bash
# In a new terminal
node test_webhook.js
```
This will send a fake email to the backend, which will then appear in the frontend in real-time.

## 📦 Deployment

### Frontend (Vite)
- Deploy to **Vercel** or **Netlify**.
- Set `VITE_API_URL` to your production backend URL.

### Backend (Node.js)
- Deploy to **Railway**, **Render**, or a **VPS**.
- Set `MONGO_URI` to a MongoDB Atlas connection string.
- Set `EMAIL_DOMAIN` to your actual domain.
- Set `PORT` (usually provided by the platform).
