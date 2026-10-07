import { useEffect, useState } from "react";
import {
  deleteTicket,
  getTickets,
  getTicketById,
} from "../../../api/ticketApi";
import { Link, useNavigate } from "react-router-dom";
import "./Tickets.css";
import TicketComments from "../../../components/tickets/TicketComments";

function formatTicketLabel(value = "") {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [commentsTicket, setCommentsTicket] = useState(null);

  const [search, setSearch] = useState("");

  // states for the filter
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState();
  // const [assignedStaff, setAssignedStaff] = useState();
  const [appliedFilter, setAppliedFilter] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      async function loadTickets() {
        try {
          setLoading(true);
          setError("");

          const response = await getTickets(
            search,
            status,
            priority,
            // assignedStaff,
          );
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
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search, appliedFilter]);

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

  function handleComments(ticket) {
    setCommentsTicket(ticket);
  }

  return (
    <div className="admin-tickets-page">
      <div className="admin-header">
        <div>
          <h1>Tickets</h1>
          <p>Manage customer support tickets.</p>
        </div>

        <Link className="admin-header-button" to="/admin/tickets/add">
          Add Ticket
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="ticket-search-filter">
        {/* Search */}
        <div className="ticket-search-section">
          <label htmlFor="ticket-search">Search</label>

          <div className="ticket-search-input-wrapper">
            <input
              id="ticket-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, subject, customer, or staff..."
            />
          </div>
        </div>

        {/* Filters */}
        <div className="ticket-filter-controls">
          <div className="ticket-filter-left">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_user">Waiting for User</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* <select
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
            >
              <option value="">All Staff</option>
              <option value="unassigned">Unassigned</option>
            </select> */}

            <button
              type="button"
              className="clear-filter-btn"
              onClick={() => {
                setStatus("");
                setPriority("");

                setAppliedFilter({
                  status: "",
                  priority: "",
                });

                // setAssignedStaff("");
              }}
            >
              Clear Filters
            </button>
          </div>

          <button
            type="button"
            className="filter-btn"
            onClick={() => {
              setAppliedFilter({
                status,
                priority,
                // assignedStaff,
              });
            }}
          >
            Filter
          </button>
        </div>
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

                  <td>
                    <span
                      className={`ticket-status-badge ticket-status-badge--${ticket.status || "unknown"}`}
                    >
                      {formatTicketLabel(ticket.status)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`ticket-priority-badge ticket-priority-badge--${ticket.priority?.toLowerCase() || "unknown"}`}
                    >
                      {formatTicketLabel(ticket.priority)}
                    </span>
                  </td>

                  <td>{ticket.customerName || "Unknown"}</td>

                  <td>{ticket.staffName || "Unassigned"}</td>
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
                      type="button"
                      onClick={() => handleEdit(ticket.ticketid)}
                      disabled={ticket.status === "closed"}
                    >
                      Edit
                    </button>

                    <button
                      className="comment-btn"
                      type="button"
                      disabled={ticket.status === "closed"}
                      onClick={() => handleComments(ticket)}
                    >
                      Add Comment
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
                <p>{selectedTicket.tickets.ticketid}</p>
              </div>

              <div className="ticket-detail">
                <span>Subject</span>
                <p>{selectedTicket.tickets.subject}</p>
              </div>

              <div className="ticket-detail">
                <span>Description</span>
                <p>{selectedTicket.tickets.description}</p>
              </div>

              <div className="ticket-detail">
                <span>Status</span>
                <p>
                  <span
                    className={`ticket-status-badge ticket-status-badge--${selectedTicket.tickets.status || "unknown"}`}
                  >
                    {formatTicketLabel(selectedTicket.tickets.status)}
                  </span>
                </p>
              </div>

              <div className="ticket-detail">
                <span>Priority</span>
                <p>
                  <span
                    className={`ticket-priority-badge ticket-priority-badge--${selectedTicket.tickets.priority?.toLowerCase() || "unknown"}`}
                  >
                    {formatTicketLabel(selectedTicket.tickets.priority)}
                  </span>
                </p>
              </div>

              <div className="ticket-detail">
                <span>Customer</span>
                <p>{selectedTicket.customer?.name || "Unknown"}</p>
              </div>

              <div className="ticket-detail">
                <span>Assigned Staff</span>
                <p>{selectedTicket.staff?.name || "Unassigned"}</p>
              </div>

              <div className="ticket-detail">
                <span>Created At</span>
                <p>{selectedTicket.tickets.createdat}</p>
              </div>

              <div className="ticket-detail">
                <span>Assigned At</span>
                <p>{selectedTicket.tickets.assignedat || "Not assigned"}</p>
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

      <TicketComments
        ticket={commentsTicket}
        onClose={() => setCommentsTicket(null)}
      />
    </div>
  );
}

export default Tickets;
