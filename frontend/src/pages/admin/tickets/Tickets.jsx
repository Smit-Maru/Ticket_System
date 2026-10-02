import { useEffect, useState } from "react";
import {
  deleteTicket,
  getTickets,
  getTicketById,
} from "../../../api/ticketApi";
import { Link, useNavigate } from "react-router-dom";
import "./Tickets.css";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await getTickets();
        setTickets(response.data || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load tickets.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  async function handleDelete(ticketId) {
    if (!window.confirm("Are you sure you want to delete this ticket?")) {
      return;
    }

    try {
      const response = await deleteTicket(ticketId);

      if (response.success) {
        setTickets((currentTickets) =>
          currentTickets.filter((ticket) => ticket.ticketid !== ticketId),
        );
      } else {
        setError(response.message || "Unable to delete ticket.");
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete ticket.",
      );
    }
  }

  const handleEdit = (id) => {
    navigate(`/admin/tickets/add?id=${id}`);
  };

  const handleView = async (id) => {
    try {
      const response = await getTicketById(id);

      if (response.success) {
        setSelectedTicket(response.data);
        setIsPopUpOpen(true);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to get ticket details.",
      );
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Tickets</h1>
          <p>Manage customer support tickets.</p>
        </div>

        <Link className="admin-header-button" to="/admin/tickets/add">
          Add Ticket
        </Link>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Customer</th>
              <th>Assigned staff</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7">Loading tickets...</td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="7">{error}</td>
              </tr>
            )}

            {!loading && !error && tickets.length === 0 && (
              <tr>
                <td colSpan="7">No tickets found.</td>
              </tr>
            )}

            {!loading &&
              !error &&
              tickets.map((ticket) => (
                <tr key={ticket.ticketid}>
                  <td>{ticket.ticketid}</td>

                  <td>{ticket.subject}</td>

                  <td>{ticket.status.replaceAll("_", " ")}</td>

                  <td>{ticket.priority}</td>

                  <td>{ticket.customerid}</td>

                  <td>{ticket.assignedto || "Unassigned"}</td>

                  <td>
                    <button
                      className="view-btn"
                      type="button"
                      onClick={() => handleView(ticket.ticketid)}
                    >
                      View
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(ticket.ticketid)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      type="button"
                      onClick={() => handleDelete(ticket.ticketid)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isPopUpOpen && selectedTicket && (
        <div className="ticket-popup-overlay">
          <div className="ticket-popup">
            <div className="ticket-popup-header">
              <h2>Ticket Details</h2>

              <button
                type="button"
                className="ticket-popup-close"
                onClick={() => {
                  setIsPopUpOpen(false);
                  setSelectedTicket(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="ticket-popup-body">
              <div className="ticket-detail">
                <span>Ticket ID</span>
                <p>{selectedTicket.ticketid}</p>
              </div>

              <div className="ticket-detail">
                <span>Subject</span>
                <p>{selectedTicket.subject}</p>
              </div>

              <div className="ticket-detail">
                <span>Description</span>
                <p>{selectedTicket.description}</p>
              </div>

              <div className="ticket-detail">
                <span>Status</span>
                <p>{selectedTicket.status?.replaceAll("_", " ")}</p>
              </div>

              <div className="ticket-detail">
                <span>Priority</span>
                <p>{selectedTicket.priority}</p>
              </div>

              <div className="ticket-detail">
                <span>Customer ID</span>
                <p>{selectedTicket.customerid}</p>
              </div>

              <div className="ticket-detail">
                <span>Assigned Staff</span>
                <p>{selectedTicket.assignedto || "Unassigned"}</p>
              </div>

              <div className="ticket-detail">
                <span>Created At</span>
                <p>{selectedTicket.createdat}</p>
              </div>

              <div className="ticket-detail">
                <span>Assigned At</span>
                <p>{selectedTicket.assignedat || "Not assigned"}</p>
              </div>
            </div>

            <div className="ticket-popup-footer">
              <button
                type="button"
                onClick={() => {
                  setIsPopUpOpen(false);
                  setSelectedTicket(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
