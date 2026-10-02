import { useEffect, useState } from "react";
import {
  addTicketComment,
  getTicketComments,
} from "../../api/ticketApi";

function formatLabel(value = "") {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function TicketComments({ ticket, onClose }) {
  const [ticketComments, setTicketComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsSaving, setCommentsSaving] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    if (!ticket) return;

    async function loadComments() {
      setTicketComments([]);
      setCommentDraft("");
      setCommentsError("");
      setCommentsLoading(true);

      try {
        const response = await getTicketComments(ticket.ticketid);

        if (!response.success) {
          throw new Error(
            response.message || "Unable to load comments."
          );
        }

        setTicketComments(response.data || []);
      } catch (requestError) {
        setCommentsError(
          requestError.response?.data?.message ||
            requestError.message
        );
      } finally {
        setCommentsLoading(false);
      }
    }

    loadComments();
  }, [ticket]);

  async function handleAddComment(event) {
    event.preventDefault();

    const comment = commentDraft.trim();

    if (!ticket || !comment) return;

    setCommentsSaving(true);
    setCommentsError("");

    try {
      const response = await addTicketComment(
        ticket.ticketid,
        comment
      );

      if (!response.success) {
        throw new Error(
          response.message || "Unable to add comment."
        );
      }

      setTicketComments((currentComments) => [
        ...currentComments,
        response.data,
      ]);

      setCommentDraft("");
    } catch (requestError) {
      setCommentsError(
        requestError.response?.data?.message ||
          requestError.message
      );
    } finally {
      setCommentsSaving(false);
    }
  }

  if (!ticket) return null;

  return (
    <div
      className="staff-comments-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
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
            <span className="staff-detail-ticket-id">
              TICKET
            </span>

            <h2 id="staff-comments-title">
              Comments
            </h2>

            <p>{ticket.subject}</p>
          </div>

          <button
            className="staff-comments-close"
            type="button"
            aria-label="Close comments"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div
          className="staff-comments-list"
          aria-live="polite"
        >
          {commentsLoading ? (
            <p className="staff-comments-state">
              Loading comments...
            </p>
          ) : commentsError &&
            ticketComments.length === 0 ? (
            <p
              className="staff-ticket-error"
              role="alert"
            >
              {commentsError}
            </p>
          ) : ticketComments.length === 0 ? (
            <p className="staff-comments-state">
              No comments yet. Add the first update below.
            </p>
          ) : (
            ticketComments.map((comment) => (
              <article
                className="staff-comment"
                key={comment.commentid}
              >
                <header>
                  <div>
                    <strong>
                      {comment.authorName || "User"}
                    </strong>

                    <span>
                      {formatLabel(comment.authorRole)}
                    </span>
                  </div>

                  <time dateTime={comment.commenton}>
                    {comment.commenton
                      ? new Intl.DateTimeFormat(
                          undefined,
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        ).format(
                          new Date(comment.commenton)
                        )
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

        <form
          className="staff-comment-form"
          onSubmit={handleAddComment}
        >
          <label htmlFor="staff-new-comment">
            Add a comment
          </label>

          <textarea
            id="staff-new-comment"
            value={commentDraft}
            onChange={(event) =>
              setCommentDraft(event.target.value)
            }
            placeholder="Write an update for this ticket..."
            maxLength={5000}
            rows={4}
            required
          />

          <div className="staff-comment-form-footer">
            <span>
              {commentDraft.length}/5000
            </span>

            <button
              type="submit"
              disabled={
                commentsSaving ||
                !commentDraft.trim()
              }
            >
              {commentsSaving
                ? "Adding..."
                : "Add comment"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TicketComments;