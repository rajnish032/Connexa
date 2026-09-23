import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useOutletContext } from "react-router";

const PublicRoute = ({ children, isAuthChecking: propAuthChecking }) => {
  const userData = useSelector((store) => store.user);
  const outletContext = useOutletContext();
  const isAuthChecking = propAuthChecking !== undefined ? propAuthChecking : outletContext?.isAuthChecking;

  if (isAuthChecking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (userData) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
