import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addTicketComment,
  getTicketComments,
  getTickets,
  updateTicket,
} from "../../api/ticketApi";
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
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [commentsTicket, setCommentsTicket] = useState(null);
  const [ticketComments, setTicketComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsSaving, setCommentsSaving] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    if (!commentsTicket) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setCommentsTicket(null);
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

  async function openComments(ticket) {
    setCommentsTicket(ticket);
    setTicketComments([]);
    setCommentDraft("");
    setCommentsError("");
    setCommentsLoading(true);

    try {
      const response = await getTicketComments(ticket.ticketid);

      if (!response.success) {
        throw new Error(response.message || "Unable to load comments.");
      }

      setTicketComments(response.data || []);
    } catch (requestError) {
      setCommentsError(
        requestError.response?.data?.message || requestError.message,
      );
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleAddComment(event) {
    event.preventDefault();
    const comment = commentDraft.trim();
    if (!commentsTicket || !comment) return;

    setCommentsSaving(true);
    setCommentsError("");

    try {
      const response = await addTicketComment(commentsTicket.ticketid, comment);

      if (!response.success) {
        throw new Error(response.message || "Unable to add comment.");
      }

      setTicketComments((currentComments) => [
        ...currentComments,
        response.data,
      ]);
      setCommentDraft("");
    } catch (requestError) {
      setCommentsError(
        requestError.response?.data?.message || requestError.message,
      );
    } finally {
      setCommentsSaving(false);
    }
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
                        disabled={ticket.status === "closed" || savingId === ticket.ticketid}
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

      {commentsTicket && (
        <div
          className="staff-comments-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setCommentsTicket(null);
          }}
        >
          <section
            className="staff-comments-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-comments-title"
          >
            <header className="staff-comments-header">
              <div>
                <span className="staff-detail-ticket-id">TICKET</span>
                <h2 id="staff-comments-title">Comments</h2>
                <p>{commentsTicket.subject}</p>
              </div>
              <button
                className="staff-comments-close"
                type="button"
                aria-label="Close comments"
                onClick={() => setCommentsTicket(null)}
              >
                Close
              </button>
            </header>

            <div className="staff-comments-list" aria-live="polite">
              {commentsLoading ? (
                <p className="staff-comments-state">Loading comments...</p>
              ) : commentsError && ticketComments.length === 0 ? (
                <p className="staff-ticket-error" role="alert">
                  {commentsError}
                </p>
              ) : ticketComments.length === 0 ? (
                <p className="staff-comments-state">
                  No comments yet. Add the first update below.
                </p>
              ) : (
                ticketComments.map((comment) => (
                  <article className="staff-comment" key={comment.commentid}>
                    <header>
                      <div>
                        <strong>{comment.authorName || "User"}</strong>
                        <span>{formatLabel(comment.authorRole)}</span>
                      </div>
                      <time dateTime={comment.commenton}>
                        {comment.commenton
                          ? new Intl.DateTimeFormat(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(comment.commenton))
                          : "Just now"}
                      </time>
                    </header>
                    <p>{comment.comment}</p>
                  </article>
                ))
              )}
            </div>

            {commentsError && ticketComments.length > 0 && (
              <p
                className="staff-ticket-error staff-comments-error"
                role="alert"
              >
                {commentsError}
              </p>
            )}

            <form className="staff-comment-form" onSubmit={handleAddComment}>
              <label htmlFor="staff-new-comment">Add a comment</label>
              <textarea
                id="staff-new-comment"
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Write an update for this ticket..."
                maxLength={5000}
                rows={4}
                required
              />
              <div className="staff-comment-form-footer">
                <span>{commentDraft.length}/5000</span>
                <button
                  type="submit"
                  disabled={commentsSaving || !commentDraft.trim()}
                >
                  {commentsSaving ? "Adding..." : "Add comment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default Tickets;
