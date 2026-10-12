import { Navigate, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  // Authentication check is still in progress
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[var(--bg-main)] px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[var(--primary)] shadow-sm">
          <ShoppingBag size={28} />
        </div>

        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-[var(--primary)]" />

        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Checking authentication...
        </p>
      </div>
    );
  }

  // Redirect unauthenticated users to login and preserve the intended destination
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow authenticated users to access the route
  return children;
};

export default ProtectedRoute;