import "./Dashboard.css";

function Dashboard() {
  return (
    <main className="user-dashboard">
      <aside className="user-sidebar">
        <div className="user-brand">
          <span className="user-brand-mark">S</span>
          Supportly
        </div>
        <nav className="user-nav" aria-label="User navigation">
          <a className="active" href="#overview">Overview</a>
          <a href="#tickets">My tickets</a>
          <a href="#profile">Profile</a>
        </nav>
      </aside>

      <section className="user-main">
        <header className="user-topbar">
          <span>Customer workspace</span>
          <div className="user-avatar">MP</div>
        </header>

        <section className="user-heading" id="overview">
          <div>
            <h1>Welcome back, Maya</h1>
            <p>Here is a quick look at your support activity.</p>
          </div>
          <button className="user-action" type="button">＋ New ticket</button>
        </section>

        <section className="user-stats" aria-label="Ticket summary">
          <article className="user-stat">
            <span>Open tickets</span>
            <strong>2</strong>
            <small>Needs your attention</small>
          </article>
          <article className="user-stat">
            <span>Resolved tickets</span>
            <strong>8</strong>
            <small>All time</small>
          </article>
          <article className="user-stat">
            <span>Average response</span>
            <strong>2h</strong>
            <small>Our team's average</small>
          </article>
        </section>

        <section className="user-panel" id="tickets">
          <div className="user-panel-heading">
            <div>
              <h2>Recent tickets</h2>
              <p>Track your latest support requests.</p>
            </div>
            <a className="user-action" href="#tickets">View all</a>
          </div>
          <div className="ticket-list">
            <div className="ticket-row">
              <div><strong>TK-1048</strong><span>Cannot access billing portal</span></div>
              <b className="ticket-status">Open</b>
            </div>
            <div className="ticket-row">
              <div><strong>TK-1039</strong><span>Question about my subscription</span></div>
              <b className="ticket-status">In progress</b>
            </div>
            <div className="ticket-row">
              <div><strong>TK-1021</strong><span>Update account email address</span></div>
              <b className="ticket-status">Resolved</b>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
