import React from "react";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="w-full bg-base-200 border-t border-base-300 py-6 px-4 text-center text-xs text-base-content/60 mt-auto">
      <div className="flex flex-wrap justify-center items-center gap-4 mb-2 font-medium">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>•</span>
        <Link to="/connections" className="hover:text-primary transition-colors">Connections</Link>
        <span>•</span>
        <Link to="/requests" className="hover:text-primary transition-colors">Requests</Link>
        <span>•</span>
        <Link to="/chat" className="hover:text-primary transition-colors">Chat</Link>
      </div>
      <p>© {new Date().getFullYear()} Connexa. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
