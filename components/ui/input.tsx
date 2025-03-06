import * as React from "react";
import { cn } from "@/lib/utils";
import { Paperclip } from "lucide-react";

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

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * When true and if a file name is provided, a ChatGPT-like attachment bubble is displayed.
   */
  showBubble?: boolean;
  /**
   * The file name to display in the bubble.
   */
  fileName?: string;
  /**
   * Callback when the user clicks the remove button.
   */
  onRemoveFile?: () => void;
}

/**
 * File upload input component
 *
 * - The actual file input remains hidden.
 * - Uses an internal ref and exposes a `clear()` method via useImperativeHandle.
 * - Optionally displays a "ChatGPT-style" attachment bubble below the input.
 */
export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, type = "file", showBubble, fileName, onRemoveFile, ...props }, ref) => {
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
      <div className="w-full">
        {/* Hidden file input */}
        <input
          type={type}
          ref={internalRef}
          className={cn("hidden", className)}
          {...props}
        />

        {/* ChatGPT-style attachment bubble */}
        {showBubble && fileName && (
          <div className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm">
            <Paperclip className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-800">{fileName}</span>
            {onRemoveFile && (
              <button
                type="button"
                onClick={onRemoveFile}
                className="ml-4 text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);
FileInput.displayName = "FileInput";





// import * as React from "react";
// import { cn } from "@/lib/utils";

// export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// /**
//  * Plain text input component
//  */
// export const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   ({ className, type = "text", ...props }, ref) => {
//     return (
//       <input
//         type={type}
//         ref={ref}
//         className={cn(
//           "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//           className
//         )}
//         {...props}
//       />
//     );
//   }
// );
// Input.displayName = "Input";

// /**
//  * File upload input component
//  * 
//  * This version uses an internal ref and exposes a `clear()` method via useImperativeHandle.
//  * This allows parent components to clear the file input’s value after, for example, a form submission.
//  */
// export const FileInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
//   ({ className, type = "file", ...props }, ref) => {
//     const internalRef = React.useRef<HTMLInputElement>(null);

//     React.useImperativeHandle(
//       ref,
//       () =>
//         Object.assign(internalRef.current!, {
//           clear: () => {
//             if (internalRef.current) {
//               internalRef.current.value = "";
//             }
//           },
//         }),
//       []
//     );

//     return (
//       <input
//         type={type}
//         ref={internalRef}
//         className={cn(
//           "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//           className
//         )}
//         {...props}
//       />
//     );
//   }
// );
// FileInput.displayName = "FileInput";
