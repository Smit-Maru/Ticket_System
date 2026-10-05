import { Outlet } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import UserNavbar from "../components/user/UserNavbar";
import "./UserLayout.css";

function UserLayout() {
  return (
    <div className="user-layout">
      <UserSidebar />
      <div className="user-main">
        <UserNavbar />
        <main className="user-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
