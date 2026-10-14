# Inkspire (backend)

An app for tracking tattoo ideas. The name comes from ink + inspire.

## Info
- **Live demo:** https://inkspire-client.vercel.app/
- **API:** https://inkspire-backend-phi.vercel.app/
- **Backend repo:** https://github.com/JasonYam22/inkspire-backend
- **Frontend repo:** https://github.com/JasonYam22/inkspire-client

## Features
- Sign up and log in with JWT authentication
- Full CRUD (create, read, update, delete) on your own tattoo ideas, with image upload
- Explore tattoo ideas from other users and save them to your collection
- Create your own profile and upload a profile picture

## Tech stack
Express, TypeScript, Prisma, PostgreSQL (Supabase), Cloudinary, JWT, bcrypt

## Getting started
1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env` and fill in the values
3. Run `npx prisma migrate dev`
4. Run `npm run dev` (starts on http://localhost:5005)

## API overview
| Method | Route | What it does |
|--------|-------|--------------|
| POST | /api/auth/signup | Create an account |
| POST | /api/auth/login | Log in, returns a token |
| GET | /api/ideas | Your own ideas |
| POST | /api/ideas | Create an idea (with image) |
| GET | /api/ideas/explore | Public feed of ideas |
| POST | /api/ideas/explore/:id/save | Save or unsave an idea |

## What I'd improve next
- Automated tests and CI