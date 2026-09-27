import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import RequirementsListPage from './pages/RequirementsListPage';
import RequirementDetailPage from './pages/RequirementDetailPage';
import AIRequirementAnalysisPage from './pages/AIRequirementAnalysisPage';
import TestScenariosPage from './pages/TestScenariosPage';
import TestCasesPage from './pages/TestCasesPage';
import TestCaseDetailPage from './pages/TestCaseDetailPage';
import TestExecutionPage from './pages/TestExecutionPage';
import BugsPage from './pages/BugsPage';
import BugDetailPage from './pages/BugDetailPage';
import AIBugAnalysisPage from './pages/AIBugAnalysisPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'white' }}>
        Loading Testing Assistant...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes (16 Pages Total) */}
          <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
          <Route path="/projects" element={<ProtectedLayout><ProjectsPage /></ProtectedLayout>} />
          <Route path="/projects/:id" element={<ProtectedLayout><ProjectDetailPage /></ProtectedLayout>} />
          <Route path="/requirements" element={<ProtectedLayout><RequirementsListPage /></ProtectedLayout>} />
          <Route path="/requirements/:id" element={<ProtectedLayout><RequirementDetailPage /></ProtectedLayout>} />
          <Route path="/requirements/:id/analysis" element={<ProtectedLayout><AIRequirementAnalysisPage /></ProtectedLayout>} />
          <Route path="/requirements/:id/scenarios" element={<ProtectedLayout><TestScenariosPage /></ProtectedLayout>} />
          <Route path="/test-cases" element={<ProtectedLayout><TestCasesPage /></ProtectedLayout>} />
          <Route path="/test-cases/:id" element={<ProtectedLayout><TestCaseDetailPage /></ProtectedLayout>} />
          <Route path="/test-cases/:id/execute" element={<ProtectedLayout><TestExecutionPage /></ProtectedLayout>} />
          <Route path="/bugs" element={<ProtectedLayout><BugsPage /></ProtectedLayout>} />
          <Route path="/bugs/:id" element={<ProtectedLayout><BugDetailPage /></ProtectedLayout>} />
          <Route path="/bugs/:id/analysis" element={<ProtectedLayout><AIBugAnalysisPage /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
