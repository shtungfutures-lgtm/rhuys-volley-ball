export type ProspectStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'FOLLOW_UP'
  | 'MEETING_BOOKED'
  | 'QUALIFIED'
  | 'LOST'
  | 'WON';

export type Prospect = {
  id: string;
  companyName: string;
  contactName: string;
  ownerName: string;
  status: ProspectStatus;
  nextActionAt: string;
  lastActivityAt: string;
};

export type Task = {
  id: string;
  title: string;
  ownerName: string;
  dueAt: string;
  automated: boolean;
  state: 'TODO' | 'DONE' | 'CANCELED';
};
