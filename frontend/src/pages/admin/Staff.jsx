import { useEffect, useState } from "react";
import { getStaff } from "../../api/staffApi";
import { Link } from "react-router-dom";

function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStaff(){
      try {
        const response = await getStaff();
        setStaff(response.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load staff.");
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, []);
  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Staffs</h1>
          <p>Manage support staff.</p>
        </div>
        <Link className="admin-header-button" to="/admin/users/add">
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
                <td colSpan="5">Loading users...</td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="5">{error}</td>
              </tr>
            )}

            {!loading && !error && staff.length === 0 && (
              <tr>
                <td colSpan="5">No users found.</td>
              </tr>
            )}

            {!loading && !error && staff.map((user) => (

              <tr key={user.userid}>
                <td>{user.userid}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button className="edit-btn">
                    Edit
                  </button>
                  <button className="delete-btn">
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