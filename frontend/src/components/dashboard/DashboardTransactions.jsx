import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import { toNepaliWords, toNepaliDigits } from 'nepali-number-words';

export default function DashboardTransactions({ transactions }) {
    const { orgName, orgAddress, currency } = useContext(AuthContext);
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
        const totalWords = toNepaliWords(tx.totalDr || 0) + ' मात्र';
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
            table { width: 100%; border-collapse: collapse; margin-top: 5px; height: 100%; font-size: 11px; }
            th, td { padding: 6px 8px; text-align: left; border: 1px solid #000; }
            th { background-color: #f9f9f9; font-weight: bold; border: 1px solid #000; }
            td { vertical-align: top; }
            .right { text-align: right; }
            .total { font-weight: bold; font-size: 1.1em; }
            .total-words { font-weight: bold; text-align: left; background-color: #f9f9f9; border-top: 1px solid #000; }
            .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
            .sig-box { width: 30%; text-align: center; border-top: 1px solid #000; padding-top: 5px; margin-top: 30px; font-weight: bold; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header-container ">
            <div class="header-left">
              <h1>${orgName || 'Finora'}</h1>
              ${orgAddress ? `<p>${orgAddress}</p>` : ''}
              <p>जनरल भौचर</p>
            </div>
            <div class="header-right">
              <p><strong>भौचर न:</strong> ${toNepaliDigits(tx.sn)}</p>
              <p><strong>मिति:</strong> ${toNepaliDigits(tx.date)}</p>
              ${tx.created_by ? `<p><strong> तयार गर्ने:</strong> ${tx.created_by}</p>` : ''}
            </div>
          </div>
          
          <div class="main-content">
            <table>
              <thead>
                <tr>
                  <th style="width: 15%">सङ्केत नम्बर</th>
                  <th style="width: 45%">लेखा श्रीर्षक</th>
                  <th class="right" style="width: 20%">डेबिट रकम</th>
                  <th class="right" style="width: 20%">क्रेडिट रकम</th>
                </tr>
              </thead>
              <tbody>
                ${tx.lines.map(l => `
                  <tr>
                    <td>${toNepaliDigits(l.code_number)}</td>
                    <td>${getCodeDescription(l.code_number)}</td>
                    <td class="right">${l.type === 'Dr' ? toNepaliDigits(formatMoney(l.amount)) : '-'}</td>
                    <td class="right">${l.type === 'Cr' ? toNepaliDigits(formatMoney(l.amount)) : '-'}</td>
                  </tr>
                `).join('')}
                <tr style="height: 100%;">
                  <td style="border-bottom: none;"></td>
                  <td style="border-bottom: none;"></td>
                  <td style="border-bottom: none;"></td>
                  <td style="border-bottom: none;"></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="right total">जम्मा:</td>
                  <td class="right total">${toNepaliDigits(formatMoney(tx.totalDr))}</td>
                  <td class="right total">${toNepaliDigits(formatMoney(tx.totalCr))}</td>
                </tr>
                <tr>
                  <td colspan="4" class="total-words">
                    अक्षररूपी: ${totalWords}
                  </td>
                </tr>
                <tr>
                  <td colspan="4" style="padding: 12px 8px;">
                    <strong>विवरण:</strong> ${tx.final_description || 'N/A'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="signatures">
            <div class="sig-box">तयार गर्ने</div>
            <div class="sig-box">चेक गर्ने</div>
            <div class="sig-box">स्वीकृत गर्ने</div>
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
                            <th className="py-3 px-3">Created By</th>
                            <th className="py-3 px-3 text-right">Debit (Dr)</th>
                            <th className="py-3 px-3 text-right">Credit (Cr)</th>
                            <th className="py-3 px-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                        {transactions.slice(0, 5).map(tx => (
                            <tr className="hover:bg-slate-50/50 transition-colors" key={tx.id}>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-900">
                                    <div className="font-medium">{toNepaliDigits(tx.date)}</div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                                        {toNepaliDigits(tx.sn)}
                                    </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                    <span className="text-sm text-slate-600">{tx.created_by || '-'}</span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                                    {toNepaliDigits(formatMoney(tx.totalDr))}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                                    {toNepaliDigits(formatMoney(tx.totalCr))}
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
                <Link to="/transactions/all" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
                    <span>View all transactions</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
            </div>
        </section>
    );
}
