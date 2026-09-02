import React, { useState } from 'react';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { login } from '../../lib/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AththarPortfolio2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(username, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative">
      {/* Back Button */}
      <button
        onClick={onBackToHome}
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6F6965] hover:text-[#171514] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Public Portfolio</span>
      </button>

      <div className="max-w-md w-full space-y-8 bg-[#FAF8F5] p-8 sm:p-10 rounded-2xl border border-[#E8E3DD] shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#171514] text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-5 h-5 text-[#9B0F06]" />
          </div>
          <h2 className="text-2xl font-bold font-display text-[#171514] tracking-tight">
            Portfolio CMS Portal
          </h2>
          <p className="text-xs font-mono text-[#6F6965]">
            Authorized access for content and telemetry management
          </p>
        </div>

        {/* Initial Credentials Callout */}
        <div className="p-4 bg-[#F7F4F0] border border-[#E8E3DD] rounded-lg text-xs font-mono space-y-1">
          <div className="flex items-center gap-1.5 text-[#9B0F06] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Default PRD Credentials:</span>
          </div>
          <div className="text-[#6F6965]">
            User: <code className="text-[#171514] font-bold">admin</code>
          </div>
          <div className="text-[#6F6965]">
            Pass: <code className="text-[#171514] font-bold">AththarPortfolio2026!</code>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#171514] font-semibold mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E8E3DD] rounded-lg text-sm text-[#171514] focus:outline-none focus:ring-2 focus:ring-[#9B0F06] font-mono"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#171514] font-semibold mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E8E3DD] rounded-lg text-sm text-[#171514] focus:outline-none focus:ring-2 focus:ring-[#9B0F06] font-mono"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#171514] hover:bg-[#9B0F06] disabled:opacity-50 text-white font-mono text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
