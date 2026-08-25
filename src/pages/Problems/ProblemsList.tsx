import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type Problem = Database['public']['Tables']['problems']['Row'];
type Solution = Database['public']['Tables']['solutions']['Row'];

export function ProblemsList() {
  const [problems, setProblems] = useState<(Problem & { solutions: Solution[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      const { data, error } = await supabase
        .from('problems')
        .select(`
          *,
          solutions (*)
        `)
        .order('topic');

      if (error) {
        console.error('Error fetching problems:', error);
      } else {
        setProblems(data as any);
      }
      setLoading(false);
    };

    fetchProblems();
  }, []);

  if (loading) return <div className="container">Loading problems...</div>;

  // Group by topic
  const grouped = problems.reduce((acc, prob) => {
    if (!acc[prob.topic]) acc[prob.topic] = [];
    acc[prob.topic].push(prob);
    return acc;
  }, {} as Record<string, typeof problems>);

  return (
    <div className="container">
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Problems Library</h1>
      
      {Object.entries(grouped).map(([topic, probs]) => (
        <div key={topic} style={{ marginBottom: 'var(--spacing-8)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--brand-primary)' }}>{topic}</h2>
          <div style={{ display: 'grid', gap: 'var(--spacing-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {probs.map(prob => (
              <Link to={`/problems/${prob.slug}`} key={prob.id} className="card" style={{ display: 'block', transition: 'border-color 0.2s' }}>
                <h3 style={{ marginBottom: 'var(--spacing-2)' }}>{prob.title}</h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', fontSize: '0.875rem' }}>
                  <span style={{ color: prob.difficulty === 'Easy' ? '#10b981' : prob.difficulty === 'Medium' ? '#f59e0b' : '#ef4444' }}>
                    {prob.difficulty}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span style={{ color: prob.solutions?.length > 0 ? '#10b981' : 'var(--text-muted)' }}>
                    {prob.solutions?.length > 0 ? 'Solved' : 'Unsolved'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      
      {problems.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No problems synced yet.</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-2)' }}>Push code to the solutions directory to auto-sync.</p>
        </div>
      )}
    </div>
  );
}
