import { Prospect, Task } from '@/types/domain';

export const prospects: Prospect[] = [
  {
    id: 'p_001',
    companyName: 'Acme Industrie',
    contactName: 'Claire Dubois',
    ownerName: 'Nadia Martin',
    status: 'FOLLOW_UP',
    nextActionAt: '2026-04-10T09:00:00Z',
    lastActivityAt: '2026-04-08T14:30:00Z'
  },
  {
    id: 'p_002',
    companyName: 'Nova Logistics',
    contactName: 'Thomas Leroy',
    ownerName: 'Nadia Martin',
    status: 'MEETING_BOOKED',
    nextActionAt: '2026-04-11T13:00:00Z',
    lastActivityAt: '2026-04-09T08:45:00Z'
  },
  {
    id: 'p_003',
    companyName: 'Bastion Tech',
    contactName: 'Sonia Perez',
    ownerName: 'Hugo Bernard',
    status: 'CONTACTED',
    nextActionAt: '2026-04-12T15:30:00Z',
    lastActivityAt: '2026-04-07T10:15:00Z'
  },
  {
    id: 'p_004',
    companyName: 'Helios Conseil',
    contactName: 'Marc Garnier',
    ownerName: 'Hugo Bernard',
    status: 'NEW',
    nextActionAt: '2026-04-09T16:00:00Z',
    lastActivityAt: '2026-04-09T09:10:00Z'
  }
];

export const tasks: Task[] = [
  {
    id: 't_001',
    title: 'Relance email J+2',
    ownerName: 'Nadia Martin',
    dueAt: '2026-04-09T14:00:00Z',
    automated: true,
    state: 'TODO'
  },
  {
    id: 't_002',
    title: 'Appel de qualification',
    ownerName: 'Hugo Bernard',
    dueAt: '2026-04-09T15:30:00Z',
    automated: false,
    state: 'TODO'
  },
  {
    id: 't_003',
    title: 'Préparer le RDV de démo',
    ownerName: 'Nadia Martin',
    dueAt: '2026-04-10T10:00:00Z',
    automated: false,
    state: 'TODO'
  }
];
