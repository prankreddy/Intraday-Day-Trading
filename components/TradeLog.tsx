
import React, { useMemo } from 'react';
import type { Trade } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Share } from './icons';


interface TradeLogProps {
    log: Trade[];
    clearLog: () => void;
}

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

const TradeLog: React.FC<TradeLogProps> = ({ log, clearLog }) => {

    const cumulativePnl = useMemo(() => {
        let total = 0;
        return log.map(trade => {
            total += trade.netPnl;
            return { name: `${trade.stock.slice(0,5)}...`, pnl: trade.netPnl, cumulative: total };
        });
    }, [log]);
    
    const exportToCSV = () => {
        if (log.length === 0) return;
        const headers = "ID,Stock,Type,Entry,Exit,CapitalUsed,Quantity,GrossPnl,NetPnl,TotalCharges,Brokerage,STT,GST,StampDuty,ExchangeFees,SL(%),TP(%)\n";
        const rows = log.map(t => 
            [
                t.id, 
                t.stock, 
                t.tradeType, 
                t.entryPrice, 
                t.finalMarketPrice, 
                t.capitalUsed.toFixed(2), 
                t.quantity, 
                t.grossPnl.toFixed(2), 
                t.netPnl.toFixed(2),
                t.totalCharges.toFixed(2),
                t.charges.brokerage.toFixed(2),
                t.charges.stt.toFixed(2),
                t.charges.gst.toFixed(2),
                t.charges.stampDuty.toFixed(2),
                t.charges.exchange.toFixed(2),
                t.stopLossPercentage ?? 'default', 
                t.targetPricePercentage ?? 'default'
            ].join(',')
        ).join('\n');
        
        const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "trade_log.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (log.length === 0) return;

        const doc = new jsPDF();
        
        doc.text("Intraday Trade Log", 14, 20);

        const tableColumn = ["Stock", "Type", "Entry", "Exit", "Net P/L", "Charges"];
        const tableRows: any[][] = [];

        log.forEach(trade => {
            const tradeData = [
                trade.stock,
                trade.tradeType,
                formatCurrency(trade.entryPrice),
                formatCurrency(trade.finalMarketPrice),
                formatCurrency(trade.netPnl),
                formatCurrency(trade.totalCharges)
            ];
            tableRows.push(tradeData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid'
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        const totalNetPnl = log.reduce((acc, trade) => acc + trade.netPnl, 0);
        const totalCharges = log.reduce((acc, trade) => acc + trade.totalCharges, 0);

        doc.setFontSize(12);
        doc.text("Summary:", 14, finalY + 15);
        doc.setFontSize(10);
        doc.text(`Total Trades: ${log.length}`, 14, finalY + 22);
        doc.text(`Total Net P/L: ${formatCurrency(totalNetPnl)}`, 14, finalY + 28);
        doc.text(`Total Charges: ${formatCurrency(totalCharges)}`, 14, finalY + 34);

        doc.save("trade_log.pdf");
    };

    const handleShareSummary = () => {
        if (log.length === 0) return;

        const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        const header = `*📈 Intraday Trading Summary - ${today} 📉*\n---------------------------------`;

        const tradesList = log.map((trade, index) => {
            const pnlEmoji = trade.netPnl >= 0 ? '📈' : '📉';
            return `*${index + 1}. ${trade.stock.toUpperCase()} (${trade.tradeType})*\n` +
                   `Qty: ${trade.quantity} | Entry: ${formatCurrency(trade.entryPrice)} | Exit: ${formatCurrency(trade.finalMarketPrice)}\n` +
                   `Net P/L: *${formatCurrency(trade.netPnl)}* ${pnlEmoji}`;
        }).join('\n\n');

        const totalNetPnl = log.reduce((acc, trade) => acc + trade.netPnl, 0);
        const totalCharges = log.reduce((acc, trade) => acc + trade.totalCharges, 0);

        const footer = `---------------------------------\n` +
                       `*Overall Summary:*\n` +
                       `Total Trades: ${log.length}\n` +
                       `Total Charges: ${formatCurrency(totalCharges)}\n` +
                       `*Final Net P/L: ${formatCurrency(totalNetPnl)}*`;

        const summaryText = `${header}\n\n${tradesList}\n\n${footer}`;

        if (navigator.share) {
            navigator.share({
                title: `Intraday Trading Summary - ${today}`,
                text: summaryText,
            }).catch(console.error);
        } else {
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`;
            window.open(whatsappUrl, '_blank');
        }
    };


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Trade History</CardTitle>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleShareSummary} variant="secondary" size="sm" disabled={log.length === 0} className="flex items-center gap-1.5">
                        <Share className="w-4 h-4" /> Share
                    </Button>
                    <Button onClick={exportToPDF} variant="outline" size="sm" disabled={log.length === 0}>Export PDF</Button>
                    <Button onClick={exportToCSV} variant="outline" size="sm" disabled={log.length === 0}>Export CSV</Button>
                    <Button onClick={clearLog} variant="destructive" size="sm" disabled={log.length === 0}>Clear Log</Button>
                </div>
            </CardHeader>
            <CardContent>
                {log.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No trades logged yet.</p>
                ) : (
                    <>
                        <div className="h-64 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cumulativePnl}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)"/>
                                    <XAxis dataKey="name" stroke="currentColor"/>
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={formatCurrency} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={formatCurrency} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(30, 30, 30, 0.8)',
                                            borderColor: '#4a4a4a',
                                            color: 'white'
                                        }}
                                        formatter={(value: any) => formatCurrency(value)}
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="pnl" name="Net P/L per Trade" fill="#8884d8" />
                                    <Bar yAxisId="right" dataKey="cumulative" name="Cumulative P/L" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2">Stock</th>
                                        <th className="px-4 py-2">Type</th>
                                        <th className="px-4 py-2">Net P/L</th>
                                        <th className="px-4 py-2 hidden md:table-cell">Entry/Exit</th>
                                        <th className="px-4 py-2 hidden md:table-cell">Charges</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {log.slice().reverse().map((trade) => (
                                        <tr key={trade.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-2 font-medium">{trade.stock}</td>
                                            <td className="px-4 py-2">{trade.tradeType}</td>
                                            <td className={`px-4 py-2 font-bold ${trade.netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(trade.netPnl)}</td>
                                            <td className="px-4 py-2 hidden md:table-cell">{formatCurrency(trade.entryPrice)} / {formatCurrency(trade.finalMarketPrice)}</td>
                                            <td className="px-4 py-2 hidden md:table-cell">{formatCurrency(trade.totalCharges)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default TradeLog;
