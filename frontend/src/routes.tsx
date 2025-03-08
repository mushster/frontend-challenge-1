import { createBrowserRouter } from "react-router-dom";
import BasicLayout from "./layout/BasicLayout";
import NotFoundPage from "./pages/error/NotFound";
import MainPage from "./pages/index";
import ClaimsApprovalPage from "./pages/claims";

const router = createBrowserRouter([
  {
    element: <BasicLayout />,
    children: [
      {
        path: "/",
        element: <MainPage />,
      },
      {
        path: "/claims",
        element: <ClaimsApprovalPage />,
      },
    ],
    errorElement: <NotFoundPage />,
  },
]);

export default router;
