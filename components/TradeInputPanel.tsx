import React, { useState, useCallback } from 'react';
import type { TradeInput, ChargesInput } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface TradeInputPanelProps {
    onSimulate: (data: { tradeDetails: Omit<TradeInput, 'expectedDirection'>, charges: ChargesInput }) => void;
}

const ChargeInput: React.FC<{label: string, id: keyof ChargesInput, value: number, onChange: (id: keyof ChargesInput, value: string) => void, isPercentage?: boolean}> = 
({ label, id, value, onChange, isPercentage = false}) => (
    <div>
        <label htmlFor={id} className="block text-xs font-medium text-gray-700 dark:text-gray-300">{label} {isPercentage && '(%)'}</label>
        <Input id={id} type="number" value={value} onChange={(e) => onChange(id, e.target.value)} required step="0.00001" />
    </div>
);


export const TradeInputPanel: React.FC<TradeInputPanelProps> = ({ onSimulate }) => {
    const [stock, setStock] = useState('NIFTY 50');
    const [tradeType, setTradeType] = useState<'BUY' | 'SHORT'>('BUY');
    const [entryPrice, setEntryPrice] = useState('');
    const [quantity, setQuantity] = useState('10');
    const [stopLossPercentage, setStopLossPercentage] = useState('3');
    const [targetPricePercentage, setTargetPricePercentage] = useState('10');

    const [charges, setCharges] = useState<ChargesInput>({
        brokerageBuy: 20,
        brokerageSell: 20,
        sttPercentage: 0.025,
        exchangeChargePercentage: 0.00345,
        gstPercentage: 18,
        stampDutyPercentage: 0.003,
    });
    
    const handleChargesChange = (id: keyof ChargesInput, value: string) => {
        setCharges(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
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

                    <details className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-sm">
                        <summary className="font-medium cursor-pointer">Charge Configuration</summary>
                        <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                           <ChargeInput label="Brokerage (Buy)" id="brokerageBuy" value={charges.brokerageBuy} onChange={handleChargesChange} />
                           <ChargeInput label="Brokerage (Sell)" id="brokerageSell" value={charges.brokerageSell} onChange={handleChargesChange} />
                           <ChargeInput label="STT" id="sttPercentage" value={charges.sttPercentage} onChange={handleChargesChange} isPercentage />
                           <ChargeInput label="Stamp Duty" id="stampDutyPercentage" value={charges.stampDutyPercentage} onChange={handleChargesChange} isPercentage />
                           <ChargeInput label="Exchange" id="exchangeChargePercentage" value={charges.exchangeChargePercentage} onChange={handleChargesChange} isPercentage />
                           <ChargeInput label="GST" id="gstPercentage" value={charges.gstPercentage} onChange={handleChargesChange} isPercentage />
                        </div>
                    </details>

                    <Button type="submit" className="w-full">Start Simulation</Button>
                </form>
            </CardContent>
        </Card>
    );
};