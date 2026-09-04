import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, orgName } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            await login(data.token, data.user);

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Successfully logged in',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });

            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        const { value: reqEmail } = await Swal.fire({
            title: 'Reset Password',
            input: 'email',
            inputLabel: 'Enter your account email address',
            inputPlaceholder: 'name@company.com',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5'
        });
        
        if (reqEmail) {
            try {
                const res = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: reqEmail })
                });
                const data = await res.json();
                Swal.fire('Request Sent', data.message || 'If the email exists, an admin has been notified.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Failed to send request', 'error');
            }
        }
    };

    return (
        <section className="lg:col-span-5 w-full max-w-md mx-auto" data-purpose="auth-card-container">
            <div className="bg-surface-card rounded-2xl border border-surface-border p-7 sm:p-9 shadow-floating-auth">
                <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs font-medium text-brand-700 mb-3">
                        <svg className="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span>Secure Account Access</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-surface-dark">Welcome back</h2>
                    <p className="text-sm text-surface-muted mt-1">Enter your credentials to access your financial dashboard.</p>
                </div>

                <form className="space-y-4" data-purpose="login-form" onSubmit={handleLogin}>
                    {error && <div className="text-red-500 text-sm font-semibold mb-2">{error}</div>}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="email">Email address</label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                            </div>
                            <input className="block w-full pl-10 pr-4 py-2.5 text-sm text-surface-dark bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" id="email" name="email" placeholder="name@company.com" required type="email" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider" htmlFor="password">Password</label>
                            <a onClick={handleForgotPassword} className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline cursor-pointer">Forgot password?</a>
                        </div>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                            </div>
                            <input className="block w-full pl-10 pr-10 py-2.5 text-sm text-surface-dark bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" id="password" name="password" placeholder="••••••••••••" required type="password" value={password} onChange={e => setPassword(e.target.value)} />
                            <button aria-label="Toggle password visibility" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none" type="button">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div>
                        <button className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md shadow-brand-600/20 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all cursor-pointer" type="submit">
                            <span>Sign In to {orgName || 'FinanceManage'}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            </svg>
                        </button>
                    </div>
                </form>






            </div>
        </section>
    );
}
