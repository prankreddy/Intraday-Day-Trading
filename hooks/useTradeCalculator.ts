import { useMemo } from 'react';
import type { TradeInput, PnlResult, ChargesInput } from '../types';

export const useTradeCalculator = (tradeInput: TradeInput | null, chargesInput: ChargesInput | null) => {
    const calculatedTrade = useMemo(() => {
        if (!tradeInput || !chargesInput) return null;

        const { entryPrice, quantity, tradeType, stopLossPercentage: customSlPercent, targetPricePercentage: customTpPercent } = tradeInput;

        const capitalUsed = quantity * entryPrice;
        const positionValue = capitalUsed;
        
        const stopLossPercentage = customSlPercent ?? 3;
        const targetPercentage = customTpPercent ?? 10;

        const stopLoss = tradeType === 'BUY' 
            ? entryPrice * (1 - stopLossPercentage / 100)
            : entryPrice * (1 + stopLossPercentage / 100);
        
        const targetPrice = tradeType === 'BUY'
            ? entryPrice * (1 + targetPercentage / 100)
            : entryPrice * (1 - targetPercentage / 100);

        const riskPerShare = Math.abs(entryPrice - stopLoss);
        const rewardPerShare = Math.abs(targetPrice - entryPrice);
        const riskRewardRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : "∞";

        const calculatePnl = (currentPrice: number): PnlResult => {
            const priceDiff = currentPrice - entryPrice;
            const grossPnl = tradeType === 'BUY' ? priceDiff * quantity : -priceDiff * quantity;

            const buyTurnover = positionValue;
            const sellTurnover = quantity * currentPrice;
            
            const brokerage = chargesInput.brokerageBuy + chargesInput.brokerageSell;
            const stt = (sellTurnover * chargesInput.sttPercentage) / 100;
            const stampDuty = (buyTurnover * chargesInput.stampDutyPercentage) / 100;
            const exchange = ((buyTurnover + sellTurnover) * chargesInput.exchangeChargePercentage) / 100;
            const taxableCharges = brokerage + exchange;
            const gst = (taxableCharges * chargesInput.gstPercentage) / 100;
            const totalCharges = brokerage + stt + gst + stampDuty + exchange;
            const netPnl = grossPnl - totalCharges;
            
            const pnlPercentage = capitalUsed > 0 ? (netPnl / capitalUsed) * 100 : 0;

            return {
                grossPnl,
                netPnl,
                totalCharges,
                pnlPercentage,
                charges: { brokerage, stt, gst, stampDuty, exchange }
            };
        };

        return {
            quantity,
            positionValue,
            stopLoss: parseFloat(stopLoss.toFixed(2)),
            targetPrice: parseFloat(targetPrice.toFixed(2)),
            riskRewardRatio: `1:${riskRewardRatio}`,
            capitalUsed,
            calculatePnl
        };

    }, [tradeInput, chargesInput]);

    return calculatedTrade;
};