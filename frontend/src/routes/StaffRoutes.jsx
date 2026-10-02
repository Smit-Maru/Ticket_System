import { Navigate, Route, Routes } from "react-router-dom";
import StaffLayout from "../layouts/StaffLayout";
import Dashboard from "../pages/staff/Dashboard";
import Tickets from "../pages/staff/Tickets";
import Profile from "../pages/staff/Profile";

function StaffRoutes() {
  return (
    <Routes>
      <Route element={<StaffLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default StaffRoutes;
