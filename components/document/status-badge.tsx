import React from 'react';

// Define status configurations with labels and colors
const statusConfig: Record<string, { label: string; color: string }> = {
  'unassigned': {
    label: 'Unassigned',
    color: 'bg-gray-200 text-gray-800'
  },
  'assigned': {
    label: 'Assigned',
    color: 'bg-blue-200 text-blue-800'
  },
  'reviewing': {
    label: 'Under Review',
    color: 'bg-yellow-200 text-yellow-800'
  },
  'approved': {
    label: 'Approved',
    color: 'bg-green-200 text-green-800'
  },
  'rejected': {
    label: 'Rejected',
    color: 'bg-red-200 text-red-800'
  }
};

// Define the size classes for different badge sizes
const sizeClasses: Record<string, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5'
};

// Define prop interface for the StatusBadge component
interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showLabel = true, 
  size = 'md',
  className = '',
  ...props 
}) => {
  // Get status info from config or use defaults if status not found
  const statusInfo = statusConfig[status] || {
    label: 'Unknown',
    color: 'bg-gray-200 text-gray-800'
  };
  
  // Combine class names for the badge
  const combinedClassName = [
    'inline-flex items-center rounded-full font-medium',
    statusInfo.color,
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={combinedClassName}
      {...props}
    >
      {showLabel && statusInfo.label}
    </div>
  );
};

export default StatusBadge;