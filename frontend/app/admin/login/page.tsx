/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AdminAuthPage Component
 * Handles a multi-step authentication flow:
 * 1. Email/Password collection
 * 2. OTP Verification & LocalStorage token persistence
 * 3. Forgot Password request
 */
export default function AdminAuthPage() {
  const router = useRouter();
  
  // --- UI & FLOW STATE ---
  // 1 = Login, 2 = OTP, 3 = Forgot Password
  const [step, setStep] = useState<1 | 2 | 3>(1); 
  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- FORM DATA STATE ---
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  /**
   * Step 1: Initial Login Handler
   * In a real scenario, this sends credentials to the backend to trigger an OTP email.
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Logic: If API call is successful, proceed to OTP step
      console.log("Login submitted, sending OTP to:", email);
      setStep(2);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: OTP Verification Handler
   * Validates code, saves session tokens to LocalStorage, and redirects to Dashboard.
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // MOCK VALIDATION: Using '123456' as the static test code
      if (otp === '123456') {
        const mockResponse = {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", 
          refreshToken: "def456-refresh-token-xyz",
          userEmail: email
        };

        // --- PERSISTENCE LOGIC ---
        // Storing tokens in LocalStorage for persistent sessions across browser tabs
        localStorage.setItem('access_token', mockResponse.accessToken);
        localStorage.setItem('refresh_token', mockResponse.refreshToken);
        localStorage.setItem('admin_email', mockResponse.userEmail);

        console.log("Session persisted. Navigating to Dashboard...");

        // Redirecting to the nested overview route
        router.push('/admin/dashboard/overview');
      } else {
        setError("Invalid OTP code. Please use 123456 for testing.");
      }
    } catch (err) {
      setError("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Forgot Password Handler
   * Simulates sending a password reset link to the provided email.
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Password reset requested for:", email);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage("If an account exists, a reset link has been sent to your email.");
      // Option: Return to login after few seconds or keep message visible
    } catch (err) {
      setError("Failed to process request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        {/* STEP 1: LOGIN FORM */}
        {step === 1 && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
              <p className="text-sm text-gray-500 mt-1">Step 1: Enter your credentials</p>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded">{error}</p>}
            
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setStep(3); setError(null); }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input 
                type="password" 
                required
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-green-300"
            >
              {loading ? 'Processing...' : 'Next'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION FORM */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
              <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code sent to <br/><strong>{email}</strong></p>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded">{error}</p>}
            
            <div>
              <input 
                type="text" 
                placeholder="000000"
                required
                maxLength={6}
                className="w-full p-4 text-center text-3xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-green-300"
            >
              {loading ? 'Verifying...' : 'Verify & Enter Dashboard'}
            </button>
            
            <button 
              type="button" 
              onClick={() => { setStep(1); setError(null); }} 
              className="w-full text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* STEP 3: FORGOT PASSWORD FORM */}
        {step === 3 && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link</p>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm text-center font-medium bg-green-50 py-2 rounded">{successMessage}</p>}
            
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-green-300"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <button 
              type="button" 
              onClick={() => { setStep(1); setError(null); setSuccessMessage(null); }} 
              className="w-full text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}