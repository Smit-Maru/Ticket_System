import { Route, Routes } from "react-router-dom";
import StaffLayout from "../layouts/StaffLayout";
import Dashboard from "../pages/staff/Dashboard";

function StaffRoutes() {
  return (
    <Routes>
      <Route path="" element={<StaffLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<Dashboard />} />
        <Route path="profile" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default StaffRoutes;
