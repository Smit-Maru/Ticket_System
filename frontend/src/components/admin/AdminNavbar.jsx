import LogoutButton from "../common/LogoutButton";

function AdminNavbar() {
  return (
    <nav className="admin-navbar">

      <div className="navbar-title">
        Helpdesk Admin
      </div>

      <div className="navbar-right">

        <span className="admin-name">
          Admin
        </span>

        <LogoutButton className="logout-btn">
          Logout
        </LogoutButton>

      </div>

    </nav>
  );
}

export default AdminNavbar;