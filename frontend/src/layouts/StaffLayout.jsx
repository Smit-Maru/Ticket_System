import { Outlet } from "react-router-dom";
import "./StaffLayout.css";
import StaffNavbar from "../components/staff/StaffNavbar";
import StaffSidebar from "../components/staff/StaffSidebar";

function StaffLayout() {
  return (
    <div className="staff-layout">

      <StaffSidebar />

      <div className="staff-main">

        <StaffNavbar />

        <main className="staff-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default StaffLayout;
