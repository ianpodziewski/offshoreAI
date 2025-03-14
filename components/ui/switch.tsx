"use client"

import * as React from "react"

interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <div
        ref={ref}
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        aria-disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-blue-600" : "bg-gray-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className || ""}`}
        onClick={handleClick}
        {...props}
      >
        <span
          data-state={checked ? "checked" : "unchecked"}
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch } 