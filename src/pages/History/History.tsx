import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Revision = Database['public']['Tables']['solution_revisions']['Row'];
type Solution = Database['public']['Tables']['solutions']['Row'];
type Problem = Database['public']['Tables']['problems']['Row'];

export function History() {
  const [searchParams] = useSearchParams();
  const solutionId = searchParams.get('solution_id');
  
  const [revisions, setRevisions] = useState<(Revision & { solutions: (Solution & { problems: Problem }) | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRev, setSelectedRev] = useState<typeof revisions[0] | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      let query = supabase
        .from('solution_revisions')
        .select(`
          *,
          solutions (
            *,
            problems (*)
          )
        `)
        .order('created_at', { ascending: false });
        
      if (solutionId) {
        query = query.eq('solution_id', solutionId);
      }
      
      const { data, error } = await query;
      
      if (!error && data) {
        setRevisions(data as any);
        if (data.length > 0) setSelectedRev(data[0] as any);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [solutionId]);

  if (loading) return <div className="container">Loading history...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Revision History</h1>
      
      {revisions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No history found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {revisions.map((rev) => (
              <div 
                key={rev.id} 
                className="card"
                style={{ 
                  cursor: 'pointer', 
                  borderColor: selectedRev?.id === rev.id ? 'var(--brand-primary)' : 'var(--border-color)',
                  padding: 'var(--spacing-3)'
                }}
                onClick={() => setSelectedRev(rev)}
              >
                <div style={{ fontWeight: 500, marginBottom: 'var(--spacing-1)' }}>
                  {rev.commit_message}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {rev.solutions?.problems?.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-2)' }}>
                  <span>{rev.commit_sha.substring(0, 7)}</span>
                  <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            {selectedRev && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <h3 style={{ marginBottom: 'var(--spacing-1)' }}>{selectedRev.commit_message}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Problem: <Link to={`/problems/${selectedRev.solutions?.problems?.slug}`}>{selectedRev.solutions?.problems?.title}</Link>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <div>Commit: {selectedRev.commit_sha.substring(0, 7)}</div>
                    <div>{new Date(selectedRev.created_at).toLocaleString()}</div>
                  </div>
                </div>
                
                <div style={{ borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
                  <SyntaxHighlighter 
                    language={selectedRev.solutions?.language === 'python' ? 'python' : 'javascript'} 
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '1rem', fontSize: '0.875rem' }}
                    showLineNumbers
                  >
                    {selectedRev.code}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
