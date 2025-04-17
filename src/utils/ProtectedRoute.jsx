import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = sessionStorage.getItem("token");
  const userRole = Number(sessionStorage.getItem("rol"));
  console.log(userRole);
  

  if (!token) {
    return <Navigate to="/" replace />; // Redirigir al login si no hay sesión
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/not-found" replace />; // Redirigir si el rol no tiene acceso
  }

  return <Outlet />; // Renderiza la página protegida
};

export default ProtectedRoute;
