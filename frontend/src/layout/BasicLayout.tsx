import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";

export default function BasicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
} 