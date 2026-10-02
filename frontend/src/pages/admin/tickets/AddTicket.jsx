import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  createTicket,
  getTicketById,
  updateTicket
} from "../../../api/ticketApi";
import "./AddTicket.css";
import { staffDropdown } from "../../../api/staffApi";

function AddTicket() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [staff, setStaff] = useState([]);
  const ticketId = searchParams.get("id");
  const isEditMode = Boolean(ticketId);

  const [form, setForm] = useState({
    subject: "",
    description: "",
    customerid: "",
    assignedto: "",
    priority: "low",
    status: "open",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      try {
        // Get staff list
        const staffResponse = await staffDropdown();
        console.log("Staffs : ",staffResponse);
        

        if (!staffResponse.success) {
          throw new Error(staffResponse.message || "Unable to get staff.");
        }

        setStaff(staffResponse.data);

        // Get ticket only in edit mode
        if (ticketId) {
          const ticketResponse = await getTicketById(ticketId);

          if (!ticketResponse.success) {
            throw new Error(ticketResponse.message || "Unable to get ticket.");
          }

          const ticket = ticketResponse.data;

          setForm({
            subject: ticket.subject || "",
            description: ticket.description || "",
            customerid: ticket.customerid || "",
            assignedto: ticket.assignedto || "",
            priority: ticket.priority?.toLowerCase() || "low",
            status: ticket.status || "open",
          });
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Something went wrong.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [ticketId]);
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const ticketData = {
      ...form,
      customerid: Number(form.customerid),
      assignedto: form.assignedto ? Number(form.assignedto) : null,
    };

    try {
      const response = isEditMode
        ? await updateTicket(ticketId, ticketData)
        : await createTicket(ticketData);

      if (!response.success) {
        throw new Error(
          response.message ||
            (isEditMode
              ? "Unable to update ticket."
              : "Unable to create ticket."),
        );
      }

      navigate("/admin/tickets");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="admin-header">
        <div>
          <h1>{isEditMode ? "Edit ticket" : "Add ticket"}</h1>
          <p>
            {isEditMode
              ? "Update the support ticket."
              : "Create a support ticket."}
          </p>
        </div>
      </div>

      {loading ? (
        <p>Loading ticket...</p>
      ) : (
        <form className="add-ticket-form" onSubmit={handleSubmit}>
          <div className="add-ticket-form-grid">
            <label>
              Subject
              <input
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                maxLength="255"
                required
              />
            </label>

            <label>
              Customer ID
              <input
                name="customerid"
                type="number"
                min="1"
                value={form.customerid}
                onChange={handleChange}
                required
                disabled={isEditMode}
              />
            </label>

            <label>
              Assigned staff
              <select
                name="assignedto"
                value={form.assignedto}
                onChange={handleChange}
              >
                <option key={`${null}`} value="">Unassigned</option>

                {staff.map((member) => (
                  <option key={member.userid} value={member.userid}>
                    {member.name}
                  </option>
                ))}
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

            {isEditMode && (
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
            )}

            <label className="add-ticket-description">
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
            <p className="add-ticket-error" role="alert">
              {error}
            </p>
          )}

          <div className="add-ticket-actions">
            <Link className="add-ticket-cancel" to="/admin/tickets">
              Cancel
            </Link>
            <button type="submit" disabled={saving}>
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update ticket"
                  : "Create ticket"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default AddTicket;
