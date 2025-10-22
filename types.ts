export type TradeType = 'BUY' | 'SHORT';
export type TradeDirection = 'UP' | 'DOWN';

export interface ChargesInput {
  brokerageBuy: number;
  brokerageSell: number;
  sttPercentage: number;
  gstPercentage: number;
  stampDutyPercentage: number;
  exchangeChargePercentage: number;
}

export interface TradeInput {
  stock: string;
  tradeType: TradeType;
  entryPrice: number;
  quantity: number;
  expectedDirection: TradeDirection;
  stopLossPercentage?: number;
  targetPricePercentage?: number;
}

export interface PnlResult {
  grossPnl: number;
  netPnl: number;
  totalCharges: number;
  pnlPercentage: number;
  charges: {
    brokerage: number;
    stt: number;
    gst: number;
    stampDuty: number;
    exchange: number;
  };
}

export interface CalculatedTrade {
    quantity: number;
    positionValue: number;
    stopLoss: number;
    targetPrice: number;

    riskRewardRatio: string;
    capitalUsed: number;
    calculatePnl: (currentPrice: number) => PnlResult;
}

export interface Trade {
  id: number;
  stock: string;
  tradeType: TradeType;
  entryPrice: number;
  quantity: number;
  finalMarketPrice: number;
  stopLossPercentage?: number;
  targetPricePercentage?: number;
  stopLoss: number;
  targetPrice: number;
  riskRewardRatio: string;
  capitalUsed: number;
  grossPnl: number;
  netPnl: number;
  totalCharges: number;
  pnlPercentage: number;
  charges: PnlResult['charges'];
}