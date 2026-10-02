import { useEffect, useState } from "react";
import { getTickets, updateTicket } from "../../api/ticketApi";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
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

  async function handleUpdate(ticketId) {
    setError("");
    setSavingId(ticketId);

    try {
      const ticket = tickets.find((currentTicket) => currentTicket.ticketid === ticketId);
      const response = await updateTicket(ticketId, {
        status: statuses[ticketId] || ticket.status,
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to update ticket.");
      }

      setTickets((currentTickets) =>
        currentTickets.map((currentTicket) =>
          currentTicket.ticketid === ticketId ? response.data : currentTicket,
        ),
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section>
      <h1>Assigned tickets</h1>
      <p>Your assigned tickets will appear here.</p>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p>No assigned tickets found.</p>
      ) : tickets.map((ticket) => (
        <article className="staff-panel" key={ticket.ticketid}>
          <h2>{ticket.subject}</h2>
          <p>{ticket.description}</p>
          <label>
            Status
            <select
              value={statuses[ticket.ticketid] || ticket.status}
              onChange={(event) =>
                setStatuses((currentStatuses) => ({
                  ...currentStatuses,
                  [ticket.ticketid]: event.target.value,
                }))
              }
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="waiting_for_user">Waiting for user</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <button
            type="button"
            disabled={savingId === ticket.ticketid}
            onClick={() => handleUpdate(ticket.ticketid)}
          >
            {savingId === ticket.ticketid ? "Saving..." : "Update status"}
          </button>
        </article>
      ))}
    </section>
  );
}

export default Tickets;