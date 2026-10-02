import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTicketById } from "../../api/ticketApi";
import "./StaffTickets.css";

function formatLabel(value = "") {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function StaffTicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTicket() {
      try {
        const response = await getTicketById(id);

        if (!response.success) {
          throw new Error(response.message || "Unable to load ticket.");
        }

        setTicket(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [id]);

  return (
    <section className="staff-tickets-page">
      <div className="staff-detail-heading">
        <Link className="staff-back-link" to="/staff/tickets">&lt; Back to assigned tickets</Link>
        <span className="staff-detail-ticket-id">TICKET</span>
        <h1>Ticket details</h1>
      </div>

      {loading ? (
        <p className="staff-ticket-message">Loading ticket...</p>
      ) : error ? (
        <p className="staff-ticket-error" role="alert">{error}</p>
      ) : ticket ? (
        <article className="staff-detail-card">
          <h2>{ticket.subject}</h2>
          <p className="staff-detail-description">{ticket.description}</p>

          <dl className="staff-detail-grid">
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`staff-status-badge staff-status-badge--${ticket.status}`}>
                  {formatLabel(ticket.status)}
                </span>
              </dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>
                <span className={`staff-priority-badge staff-priority-badge--${ticket.priority?.toLowerCase()}`}>
                  {formatLabel(ticket.priority)}
                </span>
              </dd>
            </div>
            <div>
              <dt>Customer ID</dt>
              <dd>{ticket.customerid ?? "Not available"}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDate(ticket.createdat)}</dd>
            </div>
            <div>
              <dt>Assigned</dt>
              <dd>{formatDate(ticket.assignedat)}</dd>
            </div>
          </dl>
        </article>
      ) : null}
    </section>
  );
}

export default StaffTicketDetails;