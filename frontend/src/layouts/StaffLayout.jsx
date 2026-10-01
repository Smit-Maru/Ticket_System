import { Outlet } from "react-router-dom";
import "./StaffLayout.css";

function StaffLayout() {
  return (
    <div className="staff-layout">
      <aside className="staff-sidebar">
        <div className="staff-logo"><span>S</span> Supportly</div>
        <nav className="staff-nav" aria-label="Staff navigation">
          <a href="/staff/dashboard">Dashboard</a>
          <a href="/staff/tickets">Tickets</a>
          <a href="/staff/profile">Profile</a>
        </nav>
      </aside>
      <main className="staff-content"><Outlet /></main>
    </div>
  );
}

export default StaffLayout;
