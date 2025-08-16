import { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  variant?: "default" | "primary" | "success" | "danger" | "ghost";
};

const variantToClasses: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  default: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  success: "bg-green-500 text-white hover:bg-green-600",
  danger: "bg-red-500 text-white hover:bg-red-600",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
};

export function IconButton({ icon, label, variant = "default", className = "", ...props }: IconButtonProps) {
  const classes = `${variantToClasses[variant]} inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${className}`;
  return (
    <button aria-label={label} className={classes} {...props}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default IconButton;


