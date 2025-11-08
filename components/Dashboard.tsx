
import React, { useState, useCallback } from 'react';
import { analyzeResume } from '../services/geminiService';
import type { ResumeAnalysis, Job } from '../types';
import Spinner from './Spinner';
import { UploadIcon, LightBulbIcon, BriefcaseIcon, KeyIcon, SearchIcon, LinkIcon } from './IconComponents';

interface DashboardProps {
  resumeAnalysis: ResumeAnalysis | null;
  setResumeAnalysis: (analysis: ResumeAnalysis | null) => void;
  addJobToHistory: (job: Omit<Job, 'id' | 'date'>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ resumeAnalysis, setResumeAnalysis, addJobToHistory }) => {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!resumeText) {
      setError('Please upload or paste a resume first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await analyzeResume(resumeText);
      setResumeAnalysis(analysis);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setResumeAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }, [resumeText, setResumeAnalysis]);
  
  const findJobs = () => {
    if (!resumeAnalysis) return;
    const { skills, jobTitles } = resumeAnalysis;
    const query = [...jobTitles, ...skills].join(' ');
    
    const encodedQuery = encodeURIComponent(query);
    const naukriQuery = query.trim().replace(/\s+/g, '-').toLowerCase();

    const urls = [
        `https://www.linkedin.com/jobs/search/?keywords=${encodedQuery}`,
        `https://www.indeed.com/jobs?q=${encodedQuery}`,
        `https://www.naukri.com/${naukriQuery}-jobs`
    ];

    urls.forEach(url => window.open(url, '_blank'));
    
    addJobToHistory({
      title: jobTitles[0] || "General Job Search",
      company: "Multiple Job Sites",
      link: `https://www.google.com/search?q=${encodedQuery}+jobs`
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold">Welcome to your Dashboard 👋</h1>
        <p className="mt-2 text-lg text-gray-300">Analyze your résumé to unlock job matches and generate cover letters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Section */}
        <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">1. Provide Your Résumé</h2>
          
          <div className="space-y-4">
            <label htmlFor="file-upload" className="relative cursor-pointer bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg inline-flex items-center justify-center w-full border-2 border-dashed border-gray-400 transition-colors">
              <UploadIcon className="w-6 h-6 mr-3" />
              <span>{fileName || 'Upload a .txt or .md file'}</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".txt,.md,.pdf" onChange={handleFileChange} />
            </label>
            
            <div className="relative flex items-center justify-center">
                <div className="flex-grow border-t border-gray-500"></div>
                <span className="flex-shrink mx-4 text-gray-400">OR</span>
                <div className="flex-grow border-t border-gray-500"></div>
            </div>

            <textarea
              className="w-full h-48 p-3 bg-gray-800/60 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-200"
              placeholder="Paste your résumé text here..."
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                if (fileName) setFileName('');
              }}
            />
            
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !resumeText}
              className="w-full flex items-center justify-center px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {isLoading ? <Spinner /> : <><LightBulbIcon className="w-6 h-6 mr-2" /><span>Analyze Résumé</span></>}
            </button>

            {error && <p className="text-red-400 text-center">{error}</p>}
          </div>
        </div>

        {/* Output Section */}
        <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 min-h-[300px]">
          <h2 className="text-2xl font-semibold mb-4">2. Your AI Analysis</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-full pt-10">
              <Spinner />
              <span className="ml-3">Analyzing...</span>
            </div>
          ) : resumeAnalysis ? (
            <div className="space-y-6 animate-fade-in">
              <InfoCard icon={<BriefcaseIcon />} title="Potential Job Titles" items={resumeAnalysis.jobTitles} color="text-green-400" />
              <InfoCard icon={<KeyIcon />} title="Top Skills" items={resumeAnalysis.skills} color="text-yellow-400" />
              <InfoCard icon={<LinkIcon />} title="Keywords" items={resumeAnalysis.keywords} color="text-purple-400" />
              <button
                onClick={findJobs}
                className="w-full flex items-center justify-center px-6 py-3 mt-6 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-all transform hover:scale-105"
              >
                <SearchIcon className="w-6 h-6 mr-2" />
                Find Jobs on Top Sites
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full pt-10 text-gray-400">
              <p>Your résumé analysis will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Fix: Specified SVG props for the icon element to ensure type safety with React.cloneElement.
const InfoCard: React.FC<{ icon: React.ReactElement<React.SVGProps<SVGSVGElement>>, title: string, items: string[], color: string }> = ({ icon, title, items, color }) => (
    <div>
        <h3 className={`flex items-center text-lg font-semibold mb-2 ${color}`}>
            {/* Fix: Removed unnecessary cast now that icon prop is correctly typed. */}
            {React.cloneElement(icon, { className: "w-6 h-6 mr-2" })}
            {title}
        </h3>
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                <span key={index} className="px-3 py-1 bg-gray-700/80 text-gray-200 rounded-full text-sm">
                    {item}
                </span>
            ))}
        </div>
    </div>
);

export default Dashboard;