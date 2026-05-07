import { tasks } from '@/server/mock-data';

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(date));
}

export default function TasksPage() {
  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">Relances</p>
        <h2>Tâches commerciales</h2>
      </header>

      <section className="panel">
        <div className="task-list">
          {tasks.map((task) => (
            <article key={task.id} className="task-item">
              <div>
                <p className="task-title">{task.title}</p>
                <p className="task-meta">Owner: {task.ownerName}</p>
              </div>
              <div>
                <p className="task-date">{formatDate(task.dueAt)}</p>
                <p className="task-meta">{task.automated ? 'Automatique' : 'Manuel'}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
