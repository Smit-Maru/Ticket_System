import "./StaffNavbar.css";
import LogoutButton from "../common/LogoutButton";

function StaffNavbar() {
  return (
    <header className="staff-navbar">
      <div className="staff-navbar__title">
        <div>
          <strong>Helpdesk Staff</strong>
        </div>
      </div>

      <div className="staff-right">
        <span className="staff-name">Staff</span>
        <LogoutButton className="staff-logout">
          Log out
        </LogoutButton>
      </div>
    </header>
  );
}

export default StaffNavbar;