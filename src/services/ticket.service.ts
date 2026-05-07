import api from './api.js';

export interface CreateTicketDto {
  title: string;
  description: string;
  category: 'challenge_bug' | 'test_case_error' | 'code_execution' | 'battle_issue' | 'account_issue' | 'feature_request' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  challengeId?: string;
  challengeTitle?: string;
}

export interface UpdateTicketDto {
  status?: 'open' | 'in_progress' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
}

export interface AddMessageDto {
  message: string;
}

export const ticketService = {
  // Create a new ticket
  createTicket: async (data: CreateTicketDto) => {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  // Get all tickets (admin)
  getAllTickets: async (filters?: { status?: string; category?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    
    const response = await api.get(`/tickets?${params.toString()}`);
    return response.data;
  },

  // Get my tickets (user)
  getMyTickets: async () => {
    const response = await api.get('/tickets/my-tickets');
    return response.data;
  },

  // Get ticket statistics (admin)
  getStatistics: async () => {
    const response = await api.get('/tickets/statistics');
    return response.data;
  },

  // Get single ticket
  getTicket: async (id: string) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Update ticket (admin)
  updateTicket: async (id: string, data: UpdateTicketDto) => {
    const response = await api.patch(`/tickets/${id}`, data);
    return response.data;
  },

  // Add message to ticket
  addMessage: async (id: string, data: AddMessageDto) => {
    const response = await api.post(`/tickets/${id}/messages`, data);
    return response.data;
  },

  // Delete ticket (admin)
  deleteTicket: async (id: string) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  },
};
