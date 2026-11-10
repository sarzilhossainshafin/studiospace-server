# StudioSpace — Backend API

StudioSpace is a peer-to-peer creative workspace and production studio sharing platform. This repository contains the backend REST API.

## Live Backend

https://studiospace-server-gxzk.onrender.com

## Features

- User registration and login with email and password.
- Google authentication.
- JWT-based authentication using HTTP-only cookies.
- Create, read, update, and delete studio listings.
- Retrieve studio details.
- Create and manage studio bookings.
- Protect private API routes.
- Prevent overlapping confirmed bookings.
- MongoDB database integration.
- CORS configuration for frontend communication.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT
- bcryptjs
- Google Auth Library
- CORS
- Cookie Parser
- dotenv

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/sarzilhossainshafin/studiospace-server.git
cd studiospace-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
NODE_ENV=development
```

Replace the placeholder values with your own credentials. Never commit your `.env` file.

### 4. Run the development server

```bash
npm run dev
```

The backend will run at:

http://localhost:5000

### 5. Production

```bash
npm start
```

## Frontend Repository

https://github.com/sarzilhossainshafin/studiospace-client

## Deployment

Backend hosted on Render:

https://studiospace-server-gxzk.onrender.com

## Examiner Login Credentials

Email: [Add examiner test email]

Password: [Add examiner test password]
