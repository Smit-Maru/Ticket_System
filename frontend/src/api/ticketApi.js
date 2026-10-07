import apiClient from "./apiClient";

export const getTickets = async (search = "",status="", priority="") => {
  const response = await apiClient.get("/tickets", {
    params: {
      search,
      status,
      priority,
      // assignedStaff
    },
  });

  return response.data;
};

export const getTicketById = async (ticketId) => {
  const response = await apiClient.get(`/tickets/${ticketId}`);

  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await apiClient.post("/tickets", ticketData);

  return response.data;
};

export const updateTicket = async (ticketId, ticketData) => {
  const response = await apiClient.put(`/tickets/${ticketId}`, ticketData);

  return response.data;
};

export const getTicketComments = async (ticketId) => {
  const response = await apiClient.get(`/comment/ticket/${ticketId}`);

  return response.data;
};

export const addTicketComment = async (ticketId, comment) => {
  const response = await apiClient.post(`/comment/ticket/${ticketId}`, {
    comment,
  });

  return response.data;
};

export const deleteTicket = async (ticketId) => {
  const response = await apiClient.delete(`/tickets/${ticketId}`);

  return response.data;
};
