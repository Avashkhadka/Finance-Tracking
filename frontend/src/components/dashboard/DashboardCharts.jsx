import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardCharts({ transactions = [] }) {
    const { currency } = useContext(AuthContext);
    const [timeframe, setTimeframe] = useState(6); // Default 6M

    // Aggregate transactions by month
    const monthlyStats = {};
    transactions.forEach(tx => {
        if (!tx.date) return;
        const month = tx.date.substring(0, 7); // YYYY-MM
        if (!monthlyStats[month]) {
            monthlyStats[month] = { income: 0, expense: 0 };
        }
        monthlyStats[month].expense += tx.totalDr || 0;
        monthlyStats[month].income += tx.totalCr || 0;
    });

    const sortedMonths = Object.keys(monthlyStats).sort().slice(-timeframe);
    const chartData = sortedMonths.map(m => ({ month: m, ...monthlyStats[m] }));

    // Default paths and values
    let incomePath = "M 0 165 C 120 145, 200 115, 320 85 C 440 60, 520 70, 560 38 C 620 50, 670 30, 700 25";
    let expensePath = "M 0 190 C 130 180, 220 160, 320 150 C 420 140, 510 135, 560 125 C 630 115, 670 120, 700 118";
    let incomeAvg = "$8,420";
    let expenseAvg = "$4,280";
    let xLabels = (
        <div className="w-full flex justify-between pt-3 px-1 text-xs text-slate-400 font-medium">
            <span>May</span><span>Jun</span><span>Jul</span><span className="text-indigo-600 font-semibold">Aug</span><span>Sep</span>
        </div>
    );
    let activeIncomeCy = 38;
    let activeExpenseCy = 125;
    let activeCx = 560;

    if (chartData.length > 0) {
        const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);
        const stepX = chartData.length > 1 ? 700 / (chartData.length - 1) : 700;

        const getPoints = (key) => chartData.map((d, i) => {
            const x = i * stepX;
            // y inverted: 210 is bottom, 20 is top
            const y = 210 - ((d[key] / maxVal) * 190);
            return `${x},${y}`;
        });

        const incPts = getPoints('income');
        const expPts = getPoints('expense');

        incomePath = `M ${incPts.join(' L ')}`;
        expensePath = `M ${expPts.join(' L ')}`;

        const formatMoney = (val) => {
            const num = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
            return `${currency || '$'}${num}`;
        };
        const totalInc = chartData.reduce((s, d) => s + d.income, 0);
        const totalExp = chartData.reduce((s, d) => s + d.expense, 0);
        incomeAvg = formatMoney(totalInc / chartData.length);
        expenseAvg = formatMoney(totalExp / chartData.length);

        xLabels = (
            <div className="w-full flex justify-between pt-3 px-1 text-xs text-slate-400 font-medium">
                {chartData.map((d, i) => (
                    <span key={d.month} className={i === chartData.length - 1 ? 'text-indigo-600 font-semibold' : ''}>
                        {new Date(d.month + '-01').toLocaleString('default', { month: 'short' })}
                    </span>
                ))}
            </div>
        );

        // active point is the last point
        activeCx = (chartData.length - 1) * stepX;
        activeIncomeCy = 210 - ((chartData[chartData.length - 1].income / maxVal) * 190);
        activeExpenseCy = 210 - ((chartData[chartData.length - 1].expense / maxVal) * 190);
    }

    return (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/*  Left: Income vs Expenses Chart Card (8 cols)  */}
            <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6 h-[462px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Income vs Expenses</h2>
                        <p className="text-sm text-slate-500">Monthly cash flow and balance trends</p>
                    </div>
                    {/*  Timeframe Filter  */}
                    <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 self-start sm:self-auto">
                        <button
                            onClick={() => setTimeframe(1)}
                            className={`px-3 py-1 text-xs transition-colors rounded-md ${timeframe === 1 ? 'font-semibold text-indigo-700 bg-white shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'}`}
                            type="button">1M</button>
                        <button
                            onClick={() => setTimeframe(3)}
                            className={`px-3 py-1 text-xs transition-colors rounded-md ${timeframe === 3 ? 'font-semibold text-indigo-700 bg-white shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'}`}
                            type="button">3M</button>
                        <button
                            onClick={() => setTimeframe(6)}
                            className={`px-3 py-1 text-xs transition-colors rounded-md ${timeframe === 6 ? 'font-semibold text-indigo-700 bg-white shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'}`}
                            type="button">6M</button>
                        <button
                            onClick={() => setTimeframe(12)}
                            className={`px-3 py-1 text-xs transition-colors rounded-md ${timeframe === 12 ? 'font-semibold text-indigo-700 bg-white shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'}`}
                            type="button">1Y</button>
                    </div>
                </div>
                {/*  Clean Legend  */}
                <div className="flex items-center gap-6 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span>Income ({incomeAvg} avg)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                        <span>Expenses ({expenseAvg} avg)</span>
                    </div>
                </div>
                {/*  Clean Minimalist SVG Area Chart  */}
                <div className="relative w-full h-64 sm:h-72">
                    <svg className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 700 240">
                        <defs>
                            <linearGradient id="incomeLight" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.16"></stop>
                                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0"></stop>
                            </linearGradient>
                            <linearGradient id="expenseLight" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.12"></stop>
                                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0"></stop>
                            </linearGradient>
                        </defs>
                        {/*  Subtle Gridlines  */}
                        <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="700" y1="40" y2="40"></line>
                        <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="700" y1="100" y2="100"></line>
                        <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="700" y1="160" y2="160"></line>
                        <line stroke="#E2E8F0" strokeWidth="1" x1="0" x2="700" y1="210" y2="210"></line>

                        {/*  Income Area & Line  */}
                        <path d={`${incomePath} L 700 210 L 0 210 Z`} fill="url(#incomeLight)"></path>
                        <path d={incomePath} stroke="#10B981" strokeLinecap="round" strokeWidth="2.5" strokeLinejoin="round"></path>

                        {/*  Expense Area & Line  */}
                        <path d={`${expensePath} L 700 210 L 0 210 Z`} fill="url(#expenseLight)"></path>
                        <path d={expensePath} stroke="#6366F1" strokeLinecap="round" strokeWidth="2" strokeLinejoin="round"></path>

                        {/*  Active Data Marker Points  */}
                        {chartData.length > 0 && (
                            <>
                                <circle cx={activeCx} cy={activeIncomeCy} fill="#10B981" r="5" stroke="#FFFFFF" strokeWidth="2.5"></circle>
                                <circle cx={activeCx} cy={activeExpenseCy} fill="#6366F1" r="5" stroke="#FFFFFF" strokeWidth="2.5"></circle>
                            </>
                        )}
                    </svg>
                    {/*  X-Axis Labels  */}
                    {xLabels}
                </div>
            </div>

            {/*  Right: Financial Health Score Card (4 cols)  */}
            <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Financial Health</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Excellent</span>
                </div>
                {/*  Circular Gauge Indicator  */}
                <div className="flex flex-col items-center justify-center py-2 relative">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" fill="transparent" r="48" stroke="#F1F5F9" strokeWidth="8"></circle>
                            <circle cx="60" cy="60" fill="transparent" r="48" stroke="url(#healthScoreGrad)" strokeDasharray="301.6" strokeDashoffset="54.3" strokeLinecap="round" strokeWidth="8"></circle>
                            <defs>
                                <linearGradient id="healthScoreGrad" x1="0" x2="1" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#6366F1"></stop>
                                    <stop offset="100%" stopColor="#10B981"></stop>
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">82</span>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-0.5">Score / 100</span>
                        </div>
                    </div>
                </div>
                {/*  3 Simplified Progress Bars  */}
                <div className="space-y-4 pt-1">
                    <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-medium text-slate-600">Savings Rate</span>
                            <span className="font-semibold text-slate-900 font-mono">49%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '49%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-medium text-slate-600">Debt-to-Income</span>
                            <span className="font-semibold text-slate-900 font-mono">25%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '25%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-medium text-slate-600">Emergency Fund</span>
                            <span className="font-semibold text-slate-900 font-mono">6.2 months</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '78%' }}></div>
                        </div>
                    </div>
                </div>
                {/*  Helpful Human Advice  */}
                <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 p-3.5 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-indigo-600 text-[18px] shrink-0 mt-0.5">tips_and_updates</span>
                    <p className="text-xs text-indigo-950 leading-relaxed">
                        <strong className="font-semibold">Tip:</strong> Your savings rate is higher than 88% of peers. You are on track for your yearly target.
                    </p>
                </div>
            </div>
        </section>
    );
}
