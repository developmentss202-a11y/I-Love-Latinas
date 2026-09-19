
import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  let admin = null;

  try {
    admin = JSON.parse(
      localStorage.getItem("adminData") || "null"
    );
  } catch {
    admin = null;
  }

  if (!token || !admin || admin.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
