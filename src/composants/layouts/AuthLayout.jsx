import { Outlet } from "react-router-dom";
import HeaderConnexion from "./HeaderConnexion";

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderConnexion />

      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;