import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { ProblemsList } from './pages/Problems/ProblemsList'
import { ProblemDetail } from './pages/Problem/ProblemDetail'
import { History } from './pages/History/History'

// Placeholders for remaining pages
const Auth = () => (
  <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh' }}>
    <div className="card" style={{ width: '400px' }}>
      <h2>Login to DSA Workspace</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>
        Local development mode placeholder.
      </p>
      <input type="email" placeholder="Email" style={{ marginBottom: 'var(--spacing-3)' }} />
      <input type="password" placeholder="Password" style={{ marginBottom: 'var(--spacing-4)' }} />
      <button className="btn" style={{ width: '100%' }}>Sign In</button>
    </div>
  </div>
);

const Flashcards = () => (
  <div className="container">
    <h1>Flashcards</h1>
    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-2)' }}>
      Review spaced repetition flashcards.
    </p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="problems" element={<ProblemsList />} />
        <Route path="problems/:slug" element={<ProblemDetail />} />
        <Route path="history" element={<History />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
