import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import authStore from "../../stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = observer(({ children }: ProtectedRouteProps) => {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
});

export default ProtectedRoute;