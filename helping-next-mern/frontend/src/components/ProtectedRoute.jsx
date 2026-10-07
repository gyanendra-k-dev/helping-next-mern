import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Guards the Donor/Volunteer/Admin dashboard routes.
// - Not logged in  -> send to /login (and remember where they were going)
// - Logged in, but wrong role -> send to *their own* dashboard instead
//   of the one they tried to open (e.g. a donor hitting /dashboard/admin)
function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return children;
}

export default ProtectedRoute;
