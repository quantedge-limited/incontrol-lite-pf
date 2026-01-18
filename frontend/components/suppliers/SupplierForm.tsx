"use client";

import { useState } from 'react';
import { Supplier } from './types';

export default function SupplierForm({ onSave }: { onSave: (s: Supplier) => void }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [supplies, setSupplies] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const supplier: Supplier = {
      id: `sp-${Date.now()}`,
      name: name || 'Unnamed Supplier',
      contact: contact || undefined,
      email: email || undefined,
      address: address || undefined,
      supplies: supplies || undefined,
      dateAdded: new Date().toISOString(),
    };
    onSave(supplier);
    setName('');
    setContact('');
    setEmail('');
    setAddress('');
    setSupplies('');
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm text-emerald-700">Name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm text-emerald-700">Contact</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm text-emerald-700">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm text-emerald-700">Address</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-emerald-700">Supplies (brief)</label>
        <input value={supplies} onChange={(e) => setSupplies(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <button type="submit" className="px-4 py-2 bg-emerald-800 text-white rounded">Save Supplier</button>
      </div>
    </form>
  );
}
