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
    current_price: number;
    unrealized_pnl: number;
    status: "Running" | "Stopped" | "Idle" | "Stopping";
    created_at: string;
    liq_price: number;
    take_profit_price: number;
    side: string;
    position_value: number;
}
