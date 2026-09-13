import React, { useContext } from 'react';
import LoginHero from '../components/auth/LoginHero';
import LoginForm from '../components/auth/LoginForm';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const { orgName } = useContext(AuthContext);
    const date = new Date().getFullYear();
    return (
        <>
            <main className="flex-grow flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-12 relative overflow-hidden subtle-mesh-pattern">
                {/*  Subtle Ambient Lighting Blobs  */}
                <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-brand-100/50 rounded-full blur-3xl"></div>
                <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl"></div>

                <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
                    <LoginHero />
                    <LoginForm />
                </div>
            </main>

            <footer className="w-full py-6 border-t border-slate-200/80 bg-white/70 backdrop-blur-sm relative z-10 text-xs text-surface-muted" data-purpose="page-footer">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                        <p>© {date} {orgName || 'Finora Technologies'} All rights reserved.</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <a className="hover:text-surface-dark transition-colors" href="#privacy">Privacy Policy</a>
                        <a className="hover:text-surface-dark transition-colors" href="#terms">Terms of Service</a>
                        <a className="hover:text-surface-dark transition-colors flex items-center gap-1.5" href="#security">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Security &amp; Compliance</span>
                        </a>
                        <a className="hover:text-surface-dark transition-colors" href="#help">Support</a>
                    </div>
                </div>
            </footer>
        </>
    );
}