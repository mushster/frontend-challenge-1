import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";

export default function BasicLayout() {
  return (
    <div className="h-screen w-full flex flex-col">
      <Header />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
