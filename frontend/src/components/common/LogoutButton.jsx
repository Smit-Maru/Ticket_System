import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";
import "./LogoutButton.css";

function LogoutButton({ className, children = "Logout" }) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  async function handleLogout() {
    setError("");
    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to log out. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-busy={isLoggingOut}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered ? "#dc2626" : "#ffffff",
          color: isHovered ? "#ffffff" : "#dc2626",
          border: "1px solid #dc2626",
          borderRadius: "6px",
          padding: "8px 14px",
          cursor: isLoggingOut ? "not-allowed" : "pointer",
          transition: "background-color 0.2s ease, color 0.2s ease",
        }}
      >
        {isLoggingOut ? "Logging out..." : children}
      </button>

      {error && (
        <span className="logout-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}

export default LogoutButton;