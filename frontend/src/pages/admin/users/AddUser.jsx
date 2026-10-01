import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  createUser,
  getUserById,
  updateUser,
} from "../../../api/userApi";
import "./AddUser.css";

function AddUser() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");

  const isEditMode = Boolean(userId);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      return;
    }

    async function fetchUser() {
      setLoading(true);
      setError("");

      try {
        const response = await getUserById(userId);

        if (!response.success) {
          throw new Error(
            response.message || "Unable to get user."
          );
        }

        const user = response.data;

        setForm({
          name: user.name || "",
          email: user.email || "",
          password: "",
          role: user.role || "user",
        });
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
          requestError.message ||
          "Unable to get user."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      let response;

      if (isEditMode) {
        response = await updateUser(userId, form);
      } else {
        response = await createUser(form);
      }

      if (!response.success) {
        throw new Error(
          response.message ||
          (isEditMode
            ? "Unable to update user."
            : "Unable to create user.")
        );
      }

      navigate("/admin/users");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.message ||
        "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="add-user-page">

      <div className="admin-header">
        <div>
          <h1>{isEditMode ? "Edit user" : "Add user"}</h1>

          <p>
            {isEditMode
              ? "Update the workspace account."
              : "Create a new workspace account."}
          </p>
        </div>
      </div>

      {loading ? (
        <p>Loading user...</p>
      ) : (
        <form
          className="add-user-form"
          onSubmit={handleSubmit}
        >
          <div className="add-user-form-grid">

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
                  isEditMode
                    ? "Leave empty to keep current password"
                    : ""
                }
              />
            </label>

          </div>

          {error && (
            <p className="add-user-error" role="alert">
              {error}
            </p>
          )}

          <div className="add-user-actions">

            <Link
              className="add-user-cancel"
              to="/admin/users"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update user"
                  : "Create user"}
            </button>

          </div>
        </form>
      )}

    </section>
  );
}

export default AddUser;