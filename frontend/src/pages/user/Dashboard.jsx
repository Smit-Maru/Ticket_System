import { useEffect, useState } from "react";
import "./Dashboard.css";
import { createTicket, getTickets } from "../../api/ticketApi";

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await getTickets();
        setTickets(response.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load tickets.");
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  async function handleCreateTicket(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await createTicket({ subject, description });

      if (!response.success) {
        throw new Error(response.message || "Unable to create ticket.");
      }

      setTickets((currentTickets) => [response.data, ...currentTickets]);
      setSubject("");
      setDescription("");
      setShowTicketForm(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const openTicketCount = tickets.filter((ticket) => ticket.status === "open").length;
  const resolvedTicketCount = tickets.filter((ticket) =>
    ["resolved", "closed"].includes(ticket.status),
  ).length;

  return (
    <main className="user-dashboard">
      <aside className="user-sidebar">
        <div className="user-brand">
          <span className="user-brand-mark">S</span>
          Supportly
        </div>
        <nav className="user-nav" aria-label="User navigation">
          <a className="active" href="#overview">Overview</a>
          <a href="#tickets">My tickets</a>
          <a href="#profile">Profile</a>
        </nav>
      </aside>

      <section className="user-main">
        <header className="user-topbar">
          <span>Customer workspace</span>
          <div className="user-avatar">MP</div>
        </header>

        <section className="user-heading" id="overview">
          <div>
            <h1>Welcome back, Maya</h1>
            <p>Here is a quick look at your support activity.</p>
          </div>
          <button
            className="user-action"
            type="button"
            onClick={() => setShowTicketForm((isVisible) => !isVisible)}
          >
            New ticket
          </button>
        </section>

        {showTicketForm && (
          <form className="ticket-create-form" onSubmit={handleCreateTicket}>
            <label>
              Subject
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength="255"
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <div>
              <button type="button" onClick={() => setShowTicketForm(false)}>Cancel</button>
              <button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create ticket"}
              </button>
            </div>
          </form>
        )}

        <section className="user-stats" aria-label="Ticket summary">
          <article className="user-stat">
            <span>Open tickets</span>
            <strong>{openTicketCount}</strong>
            <small>Needs your attention</small>
          </article>
          <article className="user-stat">
            <span>Resolved tickets</span>
            <strong>{resolvedTicketCount}</strong>
            <small>All time</small>
          </article>
          <article className="user-stat">
            <span>Average response</span>
            <strong>2h</strong>
            <small>Our team's average</small>
          </article>
        </section>

        <section className="user-panel" id="tickets">
          <div className="user-panel-heading">
            <div>
              <h2>Recent tickets</h2>
              <p>Track your latest support requests.</p>
            </div>
            <a className="user-action" href="#tickets">View all</a>
          </div>
          <div className="ticket-list">
            {error && !showTicketForm && <p role="alert">{error}</p>}
            {loading && <p>Loading tickets...</p>}
            {!loading && tickets.length === 0 && <p>No tickets found.</p>}
            {!loading && tickets.slice(0, 5).map((ticket) => (
              <div className="ticket-row" key={ticket.ticketid}>
                <div>
                  <strong>TK-{String(ticket.ticketid).padStart(4, "0")}</strong>
                  <span>{ticket.subject}</span>
                </div>
                <b className="ticket-status">{ticket.status.replaceAll("_", " ")}</b>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
