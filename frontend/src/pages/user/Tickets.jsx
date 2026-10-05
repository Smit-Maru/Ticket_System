import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../../api/ticketApi";
import TicketComments from "../../components/tickets/TicketComments";
import "./Tickets.css";

function formatLabel(value = "") {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
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
          requestError.response?.data?.message ||
            "Unable to load your tickets.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  return (
    <section className="user-tickets-page">
      <div className="user-tickets-heading">
        <div>
          <h1>My tickets</h1>
          <p>View and track your support requests.</p>
        </div>
        <Link className="user-ticket-add-button" to="/user/tickets/add">
          Add Ticket
        </Link>
      </div>

      {error && (
        <p className="user-ticket-error" role="alert">
          {error}
        </p>
      )}

      <div className="user-ticket-table-wrap">
        <table className="user-ticket-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Status</th>
              <th>Add comment</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="3">Loading your tickets...</td>
              </tr>
            )}
            {!loading && !error && tickets.length === 0 && (
              <tr>
                <td colSpan="3">You have not created any tickets yet.</td>
              </tr>
            )}
          </tbody>
          {!loading &&
            tickets.map((ticket) => (
              <tbody className="user-ticket-group" key={ticket.ticketid}>
                <tr className="user-ticket-summary-row">
                  <td className="user-ticket-subject">{ticket.subject}</td>
                  <td>
                    <span
                      className={`user-ticket-badge user-ticket-status--${ticket.status || "unknown"}`}
                    >
                      {formatLabel(ticket.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="user-ticket-comment-button"
                      type="button"
                      disabled={ticket.status === "closed"}
                      onClick={() => setCommentsTicket(ticket)}
                    >
                      Add comment
                    </button>
                  </td>
                </tr>
                <tr className="user-ticket-description-row">
                  <td colSpan="3">
                    <span>Description</span>
                    <p>{ticket.description || "No description provided."}</p>
                  </td>
                </tr>
              </tbody>
            ))}
        </table>
      </div>

      <TicketComments
        ticket={commentsTicket}
        onClose={() => setCommentsTicket(null)}
      />
    </section>
  );
}

export default Tickets;
