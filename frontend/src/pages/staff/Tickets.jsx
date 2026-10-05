import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets, updateTicket } from "../../api/ticketApi";
import TicketComments from "../../components/tickets/TicketComments";
import "./StaffTickets.css";

const ticketStatuses = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "waiting_for_user", label: "Waiting for user" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function formatLabel(value = "") {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
      }).format(date);
}

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [commentsTicket, setCommentsTicket] = useState(null);

  useEffect(() => {
    if (!commentsTicket) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setCommentsTicket(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [commentsTicket]);

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

  async function handleUpdate(ticketId) {
    setError("");
    setSavingId(ticketId);

    try {
      const ticket = tickets.find(
        (currentTicket) => currentTicket.ticketid === ticketId,
      );

      const response = await updateTicket(ticketId, {
        status: statuses[ticketId] || ticket.status,
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to update ticket.");
      }

      const updatedTickets = await getTickets();

      setTickets(updatedTickets.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    } finally {
      setSavingId(null);
    }
  }

  function openComments(ticket) {
    setCommentsTicket(ticket);
  }

  return (
    <section className="staff-tickets-page">
      <div className="staff-page-heading">
        <div>
          <span className="staff-eyebrow">WORK QUEUE</span>

          <h1>Assigned tickets</h1>

          <p>Review ticket details and keep customers up to date.</p>
        </div>

        {!loading && !error && (
          <span className="staff-ticket-count">{tickets.length} tickets</span>
        )}
      </div>

      {error && (
        <p className="staff-ticket-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="staff-ticket-message">Loading tickets...</p>
      ) : error ? null : tickets.length === 0 ? (
        <div className="staff-ticket-empty">
          <h2>No assigned tickets</h2>

          <p>Tickets assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="staff-ticket-table-wrap">
          <table className="staff-ticket-table">
            <thead>
              <tr>
                <th scope="col">Ticket</th>
                <th scope="col">Status</th>
                <th scope="col">Priority</th>
                <th scope="col">Created</th>
                <th scope="col">Update status</th>
                <th scope="col">Comments</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.ticketid}>
                  <td className="staff-ticket-subject" data-label="Ticket">
                    <strong>{ticket.subject}</strong>

                    <span>{ticket.description}</span>
                  </td>

                  <td data-label="Status">
                    <span
                      className={`staff-status-badge staff-status-badge--${ticket.status}`}
                    >
                      {formatLabel(ticket.status)}
                    </span>
                  </td>

                  <td data-label="Priority">
                    <span
                      className={`staff-priority-badge staff-priority-badge--${ticket.priority?.toLowerCase()}`}
                    >
                      {formatLabel(ticket.priority)}
                    </span>
                  </td>

                  <td className="staff-ticket-date" data-label="Created">
                    {formatDate(ticket.createdat)}
                  </td>

                  <td data-label="Update status">
                    <div className="staff-status-controls">
                      <label
                        className="staff-visually-hidden"
                        htmlFor={`status-${ticket.ticketid}`}
                      >
                        Set status for ticket {ticket.ticketid}
                      </label>

                      <select
                        id={`status-${ticket.ticketid}`}
                        className="staff-status-select"
                        value={statuses[ticket.ticketid] || ticket.status}
                        disabled={ticket.status === "closed"}
                        onChange={(event) =>
                          setStatuses((currentStatuses) => ({
                            ...currentStatuses,
                            [ticket.ticketid]: event.target.value,
                          }))
                        }
                      >
                        {ticketStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>

                      <button
                        className="staff-status-save"
                        type="button"
                        disabled={
                          ticket.status === "closed" ||
                          savingId === ticket.ticketid
                        }
                        onClick={() => handleUpdate(ticket.ticketid)}
                      >
                        {savingId === ticket.ticketid ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </td>

                  <td data-label="Comments">
                    <button
                      className="staff-comments-open"
                      type="button"
                      disabled={ticket.status === "closed"}
                      onClick={() => openComments(ticket)}
                    >
                      Comments
                    </button>
                  </td>

                  <td data-label="Actions">
                    <Link
                      className="staff-view-ticket"
                      to={`/staff/tickets/${ticket.ticketid}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TicketComments
        ticket={commentsTicket}
        onClose={() => setCommentsTicket(null)}
      />
    </section>
  );
}

export default Tickets;
