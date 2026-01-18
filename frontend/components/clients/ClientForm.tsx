"use client";

import { useState } from 'react';
import { Client } from './types';

export default function ClientForm({ onSave }:{ onSave:(c:Client)=>void}){
  const [name,setName]=useState('');
  const [contact,setContact]=useState('');
  const [email,setEmail]=useState('');
  const [address,setAddress]=useState('');
  const [notes,setNotes]=useState('');

  function submit(e:React.FormEvent){
    e.preventDefault();
    const c:Client={ id:`c-${Date.now()}`, name: name||'Unnamed', contact: contact||undefined, email: email||undefined, address: address||undefined, notes: notes||undefined, dateAdded: new Date().toISOString() };
    onSave(c);
    setName(''); setContact(''); setEmail(''); setAddress(''); setNotes('');
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-sm text-emerald-700">Name</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="text-sm text-emerald-700">Contact</label>
        <input value={contact} onChange={(e)=>setContact(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="text-sm text-emerald-700">Email</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="text-sm text-emerald-700">Address</label>
        <input value={address} onChange={(e)=>setAddress(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
      </div>
      <div className="sm:col-span-2">
        <label className="text-sm text-emerald-700">Notes</label>
        <input value={notes} onChange={(e)=>setNotes(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <button type="submit" className="px-4 py-2 bg-emerald-800 text-white rounded">Add Client</button>
      </div>
    </form>
  );
}
