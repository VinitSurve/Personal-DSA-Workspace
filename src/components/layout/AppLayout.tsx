import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Clock, BrainCircuit, Settings } from 'lucide-react';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--brand-primary)' }}>
          DSA Workspace
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/problems" className={`sidebar-link ${location.pathname.startsWith('/problems') ? 'active' : ''}`}>
            <BookOpen size={20} />
            Problems
          </Link>
          <Link to="/history" className={`sidebar-link ${location.pathname.startsWith('/history') ? 'active' : ''}`}>
            <Clock size={20} />
            History
          </Link>
          <Link to="/flashcards" className={`sidebar-link ${location.pathname.startsWith('/flashcards') ? 'active' : ''}`}>
            <BrainCircuit size={20} />
            Flashcards
          </Link>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
