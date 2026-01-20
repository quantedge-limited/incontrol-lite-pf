"use client";

import { useEffect, useMemo, useState } from 'react';
import { Client, CLIENTS_KEY } from './types';
import ClientForm from './ClientForm';
import ClientsTable from './ClientsTable';
// 1. Added Toastify imports
import { toast, ToastContainer } from 'react-toastify';


function loadClients(): Client[] { 
  try { 
    const raw = localStorage.getItem(CLIENTS_KEY); 
    return raw ? JSON.parse(raw) : []; 
  } catch { 
    return []; 
  } 
}

export default function ClientsDashboard() {
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);
  const [showMobileTable, setShowMobileTable] = useState(false);

  useEffect(() => { 
    try { 
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients)); 
    } catch (err) {
      console.error("Failed to save clients", err);
    } 
  }, [clients]);

  function addClient(c: Client) { 
    setClients(s => [c, ...s]); 
    toast.success("Client registered successfully!");
  }

  // 2. Updated deletion logic with Toastify custom confirmation
  function deleteClient(id: string) { 
    const Msg = ({ closeToast }: { closeToast: () => void }) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-emerald-950">
          Are you sure you want to delete this client?
        </p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={closeToast}
            className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              setClients(s => s.filter(x => x.id !== id)); 
              toast.success("Client record removed.");
              closeToast();
            }}
            className="px-3 py-1 text-xs bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    );

    toast.warn(<Msg closeToast={function (): void {
      throw new Error('Function not implemented.');
    } } />, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase(); 
    if (!q) return clients;
    return clients.filter(c => 
      `${c.name} ${c.contact} ${c.email} ${c.notes}`.toLowerCase().includes(q)
    );
  }, [clients, query]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      {/* 3. Toast Container added to render messages */}
      <ToastContainer />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-950">
            Client Directory
          </h1>
          <p className="text-emerald-600 mt-1">
            Manage client records for your loyal customers and bulk buyers plus their contact details.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowMobileTable(!showMobileTable)}
              className="xl:hidden px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {showMobileTable ? 'Hide Client List' : 'View Client List'}
            </button>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                Total Clients: {clients.length}
            </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Sidebar: Form Container */}
        <div className="xl:col-span-4">
          <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-emerald-50/50 border-b border-emerald-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-emerald-900 uppercase tracking-wider">
                Registration
              </h3>
            </div>
            <div className="p-5">
              <ClientForm onSave={addClient} />
            </div>
          </div>
        </div>

        {/* Main: Table Container */}
        <div className={`xl:col-span-8 ${showMobileTable ? 'block' : 'hidden xl:block'}`}>
          <div className="bg-white border border-emerald-100 shadow-sm overflow-hidden">
            <div className="bg-emerald-50/50 border-b border-emerald-100 px-5 py-4 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-emerald-900 uppercase tracking-wider">
                Client List
              </h3>
            </div>
            
            {/* 4. Improved Horizontal Scroll: Added min-width to force sliding on mobile */}
            <div className="p-0 overflow-x-auto">
              <div className="min-w-150 w-full">
                <ClientsTable 
                  clients={filtered} 
                  onView={(c) => setSelected(c)} 
                  onDelete={deleteClient} 
                  onSearch={setQuery} 
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}