import { KpiCard } from '@/components/KpiCard';
import { ProspectTable } from '@/components/ProspectTable';
import { computeConversionRate, computeFollowUpRisk } from '@/lib/kpis';
import { prospects, tasks } from '@/server/mock-data';

export default function DashboardPage() {
  const conversionRate = computeConversionRate(prospects);
  const followUpRisk = computeFollowUpRisk(prospects);

  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">Dashboard</p>
        <h2>Suivi de la prospection</h2>
      </header>

      <div className="kpi-grid">
        <KpiCard label="Prospects actifs" value={String(prospects.length)} hint="Semaine en cours" />
        <KpiCard label="Tâches à faire" value={String(tasks.filter((task) => task.state === 'TODO').length)} />
        <KpiCard label="Taux de conversion" value={`${conversionRate.toFixed(0)}%`} />
        <KpiCard label="Prospects à risque" value={`${followUpRisk.toFixed(0)}%`} hint="Sans action depuis > 7 jours" />
      </div>

      <section className="panel">
        <h3>Pipeline actuel</h3>
        <ProspectTable items={prospects} />
      </section>
    </section>
  );
}
