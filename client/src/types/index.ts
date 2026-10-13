export type Role = 'passenger' | 'operator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Bus {
  _id: string;
  operatorName: string;
  busNumber: string;
  type: 'Luxury AC' | 'Semi-luxury' | 'Normal';
  rows: number;
  layout: '2+2' | '2+3';
  amenities: string[];
}

export interface RouteInfo {
  _id: string;
  from: string;
  to: string;
}

export interface Trip {
  _id: string;
  bus: Bus;
  route: RouteInfo;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsLeft?: number;
}

export type SeatStatus = 'available' | 'held' | 'booked';

export interface Seat {
  id: string;
  status: SeatStatus;
}

export interface PaymentState {
  trip: Trip;
  seats: string[];
  bookingIds: string[];
  holdExpiresAt: string;
}

export interface PaymentConfig {
  provider: 'payhere' | 'demo';
  sandbox: boolean;
}

export interface OrderStatus {
  status: 'confirmed' | 'pending' | 'expired';
  trip: Trip;
  seats: string[];
  bookingIds: string[];
  holdExpiresAt?: string;
  ticketCode?: string;
}

/** One seat on one trip, as returned by /bookings/mine */
export interface Booking {
  _id: string;
  trip: Trip | null;
  seat: string;
  status: 'held' | 'confirmed' | 'cancelled';
  ticketCode?: string;
  createdAt: string;
}

export interface TicketState {
  ticketCode: string;
  trip: Trip;
  seats: string[];
  passengerName: string;
}
