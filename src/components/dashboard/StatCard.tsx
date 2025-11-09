import React from 'react';
import { TrendingUp, TrendingDown, Users, Wallet, Receipt, PiggyBank } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: 'revenue' | 'expense' | 'profit' | 'clients';
}

const Icon = ({ icon, colorClass }: { icon: string; colorClass: string }) => {
    // FIX: Changed JSX.Element to React.ReactElement to avoid relying on a global JSX namespace.
    const icons: { [key: string]: React.ReactElement } = {
        revenue: <Wallet className="w-6 h-6 text-white" />,
        expense: <Receipt className="w-6 h-6 text-white" />,
        profit: <PiggyBank className="w-6 h-6 text-white" />,
        clients: <Users className="w-6 h-6 text-white" />,
    };

    return (
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icons[icon]}
        </div>
    );
};


export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
    const isPositive = change.startsWith('+');
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
    
    const iconColors: { [key: string]: string } = {
        revenue: 'bg-blue-500',
        expense: 'bg-red-500',
        profit: 'bg-green-500',
        clients: 'bg-yellow-500',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between transition-transform transform hover:-translate-y-1">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <p className={`text-xs ${changeColor} flex items-center`}>
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {change} par rapport au mois dernier
                </p>
            </div>
            <Icon icon={icon} colorClass={iconColors[icon]} />
        </div>
    );
};