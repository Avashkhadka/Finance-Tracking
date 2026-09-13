import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
export default function FiscalYears() {
    const { token } = useContext(AuthContext);
    const [fiscalYears, setFiscalYears] = useState([]);
    const [message, setMessage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchFiscalYears = () => {
        fetch('/api/fiscal-years', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => setFiscalYears(data))
            .catch(console.error);
    };

    useEffect(() => {
        fetchFiscalYears();
    }, [token]);

    const handleAddFiscalYear = async (e) => {
        e.preventDefault();
        setMessage('');
        const formData = new FormData(e.target);
        const newFY = {
            name: formData.get('name'),
            start_date: startDate,
            end_date: endDate
        };

        try {
            const res = await fetch('/api/fiscal-years', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(newFY)
            });
            if (res.ok) {
                fetchFiscalYears();
                e.target.reset();
                setStartDate('');
                setEndDate('');
                setMessage('Fiscal year successfully created.');
            } else {
                const err = await res.json();
                setMessage(`Error: ${err.error}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('Failed to connect to the server.');
        }
    };

    const handleSetActive = async (id) => {
        setMessage('');
        try {
            const res = await fetch(`/api/fiscal-years/${id}/set-current`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (res.ok) {
                fetchFiscalYears();
                // Dispatch a custom event so the DashboardHeader can listen and update instantly
                window.dispatchEvent(new Event('fiscalYearChanged'));
                setMessage('Active fiscal year updated successfully.');
            } else {
                const err = await res.json();
                setMessage(`Error: ${err.error}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('Failed to connect to the server.');
        }
    };

    return (
        <>
            <DashboardHeader />

            <main className="w-full pt-24 pb-16 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fiscal Year Management</h1>
                        <p className="text-sm text-slate-500">Define accounting periods and set the globally active fiscal year.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left: Create FY Form */}
                        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col self-start relative z-50">
                            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Add Fiscal Year</h2>
                                    <p className="text-xs text-slate-500">Create a new calendar</p>
                                </div>
                                <span className="material-symbols-outlined text-brand-600">calendar_month</span>
                            </div>

                            <form className="p-6 space-y-5" onSubmit={handleAddFiscalYear}>
                                {message && (
                                    <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('Error') || message.includes('Failed') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                        {message}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="name">Name / Code</label>
                                    <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="name" name="name" placeholder="e.g. 77/78" required type="text" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="start_date">Start Date</label>
                                    <NepaliDatePicker
                                        inputClassName="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                                        value={startDate}
                                        onChange={(value) => setStartDate(value)}
                                        options={{ calenderLocale: "en", valueLocale: "en" }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="end_date">End Date</label>
                                    <NepaliDatePicker
                                        inputClassName="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                                        value={endDate}
                                        onChange={(value) => setEndDate(value)}
                                        options={{ calenderLocale: "en", valueLocale: "en" }}
                                    />
                                </div>

                                <div className="pt-2">
                                    <button className="w-full py-2.5 rounded-lg bg-brand-600 text-white font-medium text-sm shadow-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2" type="submit">
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                        Create Fiscal Year
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right: FY Table */}
                        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Configured Years</h3>
                                    <p className="text-sm text-slate-500">All registered periods.</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto w-full flex-1">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white">
                                            <th className="py-3 px-6">Name</th>
                                            <th className="py-3 px-6">Start Date</th>
                                            <th className="py-3 px-6">End Date</th>
                                            <th className="py-3 px-6 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {fiscalYears.map(fy => (
                                            <tr className={`hover:bg-slate-50/50 transition-colors ${fy.is_current ? 'bg-brand-50/30' : ''}`} key={fy.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-semibold text-slate-900">{fy.name}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-slate-600">{fy.start_date}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-slate-600">{fy.end_date}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {fy.is_current ? (
                                                        <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Active
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSetActive(fy.id)}
                                                            className="px-3 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded text-xs font-medium transition-colors"
                                                        >
                                                            Set Active
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {fiscalYears.length === 0 && (
                                            <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No fiscal years registered</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                    </div>
                </div>
            </main>
        </>
    );
}
