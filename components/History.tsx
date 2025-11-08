
import React from 'react';
import type { Job } from '../types';
import { TrashIcon, DownloadIcon, LinkIcon } from './IconComponents';

interface HistoryProps {
  jobHistory: Job[];
  deleteJob: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ jobHistory, deleteJob }) => {

  const exportToCSV = () => {
    if (jobHistory.length === 0) return;
    const headers = "Job Title,Company,Date,Link\n";
    const rows = jobHistory.map(job => 
      `"${job.title.replace(/"/g, '""')}","${job.company.replace(/"/g, '""')}","${job.date}","${job.link}"`
    ).join('\n');
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "job_history.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold">Job Application History</h1>
        <p className="mt-2 text-lg text-gray-300">Keep track of your job search journey.</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
        <div className="flex justify-end mb-4">
          <button
            onClick={exportToCSV}
            disabled={jobHistory.length === 0}
            className="flex items-center px-4 py-2 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>
        
        <div className="space-y-4">
          {jobHistory.length > 0 ? (
            jobHistory.map(job => (
              <div key={job.id} className="p-4 bg-gray-800/60 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-gray-400">{job.company}</p>
                  <p className="text-sm text-gray-500 mt-1">Tracked on: {job.date}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                   <a href={job.link} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-300 bg-blue-600/50 hover:bg-blue-600/80 rounded-full transition-colors" title="Visit Link">
                     <LinkIcon className="w-5 h-5" />
                   </a>
                   <button onClick={() => deleteJob(job.id)} className="p-2 text-gray-300 bg-red-600/50 hover:bg-red-600/80 rounded-full transition-colors" title="Delete">
                     <TrashIcon className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No job history yet.</p>
              <p className="text-sm">Generate a cover letter or find jobs to start tracking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
