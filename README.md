# SeatLanka 🚌

SeatLanka is a bus seat booking website I made for Sri Lanka. You search for a bus, pick the exact seat you want on a seat map, pay with PayHere and get a QR e-ticket.

I built this as a portfolio project to learn React, Node.js, TypeScript and MongoDB, and to learn how a real booking system stops two people from getting the same seat.

## Features

- Search buses by route and date, filter by bus type and sort by time, price or duration
- Seat map for 2+2 and 2+3 buses. Seats show as **available**, **your pick**, **held by others** or **booked**
- **Seat hold:** when you continue to payment, your seats are held for 5 minutes so nobody else can take them
- **Payment page** with a countdown that shows how much time is left
- **PayHere sandbox payments** (test cards, no real money)
- **No double booking:** two people can't book the same seat, even at the same moment
- Login with JWT and roles: passenger, operator and admin
- QR code e-ticket you can print or save as PDF

## How booking works

```
Choose seats -> Continue to payment -> seats are held (5 min)
                         |
                   Payment page -> PayHere -> PayHere calls /api/payments/notify
                                                      |
                                       server checks it and confirms the seats
                                                      |
                                Return page -> QR e-ticket
```

1. The passenger picks seats on the seat map (`Seats.tsx`).
2. "Continue to payment" calls `POST /api/bookings/hold`. The seats are saved as `held` with an expiry time.
3. The payment page (`Payment.tsx`) shows the trip, seats, total and a countdown.
4. "Pay" asks the server for the PayHere checkout form. The **server** works out the amount and the hash.
5. After paying, PayHere sends the result to `notify`. The server checks it and changes the seats to `confirmed`.
6. The return page (`PaymentReturn.tsx`) waits until the booking is confirmed and then shows the ticket.

If the 5 minutes run out or the payment is cancelled, the seats become available again.

## Things I learned

- **Stopping double booking:** each seat booking is its own document, and the `Booking` collection has a **partial unique index** on `(trip, seat)` for `held` and `confirmed` bookings. If two people try to take seat 5C at the same time, MongoDB accepts the first one and rejects the second, so the second person gets a "seat was just taken" message.
- **Don't trust the browser with money:** the amount is always seats × ticket price from the database, and the PayHere hash is made on the server so the merchant secret is never sent to the browser.
- **Only PayHere can confirm a paid booking:** the notify endpoint checks the `md5sig`, the merchant ID and the amount before it confirms anything. When PayHere is turned on, `POST /api/bookings/confirm` returns 403, so nobody can get a ticket without paying.
- **PayHere can't reach localhost:** the notify URL has to be public, so I used ngrok while testing on my laptop.
- **Testing finds missing parts:** while testing I found that seats never showed as "Held by others", because the app confirmed the booking straight after holding it. That is why I built the payment page. More about it in [TESTING.md](TESTING.md).

## What I used

| Part | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, React Router |
| Backend | Node.js, Express, TypeScript, Zod |
| Database | MongoDB Atlas, Mongoose |
| Login | JWT, bcrypt |
| Payments | PayHere sandbox, ngrok |
| Project tracking | Jira |

## How to run it

You need **Node.js 20+** and a free **MongoDB Atlas** cluster.

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and add your `MONGODB_URI` and a `JWT_SECRET`. Then:

```bash
npm run seed   # adds buses, routes and trips for the next 14 days
npm run dev    # http://localhost:5000
```

`npm run seed` also makes a demo operator account: `operator@seatlanka.dev` (password from `SEED_OPERATOR_PASSWORD`).

### 2. Frontend

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev    # http://localhost:5173
```

Open http://localhost:5173, search **Colombo → Kandy** for today, register and book a seat.

### 3. PayHere (optional)

If you leave the PayHere settings empty, the app runs in **demo mode** and "Pay" confirms the seats without a payment.

To use PayHere:

1. Make a sandbox account at https://sandbox.payhere.lk and add `localhost` as a domain in **Integrations**.
2. Start ngrok so PayHere can reach your server:
   ```bash
   ngrok http 5000
   ```
3. Add these to `server/.env`:
   ```
   PAYHERE_MERCHANT_ID=your merchant ID
   PAYHERE_MERCHANT_SECRET=your merchant secret
   PAYHERE_SANDBOX=true
   PAYHERE_NOTIFY_URL=https://your-ngrok-url/api/payments/notify
   ```
4. Restart the server.

You can pay with this test card: `4916217501611292`, any name, any CVV and any future expiry date.

**Tip for testing:** set `SEAT_HOLD_MINUTES=1` in `server/.env` if you don't want to wait 5 minutes for a hold to run out.

`.env` is in `.gitignore` because it has my secrets. Please don't upload your own `.env`.

## API

| Method | Endpoint | Who | What it does |
|---|---|---|---|
| POST | `/api/auth/register` | anyone | Make an account |
| POST | `/api/auth/login` | anyone | Log in, returns a JWT |
| GET | `/api/auth/me` | logged in | Current user |
| GET | `/api/trips?from=&to=&date=` | anyone | Search trips |
| GET | `/api/trips/:id/seats` | anyone | Seat map for a trip |
| POST | `/api/bookings/hold` | passenger | Hold up to 4 seats for 5 minutes |
| POST | `/api/bookings/confirm` | passenger | Confirm held seats (demo mode only) |
| GET | `/api/bookings/mine` | passenger | My bookings |
| PATCH | `/api/bookings/:id/cancel` | passenger | Cancel a booking |
| GET | `/api/payments/config` | anyone | Says if the app is in `payhere` or `demo` mode |
| POST | `/api/payments/checkout` | passenger | PayHere checkout form for the held seats |
| POST | `/api/payments/notify` | PayHere | Payment result, confirms the seats |
| GET | `/api/payments/orders/:orderId` | passenger | Order status after coming back from PayHere |

## Project structure

```
seatlanka/
├── client/                 React app
│   └── src/
│       ├── components/     SeatMap, TripCard, SearchForm, BookingSteps, Navbar...
│       ├── pages/          Home, Results, Seats, Payment, PaymentReturn, Ticket, Login, Register
│       ├── context/        AuthContext
│       ├── services/       API calls
│       └── utils/
└── server/                 Express API
    └── src/
        ├── models/         User, Bus, Route, Trip, Booking
        ├── controllers/    auth, trips, bookings, payments
        ├── routes/
        ├── middleware/     JWT login + roles, error handler
        ├── utils/          PayHere hash and signature, ticket codes
        └── scripts/        seed
```

## Testing

I tested the app by hand and tracked the work in Jira. Test cases, results and the bug I found are in [TESTING.md](TESTING.md).

## What I want to add next

- [x] Login, trip search, seat map, seat hold, e-ticket
- [x] PayHere sandbox payment
- [ ] Live seat updates with Socket.IO (right now the seat map refreshes every 10 seconds)
- [ ] Operator dashboard (add buses, schedule trips, see revenue)
- [ ] Email tickets
- [ ] Automated tests (Jest + Supertest, Playwright) and GitHub Actions
- [ ] Put it online (Vercel + Render + MongoDB Atlas)