import React from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color?: 'amber' | 'green' | 'blue' | 'purple';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, color = 'amber' }) => {
    const colorClasses = {
        amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
        green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
        blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
        purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400'
    };

    const iconBgClasses = {
        amber: 'from-amber-500 to-orange-500 shadow-amber-500/30',
        green: 'from-green-500 to-emerald-500 shadow-green-500/30',
        blue: 'from-blue-500 to-cyan-500 shadow-blue-500/30',
        purple: 'from-purple-500 to-pink-500 shadow-purple-500/30'
    };

    return (
        <div className={`p-6 bg-gradient-to-br ${colorClasses[color]} rounded-2xl border transition-all hover:scale-105 duration-300 shadow-lg`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-xs uppercase font-bold text-white/60 mb-1 tracking-wider">{title}</p>
                    <p className="text-3xl font-black text-white">{value}</p>
                </div>
                <div className={`size-12 bg-gradient-to-br ${iconBgClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="material-symbols-outlined text-white fill-1">{icon}</span>
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.isPositive ? 'trending_up' : 'trending_down'}
                    </span>
                    <span className={`text-xs font-bold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.value}
                    </span>
                    <span className="text-xs text-white/40">vs mes anterior</span>
                </div>
            )}
        </div>
    );
};

export default KPICard;
