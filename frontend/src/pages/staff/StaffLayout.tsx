import { Outlet } from "react-router-dom";

export default function StaffLayout() {
  return (
    <div>
      <h2>Staff Panel</h2>
      <Outlet />
    </div>
  );
}