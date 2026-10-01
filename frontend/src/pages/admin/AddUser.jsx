import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "../../api/userApi";
import "./AddUser.css";

function AddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await createUser(form);
      if (!response.success) {
        throw new Error(response.message || "Unable to create user.");
      }
      navigate("/admin/users");
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="add-user-page">
      <div className="admin-header">
        <div>
          <h1>Add user</h1>
          <p>Create a new workspace account.</p>
        </div>
      </div>

      <form className="add-user-form" onSubmit={handleSubmit}>
        <div className="add-user-form-grid">
          <label>
            Full name
            <input name="name" type="text" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email address
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            password
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>
        </div>

        {error && <p className="add-user-error" role="alert">{error}</p>}

        <div className="add-user-actions">
          <Link className="add-user-cancel" to="/admin/users">Cancel</Link>
          <button type="submit" disabled={saving}>{saving ? "Creating..." : "Create user"}</button>
        </div>
      </form>
    </section>
  );
}

export default AddUser;
