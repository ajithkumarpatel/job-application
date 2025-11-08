

import React, { useState, useCallback, useEffect } from 'react';
// FIX: Use BrowserRouter instead of HashRouter and ensure imports align with react-router-dom v6.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import History from './components/History';
import Login from './components/Login';
import type { ResumeAnalysis, Job } from './types';
import { 
  isFirebaseConfigured, // Import the new flag to check configuration
  auth, 
  onAuthStateChanged, 
  logout,
  getResumeAnalysis,
  getJobHistory,
  saveResumeAnalysis,
  addJobToHistoryInDb,
  deleteJobFromHistoryInDb,
} from './lib/firebase.js';
// FIX: Explicitly import the User type from firebase/auth to ensure correct type inference.
// This prevents AuthUser from being resolved to `never` when Firebase is not configured.
import type { User } from 'firebase/auth';

type AuthUser = User | null;

// FIX: A new component to display a helpful message when Firebase is not configured.
// This prevents the app from crashing with a blank screen.
const FirebaseNotConfigured: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2b1055] to-[#7597de] text-white p-4">
    <div className="w-full max-w-2xl p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-red-400">Configuration Required</h1>
      <p className="text-lg text-gray-200">
        Welcome to the Gemini Job Dashboard!
      </p>
      <p className="text-gray-300">
        To get started, you need to connect the app to your own Firebase project. This will allow you to securely sign in and save your job application history.
      </p>
      <div className="text-left bg-gray-900/50 p-4 rounded-lg border border-gray-600 mt-4">
        <h2 className="text-xl font-semibold mb-2">Next Steps:</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>Please refer to the <code className="bg-gray-700 p-1 rounded">README.md</code> file in your project.</li>
          <li>Follow the instructions to create a Firebase project and get your API keys.</li>
          <li>Add your keys to your environment variables to activate the application.</li>
        </ol>
      </div>
       <p className="mt-6 text-sm text-gray-400">
        This is a one-time setup. Once configured, you'll have your own personal AI job assistant!
      </p>
    </div>
  </div>
);


const App: React.FC = () => {
  // FIX: Check if Firebase is configured. If not, show the setup instructions instead of crashing.
  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />;
  }

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
    
    // FIX: Explicitly define the type of newJobData for better type safety.
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
        <Routes>
          <Route path="/dashboard" element={<Dashboard setResumeAnalysis={setResumeAnalysis} resumeAnalysis={resumeAnalysis} addJobToHistory={addJobToHistory} />} />
          <Route path="/cover-letter" element={<CoverLetterGenerator resumeAnalysis={resumeAnalysis} addJobToHistory={addJobToHistory} />} />
          <Route path="/history" element={<History jobHistory={jobHistory} deleteJob={deleteJobFromHistory} />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};


export default App;