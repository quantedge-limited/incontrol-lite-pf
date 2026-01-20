export type Client = {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  address?: string;
  notes?: string;
  dateAdded: string;
};

export const CLIENTS_KEY = 'incontrol_clients_v1';
