

import React, { useState, useCallback, useEffect } from 'react';
// FIX: Update react-router-dom imports to use v6 syntax (Routes, Navigate) and switch to BrowserRouter.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import History from './components/History';
import Login from './components/Login';
import type { ResumeAnalysis, Job } from './types';
import { 
  auth, 
  onAuthStateChanged, 
  logout,
  getResumeAnalysis,
  getJobHistory,
  saveResumeAnalysis,
  addJobToHistoryInDb,
  deleteJobFromHistoryInDb,
} from './lib/firebase.js';

type AuthUser = Parameters<typeof onAuthStateChanged>[1] extends (user: infer U) => any ? U : never;

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [jobHistory, setJobHistory] = useState<Job[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user data from Firestore
        const [analysis, history] = await Promise.all([
          getResumeAnalysis(currentUser.uid),
          getJobHistory(currentUser.uid)
        ]);
        setResumeAnalysis(analysis as ResumeAnalysis | null);
        setJobHistory(history as Job[]);
      } else {
        // Clear data on logout
        setResumeAnalysis(null);
        setJobHistory([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleSetResumeAnalysis = useCallback(async (analysis: ResumeAnalysis | null) => {
    if (user && analysis) {
      await saveResumeAnalysis(user.uid, analysis);
    }
    setResumeAnalysis(analysis);
  }, [user]);

  const addJobToHistory = useCallback(async (job: Omit<Job, 'id' | 'date'>) => {
    if (!user) return;
    
    const newJobData: Omit<Job, 'id'> = {
        ...job,
        date: new Date().toISOString().split('T')[0],
    };

    // Avoid adding duplicates if the same job is tracked quickly
    if (jobHistory.some(j => j.title === newJobData.title && j.company === newJobData.company)) {
        return;
    }
    
    const newJobWithId = await addJobToHistoryInDb(user.uid, newJobData);
    setJobHistory(prev => [newJobWithId, ...prev]);

  }, [user, jobHistory]);

  const deleteJobFromHistory = useCallback(async (id: string) => {
    if (!user) return;
    await deleteJobFromHistoryInDb(user.uid, id);
    setJobHistory(prev => prev.filter(job => job.id !== id));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2b1055] to-[#7597de]">
        <h2 className="text-2xl font-semibold text-white animate-pulse">Loading...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#2b1055] to-[#7597de] text-white font-sans">
        <AppContent
          user={user}
          resumeAnalysis={resumeAnalysis}
          jobHistory={jobHistory}
          onLogout={handleLogout}
          setResumeAnalysis={handleSetResumeAnalysis}
          addJobToHistory={addJobToHistory}
          deleteJobFromHistory={deleteJobFromHistory}
        />
      </div>
    </BrowserRouter>
  );
};

interface AppContentProps {
  user: AuthUser;
  resumeAnalysis: ResumeAnalysis | null;
  jobHistory: Job[];
  onLogout: () => void;
  setResumeAnalysis: (analysis: ResumeAnalysis | null) => void;
  addJobToHistory: (job: Omit<Job, 'id' | 'date'>) => void;
  deleteJobFromHistory: (id: string) => void;
}


const AppContent: React.FC<AppContentProps> = ({
  user,
  resumeAnalysis,
  jobHistory,
  onLogout,
  setResumeAnalysis,
  addJobToHistory,
  deleteJobFromHistory,
}) => {
  
  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Navbar onLogout={onLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* FIX: Replaced v5 <Switch> with v6 <Routes> and updated <Route> syntax to use the 'element' prop. */}
        <Routes>
          <Route path="/dashboard" element={<Dashboard setResumeAnalysis={setResumeAnalysis} resumeAnalysis={resumeAnalysis} addJobToHistory={addJobToHistory} />} />
          <Route path="/cover-letter" element={<CoverLetterGenerator resumeAnalysis={resumeAnalysis} addJobToHistory={addJobToHistory} />} />
          <Route path="/history" element={<History jobHistory={jobHistory} deleteJob={deleteJobFromHistory} />} />
          {/* FIX: Replaced v5 <Redirect> with v6 <Navigate> for the catch-all route. */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};


export default App;
