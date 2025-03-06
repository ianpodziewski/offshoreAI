import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Plain text input component
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

/**
 * File upload input component
 * 
 * This version uses an internal ref and exposes a `clear()` method via useImperativeHandle.
 * This allows parent components to clear the file input’s value after, for example, a form submission.
 */
export const FileInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "file", ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(
      ref,
      () =>
        Object.assign(internalRef.current!, {
          clear: () => {
            if (internalRef.current) {
              internalRef.current.value = "";
            }
          },
        }),
      []
    );

    return (
      <input
        type={type}
        ref={internalRef}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
FileInput.displayName = "FileInput";





// import * as React from "react";
// import { cn } from "@/lib/utils";

// export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// // Plain text input component
// export const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   ({ className, type = "text", ...props }, ref) => {
//     return (
//       <input
//         type={type}
//         className={cn(
//           "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//           className
//         )}
//         ref={ref}
//         {...props}
//       />
//     );
//   }
// );
// Input.displayName = "Input";

// // File upload input component
// export const FileInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
//   ({ className, type = "file", ...props }, ref) => {
//     return (
//       <input
//         type={type}
//         className={cn(
//           "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//           className
//         )}
//         ref={ref}
//         {...props}
//       />
//     );
//   }
// );
// FileInput.displayName = "FileInput";
