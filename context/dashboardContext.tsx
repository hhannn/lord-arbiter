// context/DashboardContext.tsx
import { createContext, useContext } from "react";

interface DashboardData {
    equity: number;
    unrealizedPnl: number;
    time: string;
    dailyPnl: { date: string; pnl: number }[];
    transactionLog: { symbol: string; change: string; transactionTime: string; cashBalance: string }[];
}

export const DashboardContext = createContext<DashboardData | null>(null);

export const useDashboardData = () => {
    const context = useContext(DashboardContext);
    if (!context) throw new Error("DashboardContext not found");
    return context;
};
