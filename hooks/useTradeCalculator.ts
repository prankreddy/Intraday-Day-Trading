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
            
            const { brokerageBuy, brokerageSell, stt, stampDuty, exchangeCharge, gst } = chargesInput;
            
            const buyBrokerage = brokerageBuy.isPercentage ? (buyTurnover * brokerageBuy.value) / 100 : brokerageBuy.value;
            const sellBrokerage = brokerageSell.isPercentage ? (sellTurnover * brokerageSell.value) / 100 : brokerageSell.value;
            const brokerage = buyBrokerage + sellBrokerage;

            const sttAmount = stt.isPercentage ? (sellTurnover * stt.value) / 100 : stt.value;
            const stampDutyAmount = stampDuty.isPercentage ? (buyTurnover * stampDuty.value) / 100 : stampDuty.value;
            const exchangeAmount = exchangeCharge.isPercentage ? ((buyTurnover + sellTurnover) * exchangeCharge.value) / 100 : exchangeCharge.value;
            
            const taxableCharges = brokerage + exchangeAmount;
            const gstAmount = gst.isPercentage ? (taxableCharges * gst.value) / 100 : gst.value;
            
            const totalCharges = brokerage + sttAmount + gstAmount + stampDutyAmount + exchangeAmount;
            const netPnl = grossPnl - totalCharges;
            
            const pnlPercentage = capitalUsed > 0 ? (netPnl / capitalUsed) * 100 : 0;

            return {
                grossPnl,
                netPnl,
                totalCharges,
                pnlPercentage,
                charges: { 
                    brokerage, 
                    stt: sttAmount, 
                    gst: gstAmount, 
                    stampDuty: stampDutyAmount, 
                    exchange: exchangeAmount,
                }
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