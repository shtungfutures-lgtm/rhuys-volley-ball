import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prospection SaaS',
  description: 'Pilotage des relances commerciales'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <h1>ProspectFlow</h1>
            <nav>
              <a href="/">Dashboard</a>
              <a href="/prospects">Prospects</a>
              <a href="/tasks">Relances</a>
            </nav>
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
