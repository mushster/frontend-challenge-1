import { createBrowserRouter } from "react-router-dom";
import BasicLayout from "./layout/BasicLayout";
import NotFoundPage from "./pages/error/NotFound";
import MainPage from "./pages/index";
import ClaimsApprovalPage from "./pages/claims";
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <BasicLayout />,
    children: [
      {
        path: "/",
        element: <MainPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/claims",
        element: (
          <ProtectedRoute>
            <ClaimsApprovalPage />
          </ProtectedRoute>
        ),
      },
    ],
    errorElement: <NotFoundPage />,
  },
]);

export default router;
