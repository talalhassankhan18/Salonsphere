
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon, trend }) => {
  const isTrendPositive = trend && trend > 0;
  
  return (
    <div className="glass p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover-lift">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {subValue && <p className="text-sm text-gray-500">{subValue}</p>}
        </div>
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50">
          {icon}
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          <div className={cn(
            "flex items-center space-x-1 text-sm",
            isTrendPositive ? "text-green-600" : "text-red-600"
          )}>
            {isTrendPositive ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
          <span className="text-xs text-gray-500 ml-2">from last month</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
