import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface VerificationBadgeProps {
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  switch (status) {
    case 'verified':
      return (
        <CheckCircle 
          className={`text-blue-500 ${sizeClasses[size]}`} 
          title="Verified Profile"
        />
      );
    case 'pending':
      return (
        <Clock 
          className={`text-yellow-500 ${sizeClasses[size]}`} 
          title="Verification Pending"
        />
      );
    case 'rejected':
      return (
        <XCircle 
          className={`text-red-500 ${sizeClasses[size]}`} 
          title="Verification Failed"
        />
      );
    default:
      return null;
  }
};

export default VerificationBadge;