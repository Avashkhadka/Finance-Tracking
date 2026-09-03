import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Transactions() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [sn, setSn] = useState('');
  const [finalDescription, setFinalDescription] = useState('');
  
  const [lines, setLines] = useState([
    { code_number: '', description: '', type: 'Dr', amount: '' }
  ]);
  
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [hasCodes, setHasCodes] = useState(true);
  const [cachedCodes, setCachedCodes] = useState([]);

  useEffect(() => {
    const codesStr = sessionStorage.getItem('codes');
    if (codesStr) {
      const parsed = JSON.parse(codesStr);
      setCachedCodes(parsed);
      if (parsed.length === 0) {
        setHasCodes(false);
        Swal.fire('No Codes Found', 'Please add financial codes before entering transactions.', 'warning');
      }
    } else {
      setHasCodes(false);
      Swal.fire('Missing Data', 'No codes found. Please log in again or add codes.', 'error');
    }
  }, []);
  
  // Calculate totals
  const totalDr = lines.filter(l => l.type === 'Dr').reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
  const totalCr = lines.filter(l => l.type === 'Cr').reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    
    // Auto-fetch description from sessionStorage
    if (field === 'code_number') {
      const foundCode = cachedCodes.find(c => c.code_number.toString() === value.trim());
      if (foundCode) {
        newLines[index].description = foundCode.description;
      } else {
        newLines[index].description = ''; // Reset if not found
      }
    }
    
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { code_number: '', description: '', type: 'Dr', amount: '' }]);
  };

  const removeLine = (index) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalDr !== totalCr) {
      Swal.fire('Imbalanced Entry', 'Total Debits must equal Total Credits.', 'error');
      return;
    }
    
    const payload = {
      name,
      date,
      sn,
      final_description: finalDescription,
      lines: lines.map(l => ({
        ...l,
        amount: parseFloat(l.amount) || 0
      }))
    };
    
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setSubmitted(true);
        setSubmittedData(payload);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Transaction Posted!',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        const err = await res.json();
        Swal.fire('Error', err.error, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  if (submitted && submittedData) {
    return (
      <>
        <DashboardHeader />
        <main className="pt-24 pb-16 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Journal Entry Recorded</h2>
              <p className="text-slate-500">The transaction has been successfully posted to the ledger.</p>
            </div>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Transaction Name</p>
                  <p className="font-medium text-slate-900">{submittedData.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Date & SN</p>
                  <p className="font-medium text-slate-900">{submittedData.date} | #{submittedData.sn}</p>
                </div>
              </div>
              
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Debit (Dr)</th>
                    <th className="py-3 px-4 text-right">Credit (Cr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {submittedData.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-mono text-slate-600">{l.code_number}</td>
                      <td className="px-4 py-3 text-slate-900">{l.description}</td>
                      <td className="px-4 py-3 text-right font-medium">{l.type === 'Dr' ? formatMoney(l.amount) : '-'}</td>
                      <td className="px-4 py-3 text-right font-medium">{l.type === 'Cr' ? formatMoney(l.amount) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan="2" className="px-4 py-3 font-semibold text-right text-slate-900">Totals:</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{formatMoney(totalDr)}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{formatMoney(totalCr)}</td>
                  </tr>
                </tfoot>
              </table>
              
              {submittedData.final_description && (
                <div className="p-4 bg-white border-t border-slate-200">
                  <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Final Notes</p>
                  <p className="text-sm text-slate-800">{submittedData.final_description}</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-center gap-4">
              <button 
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </button>
              <button 
                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm shadow-brand-200 transition-colors flex items-center gap-2"
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedData(null);
                  setName('');
                  setSn('');
                  setDate('');
                  setFinalDescription('');
                  setLines([{ code_number: '', description: '', type: 'Dr', amount: '' }]);
                }}
              >
                <span className="material-symbols-outlined text-sm">add</span>
                New Transaction
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main className="pt-24 pb-16 max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create Journal Entry</h1>
          <p className="text-slate-500">Record a new financial transaction into the ledger.</p>
        </div>
        
        {!hasCodes ? (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-xl p-8 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl mb-2 text-orange-500">warning</span>
            <h2 className="text-lg font-bold">Action Required</h2>
            <p className="text-sm mt-1">You must configure financial codes in the system before recording entries.</p>
            <button onClick={() => navigate('/codes')} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg shadow-sm hover:bg-orange-700 transition-colors text-sm font-medium">
              Go to Code Setup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/*  Header Fields  */}
          <div className="p-6 border-b border-slate-200 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Transaction Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="e.g. Office Supplies" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Date</label>
              <input required value={date} onChange={e => setDate(e.target.value)} type="date" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">S/N (Serial Number)</label>
              <input required value={sn} onChange={e => setSn(e.target.value)} type="text" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="TX-1004" />
            </div>
          </div>
          
          {/*  Line Items  */}
          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Line Items</h3>
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="flex flex-wrap md:flex-nowrap items-start gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100 group relative">
                  <div className="w-full md:w-32">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Code</label>
                    <input required value={line.code_number} onChange={e => handleLineChange(index, 'code_number', e.target.value)} type="text" className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-sm font-mono" placeholder="1010" />
                  </div>
                  <div className="w-full md:flex-1">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                    <input readOnly disabled value={line.description} type="text" className="w-full bg-slate-100 border border-slate-300 rounded-md px-2 py-1.5 text-sm text-slate-500 cursor-not-allowed" placeholder="Auto-filled from code..." />
                  </div>
                  <div className="w-full md:w-24">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Dr / Cr</label>
                    <select value={line.type} onChange={e => handleLineChange(index, 'type', e.target.value)} className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-sm">
                      <option value="Dr">Debit (Dr)</option>
                      <option value="Cr">Credit (Cr)</option>
                    </select>
                  </div>
                  <div className="w-full md:w-40">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount</label>
                    <input required value={line.amount} onChange={e => handleLineChange(index, 'amount', e.target.value)} type="number" step="0.01" min="0.01" className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-sm font-mono" placeholder="0.00" />
                  </div>
                  
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(index)} className="md:mt-5 text-red-400 hover:text-red-600 p-1.5 bg-white border border-slate-200 rounded-md transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <button type="button" onClick={addLine} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Add Line Item
              </button>
            </div>
          </div>
          
          {/*  Totals & Notes  */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Final Description & Notes</label>
              <textarea value={finalDescription} onChange={e => setFinalDescription(e.target.value)} rows="3" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Optional notes..."></textarea>
            </div>
            
            <div className="flex flex-col justify-end">
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                  <span>Total Debit (Dr)</span>
                  <span className="font-mono">{formatMoney(totalDr)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                  <span>Total Credit (Cr)</span>
                  <span className="font-mono">{formatMoney(totalCr)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Balance</span>
                  <span className={`font-mono font-bold ${totalDr === totalCr ? 'text-emerald-600' : 'text-red-600'}`}>
                    {totalDr === totalCr ? 'Balanced' : 'Imbalanced'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/*  Submit Bar  */}
          <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
            <button 
              type="submit" 
              disabled={totalDr !== totalCr || lines.length < 2 || totalDr === 0}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm shadow-brand-200 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Post Transaction
            </button>
          </div>
        </form>
        )}
      </main>
    </>
  );
}
