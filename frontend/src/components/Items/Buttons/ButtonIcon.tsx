import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonIconProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const ButtonIcon = ({
  children,
  className = "",
  ...props
}: ButtonIconProps) => (
  <button className={`text-white ${className}`} type="button" {...props}>
    {children}
  </button>
);