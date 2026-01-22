/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';


export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); 
  const [loading, setLoading] = useState<boolean>(false); 
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); 
      toast.success(`OTP sent to ${email}`);
      setStep(2);
    } catch (err) {
      toast.error("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (otp === '123456') {
        localStorage.setItem('access_token', 'mock_token_here');
        localStorage.setItem('admin_email', email);

        toast.success("Login successful!");
        setTimeout(() => {
          router.push('/admin/dashboard/overview');
        }, 1000);
      } else {
        toast.error("Invalid OTP. Try 123456.");
      }
    } catch (err) {
      toast.error("Error during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Admin Login</h2>
            <input 
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              placeholder="admin@example.com"
            />
            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
              {loading ? 'Sending...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Verify OTP</h2>
            <input 
              type="text" required maxLength={6} value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-4 text-center text-3xl tracking-widest border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              placeholder="000000"
            />
            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}