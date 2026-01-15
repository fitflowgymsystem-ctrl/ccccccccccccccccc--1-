import React from 'react';
import { Users, Zap, DollarSign, Globe } from 'lucide-react';
import { ModernStatCard } from './ModernStatCard';

interface StatsOverviewProps {
  total: number;
  active: number;
  mrr: number;
  apiCalls?: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ total, active, mrr, apiCalls = 0 }) => {
  const formatAPICalls = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <ModernStatCard
        title="Total Fleet"
        value={total}
        icon={Globe}
        color="blue"
        trend="+2 this week"
      />
      <ModernStatCard
        title="Active Tenants"
        value={active}
        icon={Users}
        color="emerald"
        trend="98% uptime"
      />
      <ModernStatCard
        title="Est. MRR"
        value={`$${mrr.toLocaleString()}`}
        icon={DollarSign}
        color="purple"
        trend="+12% MoM"
      />
      <ModernStatCard
        title="API Traffic"
        value={formatAPICalls(apiCalls)}
        icon={Zap}
        color="amber"
        trend="Healthy"
      />
    </div>
  );
};