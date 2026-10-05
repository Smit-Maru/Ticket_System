import LogoutButton from "../common/LogoutButton";
import "./UserNavbar.css";

function UserNavbar() {
  return (
    <header className="user-navbar">
      <div className="user-navbar__title">
        <span className="user-navbar__mark">H</span>
        <div>
          <strong>Helpdesk</strong>
          <span>Customer workspace</span>
        </div>
      </div>

      <div className="user-right">
        <LogoutButton className="user-logout" />
      </div>
    </header>
  );
}

export default UserNavbar;
