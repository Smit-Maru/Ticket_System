import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../api/dashboardApi";
import "./Dashboard.css";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await getAdminDashboard();

        if (!response.success) {
          setError(response.message || "Unable to load dashboard data.");
          return;
        }

        setDashboardData(response.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const userCounts = dashboardData?.userCounts || [];
  const ticketCounts = dashboardData?.ticketCounts || [];

  const totalUsers = userCounts
    .filter((item) => item.role === "user")
    .reduce((total, item) => total + Number(item.total || 0), 0);

  const totalStaff = Number(
    dashboardData?.staffCount?.[0]?.total || 0,
  );

  const totalTickets = ticketCounts.reduce(
    (total, item) => total + Number(item.total || 0),
    0,
  );

  const openTickets = Number(
    ticketCounts.find((item) => item.status === "open")?.total || 0,
  );

  const inProgressTickets = Number(
    ticketCounts.find((item) => item.status === "in_progress")?.total || 0,
  );

  const waitingForUserTickets = Number(
    ticketCounts.find((item) => item.status === "waiting_for_user")?.total || 0,
  );

  const resolvedTickets = Number(
    ticketCounts.find((item) => item.status === "resolved")?.total || 0,
  );

  const closedTickets = Number(
    ticketCounts.find((item) => item.status === "closed")?.total || 0,
  );

  const unassignedTickets = Number(
    dashboardData?.unassignedCount?.[0]?.total || 0,
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your support ticket system.</p>
        </div>
      </div>

      {error && (
        <p className="dashboard-error" role="alert">
          {error}
        </p>
      )}

      {/* Main Statistics */}
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Users</h3>
          <p>{loading ? "..." : totalUsers}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Staff</h3>
          <p>{loading ? "..." : totalStaff}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Tickets</h3>
          <p>{loading ? "..." : totalTickets}</p>
        </div>

        <div className="dashboard-card">
          <h3>Unassigned Tickets</h3>
          <p>{loading ? "..." : unassignedTickets}</p>
        </div>
      </div>

      {/* Ticket Status */}
      <div className="dashboard-section">
        <h2>Ticket Status</h2>

        <div className="dashboard-status-grid">
          <div className="dashboard-status-card">
            <span>Open</span>
            <strong>{loading ? "..." : openTickets}</strong>
          </div>

          <div className="dashboard-status-card">
            <span>In Progress</span>
            <strong>{loading ? "..." : inProgressTickets}</strong>
          </div>

          <div className="dashboard-status-card">
            <span>Waiting for User</span>
            <strong>
              {loading ? "..." : waitingForUserTickets}
            </strong>
          </div>

          <div className="dashboard-status-card">
            <span>Resolved</span>
            <strong>{loading ? "..." : resolvedTickets}</strong>
          </div>

          <div className="dashboard-status-card">
            <span>Closed</span>
            <strong>{loading ? "..." : closedTickets}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;