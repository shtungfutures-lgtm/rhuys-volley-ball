import { Prospect } from '@/types/domain';

type ProspectTableProps = {
  items: Prospect[];
};

const statusLabels: Record<Prospect['status'], string> = {
  NEW: 'Nouveau',
  CONTACTED: 'Contacté',
  FOLLOW_UP: 'Relance',
  MEETING_BOOKED: 'RDV pris',
  QUALIFIED: 'Qualifié',
  LOST: 'Perdu',
  WON: 'Gagné'
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(date));
}

export function ProspectTable({ items }: ProspectTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Entreprise</th>
            <th>Contact</th>
            <th>Owner</th>
            <th>Statut</th>
            <th>Prochaine action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((prospect) => (
            <tr key={prospect.id}>
              <td>{prospect.companyName}</td>
              <td>{prospect.contactName}</td>
              <td>{prospect.ownerName}</td>
              <td>
                <span className={`status status-${prospect.status.toLowerCase()}`}>
                  {statusLabels[prospect.status]}
                </span>
              </td>
              <td>{formatDate(prospect.nextActionAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
