import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Swal from 'sweetalert2';
import { toNepaliWords, toNepaliDigits } from 'nepali-number-words';
import { toWords } from 'number-to-words';

const nepaliMonths = [
    { value: '01', label: 'Baishakh' },
    { value: '02', label: 'Jestha' },
    { value: '03', label: 'Ashadh' },
    { value: '04', label: 'Shrawan' },
    { value: '05', label: 'Bhadra' },
    { value: '06', label: 'Ashwin' },
    { value: '07', label: 'Kartik' },
    { value: '08', label: 'Mangsir' },
    { value: '09', label: 'Poush' },
    { value: '10', label: 'Magh' },
    { value: '11', label: 'Falgun' },
    { value: '12', label: 'Chaitra' }
];

export default function ViewTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [filterYear, setFilterYear] = useState('');
    const [filterMonthStr, setFilterMonthStr] = useState('');

    // Modal State
    const [viewTx, setViewTx] = useState(null);
    const [viewTxLines, setViewTxLines] = useState([]);

    const { token, orgName, orgAddress, currency, receiptLanguage, user } = useContext(AuthContext);

    const fetchTransactions = () => {
        fetch('/api/transactions', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setTransactions(data))
            .catch(err => console.error('Error fetching transactions:', err));
    };

    useEffect(() => {
        fetchTransactions();
    }, [token]);

    const filteredTransactions = transactions.filter(tx => {
        if (!tx.date) return true;
        if (filterYear && filterMonthStr) {
            return tx.date.startsWith(`${filterYear}-${filterMonthStr}`);
        }
        if (filterYear) return tx.date.startsWith(filterYear);
        return true;
    });

    const formatMoney = (val) => {
        const num = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
        return `${currency || '$'}${num}`;
    };

    const getCodeDescription = (codeNum) => {
        try {
            const codes = JSON.parse(sessionStorage.getItem('codes') || '[]');
            const nepaliToEnglish = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
            const normalize = (str) => String(str).replace(/[०-९]/g, m => nepaliToEnglish[m]).trim();
            const code = codes.find(c => normalize(c.code_number) === normalize(codeNum));
            return code ? code.description : 'Unknown Code';
        } catch {
            return 'Unknown Code';
        }
    };

    const openViewModal = (tx) => {
        setViewTx(tx);
        // Deep copy lines for editing
        setViewTxLines(JSON.parse(JSON.stringify(tx.lines)));
    };

    const closeViewModal = () => {
        setViewTx(null);
        setViewTxLines([]);
    };

    const swapLine = (index) => {
        const newLines = [...viewTxLines];
        newLines[index].type = newLines[index].type === 'Dr' ? 'Cr' : 'Dr';
        setViewTxLines(newLines);
    };

    const handleSaveViewTx = async () => {
        const totalDr = viewTxLines.filter(l => l.type === 'Dr').reduce((s, l) => s + l.amount, 0);
        const totalCr = viewTxLines.filter(l => l.type === 'Cr').reduce((s, l) => s + l.amount, 0);
        if (totalDr !== totalCr) {
            Swal.fire('Imbalanced', 'Debit and Credit totals must match.', 'error');
            return;
        }

        const payload = {
            date: viewTx.date,
            sn: viewTx.sn,
            final_description: viewTx.final_description,
            lines: viewTxLines.map(l => ({
                code_number: l.code_number,
                type: l.type,
                amount: l.amount
            }))
        };

        try {
            const res = await fetch(`/api/transactions/${viewTx.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Changes Saved', showConfirmButton: false, timer: 3000 });
                closeViewModal();
                fetchTransactions();
            } else {
                const err = await res.json();
                Swal.fire('Error', err.error, 'error');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = (tx) => {
        const isEng = receiptLanguage === 'english';
        const dNum = (num) => isEng ? num : toNepaliDigits(num);
        const dStr = (eng, nep) => isEng ? eng : nep;
        const totalWords = isEng
            ? 'IN WORDS: ' + toWords(tx.totalDr || 0).toUpperCase() + ' ONLY'
            : 'अक्षरूपी: ' + toNepaliWords(tx.totalDr || 0) + ' मात्र';



        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${tx.sn}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #333; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; margin: 0; font-size: 11px; }
              .header-container { display: flex; flex-direction:column; justify-content: center;align-items: center; text-align:center; margin-bottom: 15px; }
              .header-left { flex: 1; }
              .header-left h1 { color: #0ea5e9; margin: 0; font-size: 18px; }
              .header-left p { margin: 3px 0; color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
              .header-right { text-align: right; width:100%; flex: 1; }
              .header-right p { margin: 2px 0; font-size: 11px; }
              .main-content { flex: 1; display: flex; flex-direction: column; }
              table { width: 100%; border-collapse: collapse; margin-top: 5px; height: 100%; font-size: 11px; border: 1px solid #000; }
              th, td { padding: 6px 8px; text-align: left; border-left: 1px solid #000; border-right: 1px solid #000; }
              th { background-color: #f9f9f9; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; }
              td { vertical-align: top; }
              .inner-row td { border-bottom: none; border-top: none; }
              .right { text-align: right; }
              .total { font-weight: bold; font-size: 1.1em; border-top: 1px solid #000; }
              .total-words { font-weight: bold; text-align: left; background-color: #f9f9f9; border-top: 1px solid #000; border-bottom: 1px solid #000; }
              .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
              .sig-box { width: 30%; text-align: center; border-top: 1px solid #000; padding-top: 5px; margin-top: 30px; font-weight: bold; font-size: 11px; }
            </style>
          </head>
          <body>
            <div class="header-container ">
              <div class="header-left">
                <h1>${orgName || 'Finora'}</h1>
                ${orgAddress ? `<p>${orgAddress}</p>` : ''}
                <p>${dStr('OFFICIAL RECEIPT', 'जनरल भौचर')}</p>
              </div>
              <div class="header-right">
                <p><strong>${dStr('Transaction SN:', 'भौचर न:')}</strong> ${dNum(tx.sn)}</p>
                <p><strong>${dStr('Date:', 'मिति:')}</strong> ${dNum(tx.date.split(" ")[0])}</p>
                ${tx.created_by ? `<p><strong> ${dStr('Created By:', 'तयार गर्ने:')}</strong> ${tx.created_by}</p>` : ''}
              </div>
            </div>
            
            <div class="main-content">
              <table>
                <thead>
                  <tr>
                    <th style="width: 15%">${dStr('Code', 'सङ्केत नम्बर')}</th>
                    <th style="width: 45%">${dStr('Description', 'लेखा श्रीर्षक')}</th>
                    <th class="right" style="width: 20%">${dStr('Debit (Dr)', 'डेबिट रकम')}</th>
                    <th class="right" style="width: 20%">${dStr('Credit (Cr)', 'क्रेडिट रकम')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${tx.lines.map(l => `
                    <tr class="inner-row">
                      <td>${dNum(l.code_number)}</td>
                      <td>${getCodeDescription(l.code_number)}</td>
                      <td class="right">${l.type === 'Dr' ? dNum(formatMoney(l.amount)) : '-'}</td>
                      <td class="right">${l.type === 'Cr' ? dNum(formatMoney(l.amount)) : '-'}</td>
                    </tr>
                  `).join('')}
                  <tr style="height: 100%;" class="inner-row">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" class="right total">${dStr('Total:', 'जम्मा:')}</td>
                    <td class="right total">${dNum(formatMoney(tx.totalDr))}</td>
                    <td class="right total">${dNum(formatMoney(tx.totalCr))}</td>
                  </tr>
                  <tr>
                    <td colspan="4" class="total-words">
                      ${totalWords}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="4" style="padding: 12px 8px;">
                      <strong>${dStr('Notes:', 'विवरण:')}</strong> ${tx.final_description || 'N/A'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
  
            <div class="signatures">
              <div class="sig-box">${dStr('Maker', 'तयार गर्ने')}</div>
              <div class="sig-box">${dStr('Checker', 'चेक गर्ने')}</div>
              <div class="sig-box">${dStr('Verifier', 'स्वीकृत गर्ने')}</div>
            </div>
  
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
        printWindow.document.close();
    };

    return (
        <>
            <DashboardHeader />

            {/* Modal Overlay */}
            {viewTx && (
                <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Transaction: {receiptLanguage === 'english' ? viewTx.sn : toNepaliDigits(viewTx.sn)}</h2>
                                <p className="text-sm text-slate-500">Date: {receiptLanguage === 'english' ? viewTx.date : toNepaliDigits(viewTx.date)}</p>
                            </div>
                            <button onClick={closeViewModal} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {viewTx.final_description && (
                                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <strong>Notes:</strong> {viewTx.final_description}
                                </p>
                            )}

                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b border-slate-200 text-slate-600">
                                            <th className="p-3">Code</th>
                                            <th className="p-3 text-right">Debit (Dr)</th>
                                            <th className="p-3 text-right">Credit (Cr)</th>
                                            {user?.role === 'admin' && (
                                                <th className="p-3 text-center">Action</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {viewTxLines.map((l, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50">
                                                <td className="p-3">{receiptLanguage === 'english' ? l.code_number : toNepaliDigits(l.code_number)}</td>
                                                <td className="p-3 text-right font-medium text-slate-900">{l.type === 'Dr' ? formatMoney(l.amount) : '-'}</td>
                                                <td className="p-3 text-right font-medium text-slate-900">{l.type === 'Cr' ? formatMoney(l.amount) : '-'}</td>
                                                <td className="p-3 text-center">
                                                    <button
                                                        onClick={() => swapLine(i)}
                                                        className="text-xs px-2 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded font-semibold transition-colors flex items-center gap-1 mx-auto"
                                                        title="Swap Debit/Credit"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">swap_horiz</span> Swap
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end pt-2">
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1 text-sm min-w-[200px]">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Total Debit:</span>
                                        <span className="font-bold">{formatMoney(viewTxLines.filter(l => l.type === 'Dr').reduce((s, l) => s + l.amount, 0))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Total Credit:</span>
                                        <span className="font-bold">{formatMoney(viewTxLines.filter(l => l.type === 'Cr').reduce((s, l) => s + l.amount, 0))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button onClick={closeViewModal} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50">
                                Close
                            </button>
                            <button
                                onClick={handleSaveViewTx}
                                disabled={
                                    viewTxLines.filter(l => l.type === 'Dr').reduce((s, l) => s + l.amount, 0) !== viewTxLines.filter(l => l.type === 'Cr').reduce((s, l) => s + l.amount, 0)
                                }
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:bg-slate-300 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[16px]">save</span>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">All Transactions</h1>
                            <p className="text-sm sm:text-base text-slate-500 mt-1">View all past transactions.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Year</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2080"
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Month</label>
                                <select
                                    value={filterMonthStr}
                                    onChange={(e) => setFilterMonthStr(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                                >
                                    <option value="">All</option>
                                    {nepaliMonths.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-3">Date</th>
                                        <th className="py-3 px-3">SN</th>
                                        <th className="py-3 px-3">Created By</th>
                                        <th className="py-3 px-3 text-right">Debit (Dr)</th>
                                        <th className="py-3 px-3 text-right">Credit (Cr)</th>
                                        <th className="py-3 px-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border">
                                    {filteredTransactions.map(tx => (
                                        <tr className="hover:bg-slate-50/50 transition-colors" key={tx.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                                                <div className="font-medium text-slate-800">{receiptLanguage === 'english' ? tx.date : toNepaliDigits(tx.date)}</div>
                                                {tx.modified_at && (
                                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                                        [{receiptLanguage === 'english' ? `Edited: ${tx.modified_at}` : `सम्पादन: ${toNepaliDigits(tx.modified_at)}`}]
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                                                    {receiptLanguage === 'english' ? tx.sn : toNepaliDigits(tx.sn)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-slate-600 block">{tx.created_by || '-'}</span>
                                                {tx.modified_by && (
                                                    <span className="text-[10px] text-slate-500 block mt-0.5">
                                                        ({tx.modified_by})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                                                {receiptLanguage === 'english' ? formatMoney(tx.totalDr) : toNepaliDigits(formatMoney(tx.totalDr))}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                                                {receiptLanguage === 'english' ? formatMoney(tx.totalCr) : toNepaliDigits(formatMoney(tx.totalCr))}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-center text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openViewModal(tx)}
                                                        className="p-1.5 text-brand-600 hover:bg-brand-50 rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(tx)}
                                                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                        title="Download/Print Receipt"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                                    </button>
                                                    {user?.role === 'admin' && (
                                                        <Link
                                                            to={`/transactions/edit/${tx.id}`}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Edit Transaction"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransactions.length === 0 && (
                                        <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-500">No transactions found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>
            </main>
        </>
    );
}
