import { ProspectTable } from '@/components/ProspectTable';
import { prospects } from '@/server/mock-data';

export default function ProspectsPage() {
  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">Prospects</p>
        <h2>Liste des prospects</h2>
      </header>

      <section className="panel">
        <ProspectTable items={prospects} />
      </section>
    </section>
  );
}
