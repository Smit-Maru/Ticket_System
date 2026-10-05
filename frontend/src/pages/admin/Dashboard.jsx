// import AdminHeader from "../../components/admin/AdminHeader";

function Dashboard() {
  return (
    <div>
      {/* <AdminHeader
        title="Dashboard"
        description="Welcome to the admin dashboard."
      /> */}

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Users</h3>
          <p>120</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Staff</h3>
          <p>15</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Tickets</h3>
          <p>350</p>
        </div>

        <div className="dashboard-card">
          <h3>Open Tickets</h3>
          <p>45</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
