// /utilities/errorHandling.ts
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
  
    constructor(message: string, statusCode: number, isOperational: boolean = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export const handleApiError = (error: unknown, defaultMessage: string = "An unexpected error occurred") => {
    if (error instanceof AppError) {
      return { error: error.message, status: error.statusCode };
    }
    
    console.error("Unhandled error:", error);
    return { error: defaultMessage, status: 500 };
  };