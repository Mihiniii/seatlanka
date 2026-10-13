# Testing SeatLanka

I tested SeatLanka by hand to practise QA. I planned the work in **Jira**, wrote test cases from the acceptance criteria of each story, ran them and logged the bugs I found.

## How I tested

- **Manual testing** in Chrome
- **Two browsers at the same time** (normal + incognito) to act as two different passengers
- **Postman** to call the API directly
- **Jira** (Kanban board) to track stories, test tasks and bugs

My board columns: `To Do → In Progress → In Review → Testing → Done`

## How the work is set up in Jira

| Type | What it is | Example |
|---|---|---|
| Story | A feature from the passenger's side, with acceptance criteria | KAN-5 Selected seat is held for 5 minutes during payment |
| Task | Testing work, with the test cases written inside | KAN-8 Write test cases for seat selection and seat hold |
| Bug | Something that does not work as expected | KAN-13 Seats are never shown as "Held by others" |

I also put the Jira key in my commit messages (for example `KAN-12 Add payment page with seat hold countdown`) so each change can be traced back to its story.

## Test cases: seat selection and seat hold (KAN-8)

Environment: Chrome, localhost, seed data

| ID | What I did | Expected | Result |
|---|---|---|---|
| TC-01 | Opened the seat map for a trip | Layout matches the bus type | Pass (2+2 only, there is no 2+3 bus in the seed data) |
| TC-03 | Clicked an available seat | Seat turns dark blue ("Your pick") | Pass |
| TC-05 | Passenger 1 continues to payment, passenger 2 looks at the same trip | Seat shows as "Held by others" for passenger 2 | Failed first → bug KAN-13. Pass after the fix |
## Test cases: My bookings (KAN-15)

| ID | What I did | Expected | Result |
|---|---|---|---|
| TC-20 | Opened My bookings as a passenger with bookings | Bookings listed with trip, date, seats, status | Pass |
| TC-21 | Clicked a confirmed booking | QR ticket opens | Pass |
| TC-22 | Let a seat hold expire, then opened My bookings | Expired booking not in the list | Pass |
| TC-23 | Logged out, checked the navbar and opened /bookings directly | Link hidden, redirected to login | Pass |
| TC-24 | Logged in as a new passenger with no bookings | "No bookings yet" message | Pass |

I found that there was no way to open a ticket again after leaving the ticket page (TC-12), so I added this page.

## Bug I found: KAN-13

**Seats were never shown as "Held by others".**

Steps to reproduce:
1. Browser A: log in as passenger 1 and select a seat
2. Browser B (incognito): log in as passenger 2 and open the same trip
3. Browser A: click "Continue to payment"
4. Browser B: refresh the seat map

- **Expected:** the seat is orange ("Held by others") while passenger 1 pays
- **Actual:** the seat went straight to "Booked"

**Why it happened:** in `Seats.tsx`, the app called `holdSeats()` and then `confirm()` straight away. There was no payment step in between, so the "held" state only lasted for a split second and nobody could see it.

**How I fixed it (KAN-12):** I added a payment page with a 5-minute countdown and PayHere sandbox payments. Now the seat stays held while the passenger is on the payment page, and the booking is only confirmed when PayHere's notification arrives. I tested TC-05 again and it passed.

   ## Security check: confirming without paying (TC-18)

   With PayHere turned on, I called `POST /api/bookings/confirm` in Postman with a passenger token.
   The server returned **403**, so nobody can get a ticket without paying.

   ![Postman showing 403 for confirm without payment](docs/screenshots/tc18-confirm-403.png)

## Things I learned

- The expected result in a test case should use the same words as the app. I first wrote "your seat" but the app says "Your pick", so I updated the test case. That was not a bug.
- If something can't be tested, write down why (like the 2+3 layout with no 2+3 bus in the data).
- A story can look "done" but still be missing a part. Testing it properly is how I found the missing payment step.
- With PayHere turned on, `POST /api/bookings/confirm` must not work, otherwise someone could get a ticket without paying. It now returns 403.

## Test cases: two people, one seat (KAN-9)

| ID | What I did | Expected | Result |
|---|---|---|---|
| TC-09 | Two passengers in two browsers picked seat 5C. Passenger 1 clicked "Continue to payment", then passenger 2 clicked it a few seconds later | Only passenger 1 gets the seat. Passenger 2 sees "Sorry, one of those seats was just taken" | Pass |

This works because of the partial unique index on `(trip, seat)` in MongoDB. The database itself rejects the second booking, so it can't happen even if two requests arrive at the same moment.

## Test cases: seat hold runs out (KAN-10)

| ID | What I did | Expected | Result |
|---|---|---|---|
| TC-06 | Selected a seat and continued to payment | Payment page shows a countdown | Pass |
| TC-08 | Waited on the payment page without paying (`SEAT_HOLD_MINUTES=1`) | Hold expires, the seat becomes available again | Pass |

## Test cases: login and permissions (KAN-11)

Tested in Chrome and Postman.

| ID | What I did | Expected | Result |
|---|---|---|---|
| TC-13 | Logged in with the correct email and password | Login works | Pass |
| TC-14 | Logged in with a wrong password | Error message, no login | Pass |
| TC-15 | Logged in as the operator and called `POST /api/bookings/hold` | 403, only passengers can hold seats | Pass |
| TC-16 | Called `GET /api/bookings/mine` without a token | 401 "Please log in" | Pass |
| TC-17 | Registered with an invalid email | Validation error | Pass |
| TC-18 | With PayHere on, called `POST /api/bookings/confirm` with a passenger token | 403, no ticket without paying | Pass |