import crypto from 'crypto';

export function newTicketCode(): string {
  return `SLK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}
