import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentSession } from "../../api/authApi";

const roleDashboardPaths = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  user: "/user/dashboard",
};

function RequireRole({ role }) {
  const [session, setSession] = useState({
    status: "loading",
    role: null,
    error: "",
  });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const response = await getCurrentSession();
        const sessionRole = response.user?.role;

        if (!response.success || !roleDashboardPaths[sessionRole]) {
          throw new Error("Unable to verify your account role.");
        }

        if (isMounted) {
          setSession({ status: "authenticated", role: sessionRole, error: "" });
        }
      } catch (error) {
        if (!isMounted) return;

        if (error.response?.status === 401) {
          setSession({ status: "unauthenticated", role: null, error: "" });
          return;
        }

        setSession({
          status: "error",
          role: null,
          error:
            error.response?.data?.message ||
            error.message ||
            "Unable to verify your session.",
        });
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (session.status === "loading") {
    return <p role="status">Checking your session...</p>;
  }

  if (session.status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (session.status === "error") {
    return <p role="alert">{session.error}</p>;
  }

  if (session.role !== role) {
    return <Navigate to={roleDashboardPaths[session.role]} replace />;
  }

  return <Outlet />;
}

export default RequireRole;
