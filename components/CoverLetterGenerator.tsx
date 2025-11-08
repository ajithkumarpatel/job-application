
import React, { useState, useCallback, useEffect } from 'react';
import { generateCoverLetter } from '../services/geminiService';
import type { ResumeAnalysis, Job } from '../types';
import Spinner from './Spinner';
import { DocumentTextIcon, ClipboardCopyIcon, CheckCircleIcon } from './IconComponents';

interface CoverLetterGeneratorProps {
  resumeAnalysis: ResumeAnalysis | null;
  addJobToHistory: (job: Omit<Job, 'id' | 'date'>) => void;
}

const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ resumeAnalysis, addJobToHistory }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!resumeAnalysis) {
      setError("Please analyze your résumé on the Dashboard page first.");
    } else {
      setError(null);
    }
  }, [resumeAnalysis]);

  const handleGenerate = useCallback(async () => {
    if (!resumeAnalysis) {
      setError('Résumé analysis is missing. Please go to the Dashboard.');
      return;
    }
    if (!jobTitle || !companyName) {
      setError('Please provide both a job title and a company name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedLetter('');

    try {
      const letter = await generateCoverLetter(jobTitle, companyName, resumeAnalysis);
      setGeneratedLetter(letter);
      addJobToHistory({
        title: jobTitle,
        company: companyName,
        link: `https://www.google.com/search?q=${encodeURIComponent(companyName + ' careers')}`
      });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [jobTitle, companyName, resumeAnalysis, addJobToHistory]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold">AI Cover Letter Generator</h1>
        <p className="mt-2 text-lg text-gray-300">Create a tailored cover letter in seconds.</p>
      </div>

      <div className="max-w-4xl mx-auto p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter Job Title (e.g., Frontend Developer)"
            className="w-full p-3 bg-gray-800/60 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-200"
            disabled={!resumeAnalysis}
          />
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter Company Name (e.g., Google)"
            className="w-full p-3 bg-gray-800/60 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-200"
            disabled={!resumeAnalysis}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !resumeAnalysis || !jobTitle || !companyName}
          className="w-full flex items-center justify-center px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isLoading ? <Spinner /> : <><DocumentTextIcon className="w-6 h-6 mr-2" /><span>Generate Cover Letter</span></>}
        </button>

        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        
        {(generatedLetter || isLoading) && (
          <div className="mt-8 relative">
            <h3 className="text-xl font-semibold mb-4">Your Generated Cover Letter</h3>
            <div className="relative w-full h-96 p-4 bg-gray-800/60 rounded-lg border border-gray-600 text-gray-200 overflow-y-auto whitespace-pre-wrap">
              {isLoading ? (
                 <div className="flex justify-center items-center h-full">
                    <Spinner />
                    <span className="ml-3">Generating...</span>
                 </div>
              ) : (
                generatedLetter
              )}
            </div>
             {generatedLetter && !isLoading && (
               <button onClick={handleCopy} className="absolute top-2 right-2 flex items-center px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">
                 {isCopied ? <CheckCircleIcon className="w-4 h-4 mr-1 text-green-400" /> : <ClipboardCopyIcon className="w-4 h-4 mr-1" />}
                 {isCopied ? 'Copied!' : 'Copy'}
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
