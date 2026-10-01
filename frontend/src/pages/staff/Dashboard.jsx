import "../../layouts/StaffLayout.css";

function Dashboard() {
  return (
    <section>
      <h1>Staff dashboard</h1>
      <p>Manage your assigned customer support work.</p>
      <div className="staff-cards">
        <article className="staff-card"><span>Assigned tickets</span><strong>12</strong></article>
        <article className="staff-card"><span>Open tickets</span><strong>7</strong></article>
        <article className="staff-card"><span>Resolved this week</span><strong>18</strong></article>
      </div>
      <div className="staff-panel"><h2>Today&apos;s work</h2><p>Your assigned tickets and recent activity will appear here.</p></div>
    </section>
  );
}

export default Dashboard;
