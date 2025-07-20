// types/bot.ts

export interface Bot {
    id: number; // or string, but make sure it's consistent!
    asset: string;
    start_size: number;
    start_type: "USDT" | "percent_equity";
    leverage: number;
    multiplier: number;
    take_profit: number;
    rebuy: number;
    current_position: number;
    unrealized_pnl: number;
    status: "Running" | "Stopped" | "Idle" | "Stopping";
}
