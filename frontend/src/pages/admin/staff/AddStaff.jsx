import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  createStaff,
  getStaffById,
  updateStaff,
} from "../../../api/staffApi";
import "./AddStaff.css";

function AddStaff() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const staffId = searchParams.get("id");
  const isEditMode = Boolean(staffId);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!staffId) {
      return;
    }

    async function fetchStaff() {
      setLoading(true);
      setError("");

      try {
        const response = await getStaffById(staffId);

        if (!response.success) {
          throw new Error(response.message || "Unable to get staff.");
        }

        setForm({
          name: response.data.name || "",
          email: response.data.email || "",
          password: "",
        });
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to get staff.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, [staffId]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = isEditMode
        ? await updateStaff(staffId, form)
        : await createStaff(form);

      if (!response.success) {
        throw new Error(
          response.message ||
            (isEditMode ? "Unable to update staff." : "Unable to create staff."),
        );
      }

      navigate("/admin/staff");
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
    <section className="add-staff-page">
      <div className="admin-header">
        <div>
          <h1>{isEditMode ? "Edit staff" : "Add staff"}</h1>
          <p>
            {isEditMode
              ? "Update the support staff account."
              : "Create a new support staff account."}
          </p>
        </div>
      </div>

      {loading ? (
        <p>Loading staff...</p>
      ) : (
        <form className="add-staff-form" onSubmit={handleSubmit}>
          <div className="add-staff-form-grid">
            <label>
              Full name
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email address
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required={!isEditMode}
                placeholder={
                  isEditMode ? "Leave empty to keep current password" : ""
                }
              />
            </label>
          </div>

          {error && (
            <p className="add-staff-error" role="alert">
              {error}
            </p>
          )}

          <div className="add-staff-actions">
            <Link className="add-staff-cancel" to="/admin/staff">
              Cancel
            </Link>
            <button type="submit" disabled={saving}>
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update staff"
                  : "Create staff"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default AddStaff;