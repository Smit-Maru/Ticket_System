import "./StaffNavbar.css";

function StaffNavbar() {
  return (
    <header className="staff-navbar">
      <div className="staff-navbar__title">
        <div>
          <strong>Helpdesk Staff</strong>
          {/* <span>Support workspace</span> */}
        </div>
      </div>

      <div className="staff-right">
        <span className="staff-name">Staff</span>
        <button className="staff-logout" type="button">Log out</button>
      </div>
    </header>
  );
}

export default StaffNavbar;