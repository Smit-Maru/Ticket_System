import { useEffect, useState } from "react";
import { getStaffDashboard } from "../../api/dashboardApi";
import "../../layouts/StaffLayout.css";
import "./Dashboard.css";

const ticketStatuses = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "waiting_for_user", label: "Waiting for user" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

const ticketPriorities = [
  { key: "high", label: "High priority" },
  { key: "medium", label: "Medium priority" },
  { key: "low", label: "Low priority" },
];

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await getStaffDashboard();

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

  return (
    <section className="staff-dashboard">
      <h1>Staff dashboard</h1>
      <p>Manage your assigned customer support work.</p>

      {error && <p role="alert">{error}</p>}

      <div className="staff-cards">
        <article className="staff-card">
          <span>Assigned tickets</span>
          <strong>{loading ? "..." : dashboardData?.totalTickets ?? 0}</strong>
        </article>
      </div>

      <div className="staff-panel">
        <h2>Tickets by status</h2>
        <div className="staff-cards">
          {ticketStatuses.map(({ key, label }) => (
            <article className="staff-card" key={key}>
              <span>{label}</span>
              <strong>
                {loading ? "..." : dashboardData?.statusCounts?.[key] ?? 0}
              </strong>
            </article>
          ))}
        </div>
      </div>

      <div className="staff-panel">
        <h2>Tickets by priority</h2>
        <div className="staff-cards">
          {ticketPriorities.map(({ key, label }) => (
            <article className="staff-card" key={key}>
              <span>{label}</span>
              <strong>
                {loading ? "..." : dashboardData?.priorityCounts?.[key] ?? 0}
              </strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
