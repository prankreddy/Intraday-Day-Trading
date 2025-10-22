import React, { useState, useCallback } from 'react';
import type { TradeInput, ChargesInput, ChargeConfig } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface TradeInputPanelProps {
    onSimulate: (data: { tradeDetails: Omit<TradeInput, 'expectedDirection'>, charges: ChargesInput }) => void;
}

const ChargeInput: React.FC<{
    label: string;
    id: keyof ChargesInput;
    config: ChargeConfig;
    onChange: (id: keyof ChargesInput, newConfig: ChargeConfig) => void;
}> = ({ label, id, config, onChange }) => {
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(id, { ...config, value: parseFloat(e.target.value) || 0 });
    };

    const toggleMode = () => {
        onChange(id, { ...config, isPercentage: !config.isPercentage });
    };

    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="flex items-center mt-1">
                <Input 
                    id={id} 
                    type="number" 
                    value={config.value} 
                    onChange={handleValueChange} 
                    required 
                    step={config.isPercentage ? "0.0001" : "0.01"}
                    className="mt-0 rounded-r-none focus:z-10 relative"
                />
                <button
                    type="button"
                    onClick={toggleMode}
                    className="relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold border rounded-r-md transition-colors bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                    title={config.isPercentage ? "Switch to fixed amount (₹)" : "Switch to percentage (%)"}
                >
                    <span className="font-sans">{config.isPercentage ? '%' : '₹'}</span>
                </button>
            </div>
        </div>
    );
};


export const TradeInputPanel: React.FC<TradeInputPanelProps> = ({ onSimulate }) => {
    const [stock, setStock] = useState('NIFTY 50');
    const [tradeType, setTradeType] = useState<'BUY' | 'SHORT'>('BUY');
    const [entryPrice, setEntryPrice] = useState('');
    const [quantity, setQuantity] = useState('10');
    const [stopLossPercentage, setStopLossPercentage] = useState('3');
    const [targetPricePercentage, setTargetPricePercentage] = useState('10');

    const [charges, setCharges] = useState<ChargesInput>({
        brokerageBuy: { value: 20, isPercentage: false },
        brokerageSell: { value: 20, isPercentage: false },
        stt: { value: 0.025, isPercentage: true },
        exchangeCharge: { value: 0.00345, isPercentage: true },
        gst: { value: 18, isPercentage: true },
        stampDuty: { value: 0.003, isPercentage: true },
    });
    
    const handleChargesChange = (id: keyof ChargesInput, newConfig: ChargeConfig) => {
        setCharges(prev => ({ ...prev, [id]: newConfig }));
    };

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const entryPriceNum = parseFloat(entryPrice);
        const quantityNum = parseInt(quantity, 10);
        const stopLossNum = stopLossPercentage ? parseFloat(stopLossPercentage) : undefined;
        const targetPriceNum = targetPricePercentage ? parseFloat(targetPricePercentage) : undefined;

        if (isNaN(entryPriceNum) || isNaN(quantityNum) || entryPriceNum <= 0 || quantityNum <= 0) {
            alert("Please enter valid numbers for price and quantity.");
            return;
        }

        onSimulate({
            tradeDetails: {
                stock,
                tradeType,
                entryPrice: entryPriceNum,
                quantity: quantityNum,
                stopLossPercentage: stopLossNum,
                targetPricePercentage: targetPriceNum,
            },
            charges
        });
    }, [stock, tradeType, entryPrice, quantity, stopLossPercentage, targetPricePercentage, charges, onSimulate]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Setup New Trade Simulation</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Name</label>
                        <Input id="stock" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g., RELIANCE" required />
                    </div>
                    
                    <div>
                        <label htmlFor="tradeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trade Type</label>
                        <Select id="tradeType" value={tradeType} onChange={(e) => setTradeType(e.target.value as 'BUY' | 'SHORT')}>
                            <option value="BUY">Buy (Long)</option>
                            <option value="SHORT">Short Sell</option>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="entryPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Entry Price (₹)</label>
                            <Input id="entryPrice" type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="e.g., 150.50" required step="0.01" />
                        </div>
                        <div>
                           <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 100" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="stopLoss" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stop Loss (%)</label>
                            <Input id="stopLoss" type="number" value={stopLossPercentage} onChange={(e) => setStopLossPercentage(e.target.value)} placeholder="e.g., 3" step="0.1" />
                        </div>
                        <div>
                           <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Price (%)</label>
                            <Input id="targetPrice" type="number" value={targetPricePercentage} onChange={(e) => setTargetPricePercentage(e.target.value)} placeholder="e.g., 10" step="0.1" />
                        </div>
                    </div>

                    <details className="border border-gray-200 dark:border-gray-700 rounded-lg group text-sm">
                        <summary className="flex items-center justify-between w-full p-3 font-medium cursor-pointer list-none">
                            <span>Charge Configuration</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 transition-transform duration-200 transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <div className="grid grid-cols-2 gap-4 p-3 border-t border-gray-200 dark:border-gray-700">
                           <ChargeInput label="Brokerage (Buy)" id="brokerageBuy" config={charges.brokerageBuy} onChange={handleChargesChange} />
                           <ChargeInput label="Brokerage (Sell)" id="brokerageSell" config={charges.brokerageSell} onChange={handleChargesChange} />
                           <ChargeInput label="STT" id="stt" config={charges.stt} onChange={handleChargesChange} />
                           <ChargeInput label="Stamp Duty" id="stampDuty" config={charges.stampDuty} onChange={handleChargesChange} />
                           <ChargeInput label="Exchange" id="exchangeCharge" config={charges.exchangeCharge} onChange={handleChargesChange} />
                           <ChargeInput label="GST" id="gst" config={charges.gst} onChange={handleChargesChange} />
                        </div>
                    </details>

                    <Button type="submit" className="w-full">Start Simulation</Button>
                </form>
            </CardContent>
        </Card>
    );
};