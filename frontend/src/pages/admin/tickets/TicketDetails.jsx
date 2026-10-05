import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getTicketById, updateTicket } from "../../../api/ticketApi";

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    status: "open",
    priority: "low",
    assignedto: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTicket() {
      try {
        const response = await getTicketById(id);

        if (!response.success) {
          throw new Error(response.message || "Unable to load ticket.");
        }

        setTicket(response.data);
        setForm({
          subject: response.data.subject,
          description: response.data.description,
          status: response.data.status,
          priority: response.data.priority,
          assignedto: response.data.assignedto || "",
        });
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await updateTicket(id, {
        ...form,
        assignedto: form.assignedto || null,
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to update ticket.");
      }

      navigate("/admin/tickets");
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="admin-header">
        <div>
          <h1>Ticket details</h1>
          <p>Review and update the selected support ticket.</p>
        </div>
        <Link className="add-user-cancel" to="/admin/tickets">
          Back to tickets
        </Link>
      </div>

      {loading ? (
        <p>Loading ticket...</p>
      ) : (
        ticket && (
          <form className="add-user-form" onSubmit={handleSubmit}>
            <div className="add-user-form-grid">
              <label>
                Subject
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Assigned staff ID
                <input
                  name="assignedto"
                  type="number"
                  min="1"
                  value={form.assignedto}
                  onChange={handleChange}
                />
              </label>
              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="waiting_for_user">Waiting for user</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label>
                Priority
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            {error && (
              <p className="add-user-error" role="alert">
                {error}
              </p>
            )}

            <div className="add-user-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )
      )}
    </section>
  );
}

export default TicketDetails;
