import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Database } from '../../types/database';

type Problem = Database['public']['Tables']['problems']['Row'];
type Solution = Database['public']['Tables']['solutions']['Row'];
type Revision = Database['public']['Tables']['solution_revisions']['Row'];

export function ProblemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      
      const { data: probData, error: probError } = await supabase
        .from('problems')
        .select('*')
        .eq('slug', slug || '')
        .single();
        
      if (probError || !probData) {
        console.error('Problem not found');
        setLoading(false);
        return;
      }
      
      setProblem(probData);

      const { data: solData, error: solError } = await supabase
        .from('solutions')
        .select('*')
        .eq('problem_id', probData.id)
        .single();

      if (solData) {
        setSolution(solData);
        
        const { data: revData } = await supabase
          .from('solution_revisions')
          .select('*')
          .eq('solution_id', solData.id)
          .order('created_at', { ascending: false });
          
        if (revData) {
          setRevisions(revData);
        }
      }
      
      setLoading(false);
    };

    fetchDetail();
  }, [slug]);

  if (loading) return <div className="container">Loading...</div>;
  if (!problem) return <div className="container">Problem not found.</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <div>
          <div style={{ color: 'var(--brand-primary)', marginBottom: 'var(--spacing-1)', fontWeight: 500 }}>
            {problem.topic}
          </div>
          <h1>{problem.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <Link to={`/history?solution_id=${solution?.id}`} className="btn btn-secondary">
            View History
          </Link>
          <button className="btn">Ask Gemini</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--spacing-6)' }}>
        <div>
          <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
            <h2 style={{ marginBottom: 'var(--spacing-4)', fontSize: '1.125rem' }}>Solution ({solution?.language || 'python'})</h2>
            {solution ? (
              <div style={{ borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
                <SyntaxHighlighter 
                  language={solution.language === 'python' ? 'python' : 'javascript'} 
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: '1rem', fontSize: '0.875rem' }}
                  showLineNumbers
                >
                  {solution.current_code}
                </SyntaxHighlighter>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No solution pushed yet.</p>
            )}
          </div>
        </div>
        
        <div>
          <div className="card" style={{ marginBottom: 'var(--spacing-4)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-2)' }}>Revisions</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>
              {revisions.length} commits synced
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {revisions.slice(0, 5).map(rev => (
                <div key={rev.id} style={{ padding: 'var(--spacing-2)', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--border-radius)', fontSize: '0.875rem' }}>
                  <div style={{ fontWeight: 500 }}>{rev.commit_message}</div>
                  <div style={{ color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-1)' }}>
                    <span>{rev.commit_sha.substring(0, 7)}</span>
                    <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
