import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import UserDashboard from "./pages/user/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/users/Users";
import AddUser from "./pages/admin/users/AddUser";
import Staff from "./pages/admin/staff/Staff";
import AddStaff from "./pages/admin/staff/AddStaff";
import Tickets from "./pages/admin/tickets/Tickets";
import AddTicket from "./pages/admin/tickets/AddTicket";
import TicketDetails from "./pages/admin/tickets/TicketDetails";
import Settings from "./pages/admin/Settings";
import StaffLayout from "./layouts/StaffLayout";
import StaffDashboard from "./pages/staff/Dashboard";
import StaffTickets from "./pages/staff/Tickets";
import StaffProfile from "./pages/staff/Profile";
import StaffTicketDetails from "./pages/staff/StaffTicketDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="staff" element={<Staff />} />
          <Route path="staff/add" element={<AddStaff />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/add" element={<AddTicket />} />
          <Route path="tickets/:id" element={<TicketDetails />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="tickets" element={<StaffTickets />} />
          <Route path="tickets/:id" element={<StaffTicketDetails />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>

        <Route path="/user/dashboard" element={<UserDashboard />} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
