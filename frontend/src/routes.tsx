import { createBrowserRouter } from "react-router-dom";
import BasicLayout from "./layout/BasicLayout";
import NotFoundPage from "./pages/error/NotFound";
import MainPage from "./pages/index";
import ClaimsApprovalPage from "./pages/claims";
import LoginPage from "./pages/auth/LoginPage";
import MrfFilesPage from "./pages/mrf";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <BasicLayout />,
    children: [
      {
        path: "/",
        element: <LoginPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/home",
        element: <MainPage />,
      },
      {
        path: "/claims",
        element: (
          <ProtectedRoute>
            <ClaimsApprovalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/mrf-files",
        element: <MrfFilesPage />,
      },
    ],
    errorElement: <NotFoundPage />,
  },
]);

export default router;
