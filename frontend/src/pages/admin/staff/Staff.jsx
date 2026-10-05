import { useEffect, useState } from "react";
import { deleteStaff, getStaff } from "../../../api/staffApi";
import { Link, useNavigate } from "react-router-dom";

function Staff() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStaff() {
      try {
        setLoading(true);
        setError("");
        const response = await getStaff();
        if (response.success) {
          setStaff(response.data);
        } else {
          setError(response.message || "Unable to load staff.");
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load staff.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this staff member?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await deleteStaff(id);

      if (response.success) {
        setStaff((previousStaff) =>
          previousStaff.filter((staffMember) => staffMember.userid !== id),
        );
        alert("Staff deleted successfully.");
      } else {
        alert(response.message);
      }
    } catch (requestError) {
      alert(requestError.response?.data?.message || "Unable to delete staff.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/staff/add?id=${id}`);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Staffs</h1>
          <p>Manage support staff.</p>
        </div>
        <Link className="admin-header-button" to="/admin/staff/add">
          Add Staff
        </Link>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5">Loading staff...</td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="5">{error}</td>
              </tr>
            )}

            {!loading && !error && staff.length === 0 && (
              <tr>
                <td colSpan="5">No staff found.</td>
              </tr>
            )}

            {!loading &&
              !error &&
              staff.map((staffMember) => (
                <tr key={staffMember.userid}>
                  <td>{staffMember.userid}</td>
                  <td>{staffMember.name}</td>
                  <td>{staffMember.email}</td>
                  <td>{staffMember.role}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(staffMember.userid)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(staffMember.userid)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Staff;
