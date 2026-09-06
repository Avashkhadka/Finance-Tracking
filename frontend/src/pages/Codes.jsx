import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';

export default function Codes() {
  const { token } = useContext(AuthContext);
  const [codes, setCodes] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/codes', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => setCodes(data))
      .catch(console.error);
  }, [token]);

  const handleAddCode = async (e) => {
    e.preventDefault();
    setMessage('');
    const formData = new FormData(e.target);
    const newCode = {
      code_number: formData.get('code_id'),
      description: formData.get('code_desc'),
      classification: formData.get('code_class'),
      status: 'Active'
    };
    
    try {
      const res = await fetch('/api/codes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(newCode)
      });
      if (res.ok) {
        const added = await res.json();
        setCodes([...codes, added]);
        e.target.reset();
        setMessage('Financial code successfully registered.');
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error}`);
      }
    } catch(err) {
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Code Setup</h1>
            <p className="text-sm text-slate-500">Manage and classify corporate accounts into the ledger structure.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Create Code Form */}
            <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col self-start">
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Add Code</h2>
                  <p className="text-xs text-slate-500">Register new account</p>
                </div>
                <span className="material-symbols-outlined text-brand-600">account_tree</span>
              </div>
              
              <form className="p-6 space-y-5" onSubmit={handleAddCode}>
                {message && (
                  <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('Error') || message.includes('Failed') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {message}
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="code_id">Code Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-medium text-slate-400">#</span>
                    <input className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="code_id" name="code_id" maxLength="6" placeholder="e.g. 1040" required type="text"/>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="code_desc">Description</label>
                  <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="code_desc" name="code_desc" placeholder="e.g. Operating Reserve" required type="text"/>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Classification</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="cursor-pointer relative">
                      <input defaultChecked className="peer sr-only" name="code_class" type="radio" value="Assets"/>
                      <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-600 peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-700 transition-all">
                        Assets
                      </div>
                    </label>
                    <label className="cursor-pointer relative">
                      <input className="peer sr-only" name="code_class" type="radio" value="Liabilities"/>
                      <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-600 peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-700 transition-all">
                        Liabilities
                      </div>
                    </label>
                    <label className="cursor-pointer relative">
                      <input className="peer sr-only" name="code_class" type="radio" value="Income"/>
                      <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-600 peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-700 transition-all">
                        Income
                      </div>
                    </label>
                    <label className="cursor-pointer relative">
                      <input className="peer sr-only" name="code_class" type="radio" value="Expenses"/>
                      <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-600 peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-700 transition-all">
                        Expenses
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button className="w-full py-2.5 rounded-lg bg-brand-600 text-white font-medium text-sm shadow-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2" type="submit">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Register Code
                  </button>
                </div>
              </form>
            </div>
            
            {/* Right: Code Table */}
            <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Master Catalog</h3>
                  <p className="text-sm text-slate-500">All registered ledger accounts.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter:</span>
                  <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none">
                    <option>All Classifications</option>
                    <option>Assets</option>
                    <option>Liabilities</option>
                    <option>Income</option>
                    <option>Expenses</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto w-full flex-1">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white">
                      <th className="py-3 px-6">Code</th>
                      <th className="py-3 px-6">Description</th>
                      <th className="py-3 px-6">Classification</th>
                      <th className="py-3 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {codes.map(c => (
                      <tr className="hover:bg-slate-50/50 transition-colors" key={c.code_number || c.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-medium text-slate-700">#{c.code_number}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-slate-900">{c.description}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-slate-600">{c.classification}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-xs font-medium">Active</span>
                        </td>
                      </tr>
                    ))}
                    {codes.length === 0 && (
                      <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No codes registered</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Showing {codes.length} ledger codes</span>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </>
  );
}
