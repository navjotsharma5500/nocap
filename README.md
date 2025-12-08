# CampusPass Flow Demo

A University Campus Pass System prototype with Role-Based Access Control.

## Project Structure

This project is divided into two main parts:

- **frontend/**: A Next.js application for the user interface.
- **backend/**: A Node.js/Express application with Prisma ORM for the API and Database.

## Prerequisites

- Node.js (v18+)
- npm or bun
- PostgreSQL Database (Neon.tech recommended)

## Getting Started

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Set up your environment variables:
Create a `.env` file in `backend/` and add your Database URL:
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

Run Prisma migrations (if you have a DB connection):
```bash
npx prisma db push
```

Start the server:
```bash
npm run dev
```
The server will run on `http://localhost:3001`.

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:3000`.

## Features

- **Role-Based Login**: Student, Society EB, President, Faculty Admin, Guard.
- **Society Membership**: Students can request to join societies.
- **Permission Workflow**: Student -> EB -> President -> DoSA -> Guard.
- **Digital Pass**: QR Code with "Green Screen" verification and anti-screenshot protection.
- **Mobile Responsive**: Designed for use on mobile devices.

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Shadcn UI.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: PostgreSQL (Neon.tech).
