import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'blue' | 'green' | 'amber' | 'red';
  description?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant,
  description,
  onClick,
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
      badge: 'text-blue-700 bg-blue-100',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      iconBg: 'bg-green-600',
      iconColor: 'text-white',
      badge: 'text-green-700 bg-green-100',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      badge: 'text-amber-700 bg-amber-100',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      iconBg: 'bg-red-600',
      iconColor: 'text-white',
      badge: 'text-red-700 bg-red-100',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-white p-5 border shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              {value}
            </span>
            {description && (
              <span className="text-xs text-gray-500 font-medium">{description}</span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${variantStyles.iconBg} ${variantStyles.iconColor} shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
