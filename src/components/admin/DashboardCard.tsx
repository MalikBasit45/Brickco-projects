import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  isNegativeGood?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel = 'vs last month',
  isNegativeGood = false,
}) => {
  const isPositiveChange = change && change > 0;
  const isChangeGood = isNegativeGood ? !isPositiveChange : isPositiveChange;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-neutral-800">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-primary-50">
          {icon}
        </div>
      </div>
      
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {isPositiveChange ? (
            <ArrowUp 
              size={16} 
              className={`mr-1 ${isChangeGood ? 'text-success-500' : 'text-error-500'}`} 
            />
          ) : (
            <ArrowDown 
              size={16} 
              className={`mr-1 ${isChangeGood ? 'text-success-500' : 'text-error-500'}`} 
            />
          )}
          <span 
            className={`text-sm font-medium ${
              isChangeGood ? 'text-success-600' : 'text-error-600'
            }`}
          >
            {Math.abs(change)}% 
          </span>
          <span className="text-xs text-neutral-500 ml-1">{changeLabel}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;