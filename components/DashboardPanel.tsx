import React, { useState, useMemo } from 'react';
import type { TradeInput, Trade, ChargesInput } from '../types';
import { useTradeCalculator } from '../hooks/useTradeCalculator';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Info, Target, ShieldAlert } from './icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DashboardPanelProps {
    tradeInput: TradeInput | null;
    chargesInput: ChargesInput | null;
    currentMarketPrice: number | null;
    setCurrentMarketPrice: (price: number | null) => void;
    onLogTrade: (trade: Omit<Trade, 'id'>) => void;
}

const formatCurrency = (value: number) => `₹${Number(value).toFixed(2)}`;

export const DashboardPanel: React.FC<DashboardPanelProps> = ({ 
    tradeInput, 
    chargesInput,
    currentMarketPrice,
    setCurrentMarketPrice,
    onLogTrade,
}) => {
    const [showCharges, setShowCharges] = useState(false);
    const calculatedTrade = useTradeCalculator(tradeInput, chargesInput);

    const pnlResult = useMemo(() => {
        if (calculatedTrade && currentMarketPrice !== null) {
            return calculatedTrade.calculatePnl(currentMarketPrice);
        }
        return null;
    }, [calculatedTrade, currentMarketPrice]);

    const chartData = useMemo(() => {
        if (!calculatedTrade) return [];
        
        const data = [];
        const { stopLoss, targetPrice, calculatePnl } = calculatedTrade;
        const range = targetPrice - stopLoss;
        if (range <= 0) return [];

        const steps = 50; // Generate 50 data points for a smooth curve
        const step = range / steps;

        for (let i = 0; i <= steps; i++) {
            const price = stopLoss + i * step;
            const pnl = calculatePnl(price).netPnl;
            data.push({ price: parseFloat(price.toFixed(2)), pnl: parseFloat(pnl.toFixed(2)) });
        }
        return data;
    }, [calculatedTrade]);
    
    const gradientOffset = useMemo(() => {
        if (!chartData || chartData.length === 0) return 0.5;
        const dataMax = Math.max(...chartData.map(i => i.pnl));
        const dataMin = Math.min(...chartData.map(i => i.pnl));
        if (dataMax <= 0) return 0; // all red
        if (dataMin >= 0) return 1; // all green

        return dataMax / (dataMax - dataMin);
    }, [chartData]);


    if (!tradeInput || !calculatedTrade || !pnlResult) {
        return (
            <Card className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-gray-500">
                    <p>Setup a trade to start the simulation.</p>
                </div>
            </Card>
        );
    }
    
    const handleLog = () => {
        if (!currentMarketPrice || !tradeInput) return;
        const tradeToLog: Omit<Trade, 'id'> = {
            stock: tradeInput.stock,
            tradeType: tradeInput.tradeType,
            entryPrice: tradeInput.entryPrice,
            quantity: tradeInput.quantity,
            finalMarketPrice: currentMarketPrice,
            stopLossPercentage: tradeInput.stopLossPercentage,
            targetPricePercentage: tradeInput.targetPricePercentage,
            stopLoss: calculatedTrade.stopLoss,
            targetPrice: calculatedTrade.targetPrice,
            riskRewardRatio: calculatedTrade.riskRewardRatio,
            capitalUsed: calculatedTrade.capitalUsed,
            grossPnl: pnlResult.grossPnl,
            netPnl: pnlResult.netPnl,
            totalCharges: pnlResult.totalCharges,
            pnlPercentage: pnlResult.pnlPercentage,
            charges: pnlResult.charges,
        };
        onLogTrade(tradeToLog);
    };

    const isProfit = pnlResult.netPnl >= 0;
    const pnlColor = isProfit ? 'text-green-500' : 'text-red-500';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trade Simulation: {tradeInput.stock} ({tradeInput.tradeType})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <h3 className="text-sm font-medium text-center text-gray-500 dark:text-gray-400">Simulation Control</h3>
                     <div className="space-y-2">
                        <label htmlFor="marketPriceInput" className="block text-sm font-medium">Simulate Market Price (₹)</label>
                        <div className="flex items-center gap-4">
                            <input 
                                id="marketPriceSlider"
                                type="range"
                                min={calculatedTrade.stopLoss * 0.95}
                                max={calculatedTrade.targetPrice * 1.05}
                                step="0.05"
                                value={currentMarketPrice ?? tradeInput.entryPrice}
                                onChange={(e) => setCurrentMarketPrice(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                aria-label="Simulate market price with a slider"
                            />
                            <Input 
                                id="marketPriceInput"
                                type="number"
                                value={currentMarketPrice ?? tradeInput.entryPrice}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) {
                                        setCurrentMarketPrice(val);
                                    }
                                }}
                                step="0.05"
                                className="w-28 font-bold text-lg"
                                aria-label="Simulate market price with a number input"
                            />
                        </div>
                    </div>
                </div>

                <div className="h-48 md:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={gradientOffset} stopColor="#22c55e" stopOpacity={0.8}/>
                                    <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis 
                                dataKey="price" 
                                tickFormatter={(value) => formatCurrency(value)}
                                domain={['dataMin', 'dataMax']}
                                type="number"
                                stroke="currentColor"
                                fontSize={12}
                            />
                            <YAxis 
                                tickFormatter={(value) => `₹${value}`} 
                                domain={['auto', 'auto']}
                                stroke="currentColor"
                                fontSize={12}
                                width={70}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                                    borderColor: '#4a4a4a',
                                    color: '#fff'
                                }}
                                labelFormatter={(label) => `Price: ${formatCurrency(label)}`}
                                formatter={(value: number) => [formatCurrency(value), 'Net P/L']}
                            />
                            <Area type="monotone" dataKey="pnl" stroke="#8884d8" fillOpacity={1} fill="url(#colorPnl)" />
                            <ReferenceLine y={0} stroke="#a0a0a0" strokeDasharray="4 4" />
                            {currentMarketPrice !== null && (
                                <ReferenceLine x={currentMarketPrice} stroke="#3b82f6" strokeWidth={2} label={{ value: 'Current', fill: '#3b82f6', position: 'insideTop' }} />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Capital Breakdown</div>
                        <div className="flex justify-between items-baseline text-sm">
                            <span>Total Investment</span>
                            <span className="font-semibold">{formatCurrency(calculatedTrade.capitalUsed)}</span>
                        </div>
                         <div className="flex justify-between items-baseline border-t border-gray-300 dark:border-gray-600 mt-2 pt-2">
                            <span className="font-semibold">Total Position Value</span>
                            <span className="font-bold text-lg">{formatCurrency(calculatedTrade.positionValue)}</span>
                        </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex flex-col justify-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Net P/L</div>
                        <div className={`text-4xl font-bold ${pnlColor}`}>{formatCurrency(pnlResult.netPnl)}</div>
                        <div className={`text-md font-semibold ${pnlColor}`} title={`Based on total investment: ${formatCurrency(calculatedTrade.capitalUsed)}`}>
                            {pnlResult.pnlPercentage.toFixed(2)}%
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                     <div className="flex justify-between items-center mb-2">
                         <span className="font-semibold">Position Details</span>
                         <span className="font-bold text-lg">{calculatedTrade.quantity} units</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-red-500">
                        <span className="flex items-center gap-2 font-semibold"><ShieldAlert className="w-4 h-4"/> Stop-Loss</span>
                        <span>{formatCurrency(calculatedTrade.stopLoss)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-green-500">
                        <span className="flex items-center gap-2 font-semibold"><Target className="w-4 h-4"/> Target Price</span>
                        <span>{formatCurrency(calculatedTrade.targetPrice)}</span>

                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mt-1 pt-1 border-t border-dashed border-gray-300 dark:border-gray-600">
                         <span>Risk/Reward Ratio</span>
                         <span>{calculatedTrade.riskRewardRatio}</span>
                    </div>
                </div>
                
                <div>
                     <button onClick={() => setShowCharges(!showCharges)} className="text-sm flex items-center gap-1 mx-auto text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" aria-controls="charges-breakdown" aria-expanded={showCharges}>
                        <Info className="w-4 h-4" />
                        <span>Total Charges: {formatCurrency(pnlResult.totalCharges)}</span>
                    </button>
                    {showCharges && (
                        <div id="charges-breakdown" className="mt-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm animate-fade-in">
                            <h4 className="font-bold mb-2 text-center">Charges Breakdown</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-600 dark:text-gray-400">Brokerage</span>
                                    <span className="font-mono">{formatCurrency(pnlResult.charges.brokerage)}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-600 dark:text-gray-400">STT</span>
                                    <span className="font-mono">{formatCurrency(pnlResult.charges.stt)}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-600 dark:text-gray-400">Exchange Fees</span>
                                    <span className="font-mono">{formatCurrency(pnlResult.charges.exchange)}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-600 dark:text-gray-400">GST</span>
                                    <span className="font-mono">{formatCurrency(pnlResult.charges.gst)}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-600 dark:text-gray-400">Stamp Duty</span>
                                    <span className="font-mono">{formatCurrency(pnlResult.charges.stampDuty)}</span>
                                </div>
                                <div className="flex justify-between items-baseline font-bold mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                                    <span>Total</span>
                                    <span>{formatCurrency(pnlResult.totalCharges)}</span>
                                </div>
                            </div>
                            <style>{`
                                @keyframes fade-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
                                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                            `}</style>
                        </div>
                    )}
                </div>

            </CardContent>
            <CardFooter>
                 <Button onClick={handleLog} className="w-full">Log This Trade</Button>
            </CardFooter>
        </Card>
    );
};