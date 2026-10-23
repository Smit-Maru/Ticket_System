import { useEffect, useState } from "react";
import {
  deleteTicket,
  getTickets,
  getTicketById,
} from "../../../api/ticketApi";
import { staffDropdown } from "../../../api/staffApi";
import { Link, useNavigate } from "react-router-dom";
import "./Tickets.css";
import TicketComments from "../../../components/tickets/TicketComments";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

function formatTicketLabel(value = "") {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Tickets() {
  // No longer needed: TanStack Query manages tickets, loading, and errors.
  // const [tickets, setTickets] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentsTicket, setCommentsTicket] = useState(null);

  const [search, setSearch] = useState("");

  // Filter states
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedStaff, setAssignedStaff] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({
    status: "",
    priority: "",
    assignedStaff: "",
  });

  const [staff, setStaff] = useState([]);
  const [staffError, setStaffError] = useState("");
  const [actionError, setActionError] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // TanStack Query handles ticket fetching and caching.
  const {
    data: tickets = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "tickets",
      search,
      appliedFilter.status,
      appliedFilter.priority,
      appliedFilter.assignedStaff,
      page,
      limit,
    ],

    queryFn: async () => {
      const response = await getTickets(
        search,
        appliedFilter.status,
        appliedFilter.priority,
        page,
        limit,
        appliedFilter.assignedStaff
      );

      if (!response.success) {
        throw new Error(
          response.message || "Unable to load tickets."
        );
      }

      return response.data || [];
    },

    // Keep previous settings for the query defaults in queryClient.js.
  });

  // KEEP THIS useEffect: it loads staff dropdown options.
  // This is separate from ticket-list caching.
  useEffect(() => {
    let isMounted = true;

    async function loadStaff() {
      try {
        const response = await staffDropdown();

        if (!response.success || !Array.isArray(response.data)) {
          throw new Error(
            response.message || "Unable to load staff options."
          );
        }

        if (isMounted) {
          setStaff(response.data);
          setStaffError("");
        }
      } catch (requestError) {
        if (isMounted) {
          setStaffError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load staff options."
          );
        }
      }
    }

    loadStaff();

    return () => {
      isMounted = false;
    };
  }, []);

  // REMOVED: The old ticket-loading useEffect is not needed.
  // useQuery now fetches tickets whenever its queryKey changes.
  //
  // useEffect(() => {
  //   const timer = setTimeout(async () => {
  //     async function loadTickets() {
  //       try {
  //         setLoading(true);
  //         setError("");
  //
  //         const response = await getTickets(
  //           search,
  //           appliedFilter?.status ?? "",
  //           appliedFilter?.priority ?? "",
  //           page,
  //           limit,
  //           assignedStaff
  //         );
  //
  //         setTickets(response.data || []);
  //       } catch (requestError) {
  //         setError(
  //           requestError.response?.data?.message ||
  //             "Unable to load tickets."
  //         );
  //       } finally {
  //         setLoading(false);
  //       }
  //     }
  //
  //     loadTickets();
  //   }, 500);
  //
  //   return () => clearTimeout(timer);
  // }, [search, appliedFilter, page, limit]);

  async function handleDelete(ticketId) {
    if (!window.confirm("Are you sure you want to delete this ticket?")) {
      return;
    }

    try {
      const response = await deleteTicket(ticketId);

      if (response.success) {
        setActionError("");

        await queryClient.invalidateQueries({
          queryKey: ["tickets"],
        });
      } else {
        setActionError(
          response.message || "Unable to delete ticket."
        );
      }
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          "Unable to delete ticket."
      );
    }
  }

  const handleEdit = (id) => {
    navigate(`/admin/tickets/add?id=${id}`);
  };

  const handleView = async (id) => {
    try {
      setActionError("");

      const response = await getTicketById(id);

      if (response.success) {
        setSelectedTicket(response.data);
        setIsPopUpOpen(true);
      } else {
        setActionError(
          response.message || "Unable to get ticket details."
        );
      }
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          "Unable to get ticket details."
      );
    }
  };

  function handleComments(ticket) {
    setCommentsTicket(ticket);
  }

  function handleClearFilters() {
    setStatus("");
    setPriority("");
    setAssignedStaff("");
    setPage(1);

    setAppliedFilter({
      status: "",
      priority: "",
      assignedStaff: "",
    });
  }

  function handleApplyFilters() {
    setPage(1);

    setAppliedFilter({
      status,
      priority,
      assignedStaff,
    });
  }

  return (
    <div className="admin-tickets-page">
      <div className="admin-header">
        <div>
          <h1>Tickets</h1>
          <p>Manage customer support tickets.</p>
        </div>

        <Link className="admin-header-button" to="/admin/tickets/add">
          Add Ticket
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="ticket-search-filter">
        <div className="ticket-search-section">
          <label htmlFor="ticket-search">Search</label>

          <div className="ticket-search-input-wrapper">
            <input
              id="ticket-search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, subject, customer, or staff..."
            />
          </div>
        </div>

        <div className="ticket-filter-controls">
          <div className="ticket-filter-left">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_user">Waiting for User</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
            >
              <option value="">All Staff</option>
              <option value="unassigned">Unassigned</option>

              {staff.map((member) => (
                <option
                  key={member.userid}
                  value={String(member.userid)}
                >
                  {member.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="clear-filter-btn"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>

          <button
            type="button"
            className="filter-btn"
            onClick={handleApplyFilters}
          >
            Filter
          </button>
        </div>
      </div>

      {actionError && (
        <p role="alert">{actionError}</p>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Customer</th>
              <th>Assigned staff</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="7">Loading tickets...</td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan="7">
                  {error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load tickets."}
                </td>
              </tr>
            )}

            {!isLoading && !isError && tickets.length === 0 && (
              <tr>
                <td colSpan="7">No tickets found.</td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              tickets.map((ticket) => (
                <tr key={ticket.ticketid}>
                  <td>{ticket.ticketid}</td>
                  <td>{ticket.subject}</td>

                  <td>
                    <span
                      className={`ticket-status-badge ticket-status-badge--${ticket.status || "unknown"}`}
                    >
                      {formatTicketLabel(ticket.status)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`ticket-priority-badge ticket-priority-badge--${ticket.priority?.toLowerCase() || "unknown"}`}
                    >
                      {formatTicketLabel(ticket.priority)}
                    </span>
                  </td>

                  <td>{ticket.customerName || "Unknown"}</td>
                  <td>{ticket.staffName || "Unassigned"}</td>

                  <td>
                    <button
                      className="view-btn"
                      type="button"
                      onClick={() => handleView(ticket.ticketid)}
                    >
                      View
                    </button>

                    <button
                      className="edit-btn"
                      type="button"
                      onClick={() => handleEdit(ticket.ticketid)}
                      disabled={ticket.status === "closed"}
                    >
                      Edit
                    </button>

                    <button
                      className="comment-btn"
                      type="button"
                      disabled={ticket.status === "closed"}
                      onClick={() => handleComments(ticket)}
                    >
                      Add Comment
                    </button>

                    <button
                      className="delete-btn"
                      type="button"
                      onClick={() => handleDelete(ticket.ticketid)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <label>
          Rows per page
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </label>

        <label>No. of tickets: {tickets.length}</label>

        <div>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </button>

          <span>Page {page}</span>

          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={tickets.length < limit}
          >
            Next
          </button>
        </div>
      </div>

      {staffError && <p role="alert">{staffError}</p>}

      {isPopUpOpen && selectedTicket && (
        <div className="ticket-popup-overlay">
          <div className="ticket-popup">
            <div className="ticket-popup-header">
              <h2>Ticket Details</h2>

              <button
                type="button"
                className="ticket-popup-close"
                onClick={() => {
                  setIsPopUpOpen(false);
                  setSelectedTicket(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="ticket-popup-body">
              <div className="ticket-detail">
                <span>Ticket ID</span>
                <p>{selectedTicket.tickets.ticketid}</p>
              </div>

              <div className="ticket-detail">
                <span>Subject</span>
                <p>{selectedTicket.tickets.subject}</p>
              </div>

              <div className="ticket-detail">
                <span>Description</span>
                <p>{selectedTicket.tickets.description}</p>
              </div>

              <div className="ticket-detail">
                <span>Status</span>
                <p>
                  <span
                    className={`ticket-status-badge ticket-status-badge--${selectedTicket.tickets.status || "unknown"}`}
                  >
                    {formatTicketLabel(selectedTicket.tickets.status)}
                  </span>
                </p>
              </div>

              <div className="ticket-detail">
                <span>Priority</span>
                <p>
                  <span
                    className={`ticket-priority-badge ticket-priority-badge--${selectedTicket.tickets.priority?.toLowerCase() || "unknown"}`}
                  >
                    {formatTicketLabel(selectedTicket.tickets.priority)}
                  </span>
                </p>
              </div>

              <div className="ticket-detail">
                <span>Customer</span>
                <p>{selectedTicket.customer?.name || "Unknown"}</p>
              </div>

              <div className="ticket-detail">
                <span>Assigned Staff</span>
                <p>{selectedTicket.staff?.name || "Unassigned"}</p>
              </div>

              <div className="ticket-detail">
                <span>Created At</span>
                <p>{selectedTicket.tickets.createdat}</p>
              </div>

              <div className="ticket-detail">
                <span>Assigned At</span>
                <p>
                  {selectedTicket.tickets.assignedat || "Not assigned"}
                </p>
              </div>
            </div>

            <div className="ticket-popup-footer">
              <button
                type="button"
                onClick={() => {
                  setIsPopUpOpen(false);
                  setSelectedTicket(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <TicketComments
        ticket={commentsTicket}
        onClose={() => setCommentsTicket(null)}
      />
    </div>
  );
}

export default Tickets;