"use client";

import { useEffect, useMemo, useState } from 'react';
import { Client, CLIENTS_KEY } from './types';
import ClientForm from './ClientForm';
import ClientsTable from './ClientsTable';

function loadClients(): Client[] { try { const raw = localStorage.getItem(CLIENTS_KEY); return raw?JSON.parse(raw):[] } catch { return [] } }

export default function ClientsDashboard(){
  const [clients, setClients] = useState<Client[]>(()=>loadClients());
  const [query,setQuery]=useState('');
  const [selected, setSelected] = useState<Client | null>(null);

  useEffect(()=>{ try{ localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients)); }catch{} }, [clients]);

  function addClient(c: Client){ setClients(s=>[c,...s]); }
  function deleteClient(id:string){ setClients(s=>s.filter(x=>x.id!==id)); }

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase(); if(!q) return clients;
    return clients.filter(c=>`${c.name} ${c.contact} ${c.email} ${c.notes}`.toLowerCase().includes(q));
  }, [clients, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-900">Clients</h1>
          <p className="text-sm text-emerald-600">Manage client records and contact details.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-emerald-800">Add Client</h3>
            <ClientForm onSave={addClient} />
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-emerald-800">Client List</h3>
            <ClientsTable clients={filtered} onView={(c)=>setSelected(c)} onDelete={deleteClient} onSearch={setQuery} />
          </div>
        </div>
      </div>
    </div>
  );
}
