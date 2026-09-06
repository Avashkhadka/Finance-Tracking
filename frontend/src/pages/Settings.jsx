import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Swal from 'sweetalert2';

export default function Settings() {
  const { token, orgName, refreshOrgName } = useContext(AuthContext);
  const [newOrgName, setNewOrgName] = useState(orgName || '');

  useEffect(() => {
    if (orgName) setNewOrgName(orgName);
  }, [orgName]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ org_name: newOrgName })
      });
      if (res.ok) {
        await refreshOrgName(); // Trigger a refresh in context to update headers/title
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Organization Name updated successfully.',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        const err = await res.json();
        Swal.fire('Error', err.error, 'error');
      }
    } catch(err) {
      console.error(err);
      Swal.fire('Error', 'Failed to connect to the server.', 'error');
    }
  };

  return (
    <>
      <DashboardHeader />
      
      <main className="w-full pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
            <p className="text-sm text-slate-500">Manage global organization configurations.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col self-start">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Organization Details</h2>
                <p className="text-xs text-slate-500">This name will appear in receipts and navigation.</p>
              </div>
              <span className="material-symbols-outlined text-brand-600">business</span>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleSave}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="orgName">Organization Name</label>
                <input 
                  className="w-full max-w-md px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" 
                  id="orgName" 
                  name="orgName" 
                  placeholder="e.g. Acme Corp" 
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  required 
                  type="text"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <button className="py-2.5 px-6 rounded-lg bg-brand-600 text-white font-medium text-sm shadow-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2" type="submit">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </main>
    </>
  );
}
