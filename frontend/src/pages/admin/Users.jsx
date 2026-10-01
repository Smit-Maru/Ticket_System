import { useEffect, useState } from "react";
import { deleteUser, getUsers } from "../../api/userApi";
import { Link } from "react-router-dom";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUsers();

        if (response.success) {
          setUsers(response.data);
        } else {
          setError(response.message);
        }
      } catch (error) {
        console.error("Get Users Error:", error);

        if (error.response) {
          setError(error.response.data.message || "Unable to load users.");
        } else {
          setError("Something went wrong while fetching users.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await deleteUser(id);

      if (response.success) {
        setUsers((previousUsers) =>
          previousUsers.filter((user) => user.userid !== id),
        );

        alert("User deleted successfully.");
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Delete User Error:", error);

      if (error.response) {
        alert(error.response.data.message || "Unable to delete user.");
      } else {
        alert("Something went wrong while deleting user.");
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Users</h1>
          <p>Manage all users.</p>
        </div>

        <Link className="admin-header-button" to="/admin/users/add">
          Add User
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

            {!loading && !error && users.length === 0 && (
              <tr>
                <td colSpan="5">No users found.</td>
              </tr>
            )}

            {!loading &&
              !error &&
              users.map((user) => (
                <tr key={user.userid}>
                  <td>{user.userid}</td>

                  <td>{user.name}</td>

                  <td>{user.email}</td>

                  <td>{user.role}</td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        console.log("Edit user:", user.userid);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.userid)}
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

export default Users;
