import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";
import "./LogoutButton.css";

function LogoutButton({ className, children = "Logout" }) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to log out. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <button
        className={className}
        type="butto n"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-busy={isLoggingOut}
      >
        {isLoggingOut ? "Logging out..." : children}
      </button>
      {error && <span className="logout-error" role="alert">{error}</span>}
    </>
  );
}

export default LogoutButton;