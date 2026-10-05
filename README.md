# SeatLanka 🚌

A bus seat booking web app for Sri Lanka. Passengers search a route, pick their exact seat on a live seat map, and get a QR e-ticket.

> Portfolio project — React, Node.js, Express, MongoDB, TypeScript.

## Features

- Search buses by route and date, filter by bus type, sort by time / price / duration
- Visual seat map (2+2 / 2+3 layouts) with available, held and booked states
- **Seat hold** — selected seats are reserved for 5 minutes while the passenger pays
- **No double booking** — handled at the database level (see below)
- JWT authentication with roles: passenger, operator, admin
- QR code e-ticket

### Handling two people booking the same seat

Each seat booking is its own document, and the `Booking` collection has a **partial unique index** on `(trip, seat)` for active (`held` or `confirmed`) bookings.
If two passengers try to take seat 5C at the same moment, MongoDB accepts the first insert and rejects the second with a duplicate-key error, so the second passenger gets a clear "seat was just taken" message. Expired holds are moved to `cancelled`, which frees the seat again.

## Tech stack

| Part | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, React Router |
| Backend | Node.js, Express, TypeScript, Zod validation |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT, bcrypt |

## Getting started

**Requirements:** Node.js 20+ and a free MongoDB Atlas cluster.

### 1. Backend

```bash
cd server
npm install
cp .env.example .env     # then fill in MONGODB_URI and JWT_SECRET
npm run seed             # adds sample buses, routes and trips for the next 14 days
npm run dev              # http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

Open http://localhost:5173, search **Colombo → Kandy** for today, pick a seat and register to book.

## API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Log in, returns JWT |
| GET | `/api/auth/me` | ✔ | Current user |
| GET | `/api/trips?from=&to=&date=` | – | Search trips |
| GET | `/api/trips/:id/seats` | – | Seat map for a trip |
| POST | `/api/bookings/hold` | passenger | Hold up to 4 seats |
| POST | `/api/bookings/confirm` | passenger | Confirm held seats → ticket |
| GET | `/api/bookings/mine` | passenger | My bookings |
| PATCH | `/api/bookings/:id/cancel` | passenger | Cancel a booking |

## Project structure

```
seatlanka/
├── client/          React app
│   └── src/
│       ├── components/   SeatMap, TripCard, SearchForm, Navbar…
│       ├── pages/        Home, Results, Seats, Ticket, Login, Register
│       ├── context/      AuthContext
│       ├── services/     API client
│       └── utils/
└── server/          Express API
    └── src/
        ├── models/       User, Bus, Route, Trip, Booking
        ├── controllers/
        ├── routes/
        ├── middleware/   auth (JWT + roles), error handler
        └── scripts/      seed
```

## Roadmap

- [x] Auth, trip search, seat map, seat hold, e-ticket
- [ ] Real-time seat updates with Socket.IO
- [ ] PayHere sandbox payment
- [ ] Operator dashboard (add buses, schedule trips, revenue)
- [ ] Email tickets
- [ ] Tests (Jest + Supertest, Playwright) and GitHub Actions CI
- [ ] Deploy (Vercel + Render + MongoDB Atlas)
