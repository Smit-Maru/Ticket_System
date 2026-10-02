import { Link } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">

      <div className="sidebar-logo">
        Helpdesk
      </div>

      <div className="sidebar-menu">

        <Link to="/admin/dashboard">
          Dashboard
        </Link>

        <Link to="/admin/users">
          Users
        </Link>

        <Link to="/admin/staff">
          Staff
        </Link>

        <Link to="/admin/tickets">
          Tickets
        </Link>

        {/* <Link to="/admin/settings">
          Settings
        </Link> */}

      </div>

    </aside>
  );
}

export default AdminSidebar;