import { Prospect } from '@/types/domain';

export function computeConversionRate(items: Prospect[]): number {
  if (items.length === 0) {
    return 0;
  }

  const wonCount = items.filter((item) => item.status === 'WON').length;
  return (wonCount / items.length) * 100;
}

export function computeFollowUpRisk(items: Prospect[]): number {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const atRisk = items.filter((item) => {
    const nextAction = new Date(item.nextActionAt).getTime();
    return now - nextAction > sevenDaysMs;
  }).length;

  if (items.length === 0) {
    return 0;
  }

  return (atRisk / items.length) * 100;
}
