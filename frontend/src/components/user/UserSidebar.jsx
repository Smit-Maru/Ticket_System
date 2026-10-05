import { NavLink } from "react-router-dom";

function UserSidebar() {
  return (
    <aside className="user-sidebar">
      <div className="user-logo">
        <span>H</span>
        Helpdesk
      </div>

      <nav className="user-nav" aria-label="User navigation">
        <NavLink to="/user/dashboard">Dashboard</NavLink>
        <NavLink to="/user/tickets">Tickets</NavLink>
      </nav>
    </aside>
  );
}

export default UserSidebar;
