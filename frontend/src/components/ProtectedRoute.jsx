import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// <ProtectedRoute>            -> sirf logged-in users
// <ProtectedRoute adminOnly>  -> sirf admin
// NOTE: ye sirf screen chupata hai. Asli suraksha backend ke adminOnly middleware se hai.
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, authLoading } = useContext(AuthContext);
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-white text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;