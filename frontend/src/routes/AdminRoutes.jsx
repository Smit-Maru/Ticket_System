import { useRoutes } from "react-router-dom";

import Users from "../pages/admin/Users";
import Staff from "../pages/admin/Staff";
import Tickets from "../pages/admin/Tickets";
import TicketDetails from "../pages/admin/TicketDetails";
import Settings from "../pages/admin/Settings";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";

function AdminRoutes() {
  return useRoutes([
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "users", element: <Users /> },
        { path: "staff", element: <Staff /> },
        { path: "tickets", element: <Tickets /> },
        { path: "tickets/:id", element: <TicketDetails /> },
        { path: "settings", element: <Settings /> },
      ],
    },
  ]);
}

export default AdminRoutes;