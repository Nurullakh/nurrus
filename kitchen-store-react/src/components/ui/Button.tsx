import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  className, 
  ...props 
}) => {
  return (
    <button
      className={clsx(
        "rounded-lg font-medium transition-all duration-200",
        {
          "bg-black text-white hover:bg-gray-800": variant === "primary",
          "bg-gray-200 text-black hover:bg-gray-300": variant === "secondary",
          "border border-black text-black hover:bg-gray-100": variant === "outline",
        },
        {
          "px-3 py-1 text-sm": size === "sm",
          "px-4 py-2 text-base": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
