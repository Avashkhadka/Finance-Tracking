import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardTransactions({ transactions }) {
  const { orgName } = useContext(AuthContext);
  const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleView = (tx) => {
    let linesHtml = tx.lines.map(l => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${l.code_number}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${l.type === 'Dr' ? formatMoney(l.amount) : '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${l.type === 'Cr' ? formatMoney(l.amount) : '-'}</td>
      </tr>
    `).join('');
    
    Swal.fire({
      title: `Transaction: ${tx.sn}`,
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>Name:</strong> ${tx.name}</p>
          <p><strong>Date:</strong> ${tx.date}</p>
          ${tx.final_description ? `<p><strong>Notes:</strong> ${tx.final_description}</p>` : ''}
          <br/>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e2e8f0;">Code</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e2e8f0;">Debit (Dr)</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e2e8f0;">Credit (Cr)</th>
              </tr>
            </thead>
            <tbody>${linesHtml}</tbody>
            <tfoot>
              <tr>
                <td style="padding: 8px; text-align: right; font-weight: bold;">Totals:</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">${formatMoney(tx.totalDr)}</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">${formatMoney(tx.totalCr)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `,
      width: 600,
      confirmButtonText: 'Close',
      confirmButtonColor: '#0ea5e9'
    });
  };

  const handleDownload = (tx) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${tx.sn}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header-center { text-align: center; margin-bottom: 30px; }
            .header-center h1 { color: #0ea5e9; margin: 0; font-size: 24px; }
            .header-center p { margin: 5px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f9f9f9; }
            .right { text-align: right; }
            .total { font-weight: bold; font-size: 1.1em; }
          </style>
        </head>
        <body>
          <div class="header-center">
            <h1>${orgName || 'Finora'}</h1>
            <p>Official Receipt</p>
          </div>
          <p><strong>Transaction SN:</strong> ${tx.sn}</p>
          <p><strong>Name:</strong> ${tx.name}</p>
          <p><strong>Date:</strong> ${tx.date}</p>
          ${tx.final_description ? `<p><strong>Notes:</strong> ${tx.final_description}</p>` : ''}
          
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th class="right">Debit (Dr)</th>
                <th class="right">Credit (Cr)</th>
              </tr>
            </thead>
            <tbody>
              ${tx.lines.map(l => `
                <tr>
                  <td>${l.code_number}</td>
                  <td class="right">${l.type === 'Dr' ? formatMoney(l.amount) : '-'}</td>
                  <td class="right">${l.type === 'Cr' ? formatMoney(l.amount) : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td class="right total">Totals:</td>
                <td class="right total">${formatMoney(tx.totalDr)}</td>
                <td class="right total">${formatMoney(tx.totalCr)}</td>
              </tr>
            </tfoot>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
      {/*  Section Header with Filters  */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
          <p className="text-sm text-slate-500">View and manage your recent activity</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/transactions" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-sm shadow-brand-100 transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>
      
      {/*  High-End Minimalist Table  */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">SN</th>
              <th className="py-3 px-3">Transaction Name</th>
              <th className="py-3 px-3 text-right">Debit (Dr)</th>
              <th className="py-3 px-3 text-right">Credit (Cr)</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {transactions.slice(0, 5).map(tx => (
              <tr className="hover:bg-slate-50/50 transition-colors" key={tx.id}>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-900">
                  <div className="font-medium">{tx.date}</div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                    {tx.sn}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-900">{tx.name}</span>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                  {formatMoney(tx.totalDr)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                  {formatMoney(tx.totalCr)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-center text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleView(tx)}
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
                  </div>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-500">No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/*  Table Footer Pagination/Link  */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500">Showing {Math.min(5, transactions.length)} most recent transactions</span>
        <Link to="/transactions" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
          <span>View all transactions</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>
    </section>
  );
}
