// types/bot.ts

export interface Bot {
    id: number; // or string, but make sure it's consistent!
    asset: string;
    start_size: number;
    start_type: "USDT" | "percent_equity" | "qty";
    leverage: number;
    multiplier: number;
    take_profit: number;
    rebuy: number;
    avg_price: number;
    current_position: number;
    current_price: number;
    unrealized_pnl: number;
    status: "Running" | "Stopped" | "Idle" | "Stopping" | "Error" | "Graceful Stopping";
    created_at: string;
    liq_price: number;
    take_profit_price: number;
    side: string;
    position_value: number;
    transaction_log: TrxEntries[];
    max_rebuy: number;
    resonance: string | null;
    average_based: boolean;
}

export interface instrumentInfo {
    minQty: number;
    qtyStep: number;
    minValue: number;
    minLeverage: number;
    maxLeverage: number;
}

export interface TrxEntries {
    symbol: string;
    side: string;
    change: string;
    cash_balance: string;
    transactionTime: string;
}

export interface CreateBotPayload {
    asset: string;
    start_size: number;
    leverage: number;
    multiplier: number;
    take_profit: number;
    rebuy: number;
    max_rebuy: number;
    start_type: "USDT" | "percent_equity" | "qty";
    resonance: string | null;
    average_based: boolean;
}

export interface StopBotPayload {
    botId: number;
    type: "immediate" | "graceful";
}