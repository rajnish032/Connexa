import React from "react";

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <span className="bubble bubble-1"></span>
      <span className="bubble bubble-2"></span>
      <span className="bubble bubble-3"></span>
      <span className="bubble bubble-4"></span>
    </div>
  );
};

export default AnimatedBackground;
