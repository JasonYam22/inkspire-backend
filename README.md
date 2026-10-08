## Inkspire (backend)

## INFO:
**LIVE DEMO**: https://inkspire-client.vercel.app/
**API**: https://vercel.com/jason-yam/inkspire-backend
**BACKEND REPO**: https://github.com/JasonYam22/inkspire-backend
**FRONTEND REPO**: https://github.com/JasonYam22/inkspire-client

An app, which tracks tattoo ideas, thus the origin of the name: ink + inspire.

## Features:
-signing up and logging in with JWT authentication
-a whole crud on your own tattoo ideas where you can upload images
-exploring tattoo ideas of other users and being able to save these ideas to your collection
-creating ur own profie + uploading profile picture

## Tech stack:
Express, TypeScript, Prisma, PostgreSQL (Supabase), Cloudinary, JWT, bcrypt

## API overview:
| Method | Route | What it does |
|--------|-------|--------------|
| POST | /api/auth/signup | Create an account |
| POST | /api/auth/login | Log in, returns a token |
| GET | /api/ideas | Your own ideas |
| POST | /api/ideas | Create an idea (with image) |
| GET | /api/ideas/explore | Public feed of ideas |
| POST | /api/ideas/explore/:id/save | Save or unsave an idea |