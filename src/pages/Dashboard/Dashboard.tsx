import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function Dashboard() {
  const [stats, setStats] = useState({ solved: 0, total: 0, flashcardsDue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: solvedCount } = await supabase
        .from('solutions')
        .select('*', { count: 'exact', head: true });
        
      const { count: totalCount } = await supabase
        .from('problems')
        .select('*', { count: 'exact', head: true });
        
      const { count: dueCount } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .lte('next_review_at', new Date().toISOString());

      setStats({
        solved: solvedCount || 0,
        total: totalCount || 0,
        flashcardsDue: dueCount || 0
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <div className="container">Loading dashboard...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-primary)' }}>{stats.solved}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Problems Solved</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.total}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Total Problems</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stats.flashcardsDue > 0 ? '#f59e0b' : '#10b981' }}>
            {stats.flashcardsDue}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>Flashcards Due</div>
        </div>
      </div>
      
      <div className="card">
        <h2>Welcome to your personal DSA workspace</h2>
        <p style={{ marginTop: 'var(--spacing-2)', color: 'var(--text-secondary)' }}>
          Write your solutions in the local `solutions/` folder, commit and push to GitHub, and review your progress here.
        </p>
      </div>
    </div>
  );
}
