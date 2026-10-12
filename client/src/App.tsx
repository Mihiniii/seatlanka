import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import Seats from './pages/Seats';
import Payment from './pages/Payment';
import PaymentReturn from './pages/PaymentReturn';
import Ticket from './pages/Ticket';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/trips/:tripId/seats" element={<Seats />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/payment/return/:orderId" element={<PaymentReturn />} />
      <Route path="/payment/cancel/:orderId" element={<PaymentReturn cancelled />} />
      <Route path="/ticket" element={<Ticket />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
