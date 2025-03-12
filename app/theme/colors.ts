// app/theme/colors.ts
export const COLORS = {
    // Primary UI colors
    primary: "#3B82F6", // Blue primary accent (blue-500)
    secondary: "#6B7280", // Gray secondary accent (gray-500)
  
    // Background colors
    bgLight: "#F9FAFB", // Light background for light mode (gray-50)
    bgDark: "#111827", // Card/container background (gray-900)
    bgDarker: "#0F1629", // Map/chart background (darker than gray-900)
    bgHeader: "rgba(31, 41, 55, 0.7)", // Header background (gray-800/70)
    bgHover: "rgba(31, 41, 55, 0.5)", // Hover state (gray-800/50)
    bgButton: "rgba(31, 41, 55, 0.3)", // Button background (gray-800/30)
    bgMuted: "#F3F4F6", // Muted background (gray-100)
  
    // Border colors
    border: "#1F2937", // Border color (gray-800)
    borderLight: "#E5E7EB", // Light border color (gray-200)
    borderAccent: "#3B82F6", // Accent border (blue-500)
  
    // Text colors
    textPrimary: "#F3F4F6", // Primary text in dark mode (gray-200)
    textSecondary: "#D1D5DB", // Secondary text in dark mode (gray-300)
    textMuted: "#6B7280", // Muted text (gray-500)
    textAccent: "#60A5FA", // Accent text (blue-400)
    
    // Text colors for light mode
    textDark: "#1F2937", // Primary text in light mode (gray-800)
    textDarkSecondary: "#4B5563", // Secondary text in light mode (gray-600)
  
    // Status colors
    status: {
      approved: "#10B981", // Approved status (green-400)
      approvedBg: "rgba(6, 78, 59, 0.3)", // Approved bg (green-900/30)
      pending: "#FBBF24", // Pending/in-review status (yellow-400)
      pendingBg: "rgba(120, 53, 15, 0.3)", // Pending bg (yellow-900/30)
      rejected: "#F87171", // Rejected status (red-400)
      rejectedBg: "rgba(127, 29, 29, 0.3)" // Rejected bg (red-900/30)
    },
  
    // Chart colors
    chart: {
      primary: "#60A5FA", // Primary line/bar color (blue-400)
      secondary: "#94A3B8", // Secondary line/bar color (gray for monthly chart)
      tertiary: "#F59E0B", // Tertiary color (amber-500)
      grid: "#374151", // Grid lines (gray-700)
  
      // Blue shades for status pipeline chart
      inReview: "#93C5FD", // Lightest blue (blue-300)
      approved: "#60A5FA", // Light blue (blue-400)
      funded: "#3B82F6", // Medium blue (blue-500)
      closed: "#2563EB", // Dark blue (blue-600)
      rejected: "#1D4ED8" // Darkest blue (blue-700)
    }
  };
  
  // Helper function to get the appropriate class names for status badges
  export const getStatusColorClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_review':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'funded':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper function to get the appropriate text color class for status text
  export const getStatusTextColorClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'in_review':
      case 'pending':
        return 'text-yellow-600';
      case 'funded':
        return 'text-blue-600';
      case 'closed':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };