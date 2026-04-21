import React from 'react';
import { TrendingUp } from 'lucide-react';  // ✅ Add this import

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  color = "indigo",
  trend 
}) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center text-green-600 text-sm">
          <TrendingUp size={16} className="mr-1" />
          +{trend}%
        </div>
      )}
    </div>
  );
}