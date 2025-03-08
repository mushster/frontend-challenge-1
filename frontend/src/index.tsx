import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@mantine/core/styles.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

createRoot(document.getElementById("root")).render(<App />);
