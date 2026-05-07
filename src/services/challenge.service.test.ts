import { describe, expect, it } from 'vitest';
import { normalizeIdentifier, normalizeTicket, normalizeTicketStatus } from './challenge.service.js';

describe('challenge.service helpers', () => {
  it('normalizes ticket status aliases', () => {
    expect(normalizeTicketStatus('in_review')).toBe('in_progress');
    expect(normalizeTicketStatus('resolved')).toBe('closed');
    expect(normalizeTicketStatus('closed')).toBe('closed');
    expect(normalizeTicketStatus('unknown')).toBe('open');
  });

  it('normalizes identifiers from strings and mongo-like objects', () => {
    expect(normalizeIdentifier('abc123')).toBe('abc123');
    expect(normalizeIdentifier({ $oid: 'mongo-id' })).toBe('mongo-id');
    expect(normalizeIdentifier(null)).toBe('');
  });

  it('normalizes ticket payloads into a stable shape', () => {
    const ticket = normalizeTicket({
      _id: { $oid: 'ticket-1' },
      reporterId: 'user-1',
      reporterUsername: 'alice',
      subject: 'Broken challenge',
      useCase: 'report',
      description: 'Something is broken',
      status: 'in_review',
      challengeId: { $oid: 'challenge-9' },
      messages: [
        {
          username: 'alice',
          message: 'Please fix this',
          isAdmin: false,
          createdAt: '2026-04-26T12:00:00.000Z',
        },
      ],
    });

    expect(ticket._id).toBe('ticket-1');
    expect(ticket.ticketId).toBe('ticket-1');
    expect(ticket.challengeId).toBe('challenge-9');
    expect(ticket.status).toBe('in_progress');
    expect(ticket.messages?.[0]?.message).toBe('Please fix this');
  });
});