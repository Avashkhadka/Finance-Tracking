import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardMetricCards from '../components/dashboard/DashboardMetricCards';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import DashboardTransactions from '../components/dashboard/DashboardTransactions';
import DashboardFooter from '../components/dashboard/DashboardFooter';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    fetch('/api/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error('Error fetching transactions:', err));
  }, [token]);

  return (
    <>
      <DashboardHeader />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/*  Header Greeting & Action Bar  */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Good morning, {user?.name?.split(' ')[0] || 'Alex'}</h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">Here is your financial summary for this month.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm shadow-sm transition-colors" type="button">
                <span className="material-symbols-outlined text-[18px] text-slate-500">file_download</span>
                <span>Download Report</span>
              </button>
              <Link to="/transactions" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm shadow-indigo-100 transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Transaction</span>
              </Link>
            </div>
          </section>

          <DashboardMetricCards transactions={transactions} />
          <DashboardCharts transactions={transactions} />
          <DashboardTransactions transactions={transactions} />
          
        </div>
      </main>

      <DashboardFooter />
    </>
  );
}