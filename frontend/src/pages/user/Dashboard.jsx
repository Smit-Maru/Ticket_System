import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../../api/ticketApi";
import "./Dashboard.css";

const ticketStatuses = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "waiting_for_user", label: "Waiting for user" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

const ticketPriorities = [
  { key: "high", label: "High priority" },
  { key: "medium", label: "Medium priority" },
  { key: "low", label: "Low priority" },
];

function getTicketCount(tickets, field, value) {
  return tickets.filter(
    (ticket) => ticket[field]?.toLowerCase() === value,
  ).length;
}

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await getTickets();

        if (!response.success) {
          setError(response.message || "Unable to load your tickets.");
          return;
        }

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
    <section className="user-dashboard">
      <div className="user-dashboard-heading">
        <div>
          <h1>My dashboard</h1>
          <p>A quick summary of your support tickets.</p>
        </div>
        <Link className="user-dashboard-action" to="/user/tickets/add">
          New ticket
        </Link>
      </div>

      {error && (
        <p className="user-dashboard-error" role="alert">
          {error}
        </p>
      )}

      <div className="user-dashboard-cards">
        <article className="user-dashboard-card">
          <span>Total tickets</span>
          <strong>{loading ? "..." : tickets.length}</strong>
        </article>
      </div>

      <section className="user-dashboard-panel">
        <div className="user-dashboard-panel-heading">
          <h2>Tickets by status</h2>
          <Link to="/user/tickets">View my tickets</Link>
        </div>
        <div className="user-dashboard-cards">
          {ticketStatuses.map(({ key, label }) => (
            <article className="user-dashboard-card" key={key}>
              <span>{label}</span>
              <strong>
                {loading ? "..." : getTicketCount(tickets, "status", key)}
              </strong>
            </article>
          ))}
        </div>
      </section>

      {/* <section className="user-dashboard-panel">
        <h2>Tickets by priority</h2>
        <div className="user-dashboard-cards">
          {ticketPriorities.map(({ key, label }) => (
            <article className="user-dashboard-card" key={key}>
              <span>{label}</span>
              <strong>
                {loading ? "..." : getTicketCount(tickets, "priority", key)}
              </strong>
            </article>
          ))}
        </div>
      </section> */}
    </section>
  );
}

export default Dashboard;
