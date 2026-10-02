import { NavLink } from "react-router-dom";

function StaffSidebar() {
  return (
    <aside className="staff-sidebar">
      <div className="staff-logo">
        <span>H</span>
        Helpdesk
      </div>

      <nav className="staff-nav" aria-label="Staff navigation">
        <NavLink to="/staff/dashboard">Dashboard</NavLink>
        <NavLink to="/staff/tickets">Tickets</NavLink>
        {/* <NavLink to="/staff/profile">Profile</NavLink> */}
      </nav>
    </aside>
  );
}

export default StaffSidebar;