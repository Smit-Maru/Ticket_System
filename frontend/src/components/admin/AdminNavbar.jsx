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

        <button className="logout-btn">
          Logout
        </button>

      </div>

    </nav>
  );
}

export default AdminNavbar;