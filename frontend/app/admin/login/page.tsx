/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';


/**
 * AdminAuthPage Component
 * Updated Flow:
 * 1. Email collection -> Sends OTP
 * 2. OTP Verification & Persistence
 */
export default function AdminAuthPage() {
  const router = useRouter();
  
  // --- UI & FLOW STATE ---
  // 1 = Email Input, 2 = OTP Input
  const [step, setStep] = useState<1 | 2>(1); 
  const [loading, setLoading] = useState<boolean>(false); 

  // --- FORM DATA STATE ---
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  /**
   * Step 1: Request OTP
   * Sends email to backend to trigger the OTP process.
   */
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Logic: Simulate API call to send OTP
      console.log("Requesting OTP for:", email);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay
      
      toast.success(`OTP sent to ${email}`);
      setStep(2);
    } catch (err) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: OTP Verification Handler
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // MOCK VALIDATION: Using '123456' as the static test code
      if (otp === '123456') {
        const mockResponse = {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", 
          refreshToken: "def456-refresh-token-xyz",
          userEmail: email
        };

        // Persistence
        localStorage.setItem('access_token', mockResponse.accessToken);
        localStorage.setItem('refresh_token', mockResponse.refreshToken);
        localStorage.setItem('admin_email', mockResponse.userEmail);

        toast.success("Login successful! Redirecting...");

        // Small delay so user sees the success toast
        setTimeout(() => {
          router.push('/admin/dashboard/overview');
        }, 1500);
      } else {
        toast.error("Invalid OTP code. Try 123456.");
      }
    } catch (err) {
      toast.error("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* Toast Container for notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        {/* STEP 1: EMAIL INPUT */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your email to receive a login code</p>
            </div>
            
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
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-blue-300"
            >
              {loading ? 'Sending Code...' : 'Get OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Verify Identity</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the code sent to <br/>
                <span className="font-semibold text-gray-700">{email}</span>
              </p>
            </div>
            
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
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="w-full text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4"
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}