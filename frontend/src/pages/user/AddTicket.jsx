import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createTicket } from "../../api/ticketApi";
import "./Tickets.css";

function AddTicket() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await createTicket({ subject, description });

      if (!response.success) {
        throw new Error(response.message || "Unable to create your ticket.");
      }

      navigate("/user/tickets");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to create your ticket.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="user-tickets-page">
      <div className="user-tickets-heading">
        <div>
          <h1>New ticket</h1>
          <p>Tell us what you need help with.</p>
        </div>
      </div>

      <form className="user-ticket-form" onSubmit={handleSubmit}>
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
        {error && (
          <p className="user-ticket-error" role="alert">
            {error}
          </p>
        )}
        <div className="user-ticket-form-actions">
          <Link className="user-ticket-cancel-button" to="/user/tickets">
            Cancel
          </Link>
          <button
            className="user-ticket-add-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Submitting..." : "Submit ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddTicket;
