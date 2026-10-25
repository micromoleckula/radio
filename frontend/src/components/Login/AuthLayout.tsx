import { Link, Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="">
      <Link
        to="/"
        className=""
      >
        <span className="">
          Radio Pepe
        </span>
      </Link>

      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};