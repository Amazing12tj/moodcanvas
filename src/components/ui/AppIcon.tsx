// src/components/ui/AppIcon.tsx
import React from "react";

interface AppIconProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <img
      src="/icons/icon-192.png"
      alt="MoodCanvas Icon"
      className={`${sizeClasses[size]} rounded-lg ${className}`}
    />
  );
};

export default AppIcon;
