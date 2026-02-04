import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Camera, FileVideo, FileImage, ShieldCheck, Activity, Database, History, RefreshCcw, AlertTriangle } from 'lucide-react';
import { analyzeMedia } from './services/geminiService';
import { AnalysisResult, MediaUpload } from './types';
import { ProvenanceChain } from './components/ProvenanceChain';

const App: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaUpload | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from "database" (localStorage)
  useEffect(() => {
    const savedHistory = localStorage.getItem('verisight_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Save to "database"
  const saveToHistory = (newResult: AnalysisResult) => {
    const updated = [newResult, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('verisight_history', JSON.stringify(updated));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const previewUrl = URL.createObjectURL(file);
      setSelectedMedia({ file, previewUrl, type });
      setResult(null);
      setError(null);
    }
  };

  const runAnalysis = async () => {
    if (!selectedMedia) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const analysis = await analyzeMedia(base64Data, selectedMedia.file.type);
          setResult(analysis);
          saveToHistory(analysis);
        } catch (err) {
          setError("Analysis failed. Please check your API key or file format.");
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(selectedMedia.file);
    } catch (err) {
      setIsAnalyzing(false);
      setError("An unexpected error occurred.");
    }
  };

  const reset = () => {
    setSelectedMedia(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">VERISIGHT <span className="text-blue-500">AI</span></h1>
              <p className="text-[10px] mono text-slate-500 uppercase tracking-widest">Digital Forensics Protocol</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <button className="hover:text-white transition-colors">Lab</button>
            <button className="hover:text-white transition-colors">Explorer</button>
            <button className="hover:text-white transition-colors">Docs</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass p-8 rounded-2xl border-dashed border-2 border-slate-700 hover:border-blue-500/50 transition-all">
            {!selectedMedia ? (
              <label className="flex flex-col items-center justify-center cursor-pointer py-12">
                <Upload className="w-12 h-12 text-slate-500 mb-4" />
                <span className="text-lg font-medium mb-1">Inject Media for Analysis</span>
                <span className="text-sm text-slate-500 text-center mb-6">Upload .jpg, .png, or .mp4 files</span>
                <div className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-sm font-semibold transition-all">
                  Browse Files
                </div>
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden group">
                {selectedMedia.type === 'image' ? (
                  <img src={selectedMedia.previewUrl} className="w-full aspect-square object-cover" alt="Preview" />
                ) : (
                  <video src={selectedMedia.previewUrl} className="w-full aspect-square object-cover" controls />
                )}
                
                {isAnalyzing && (
                   <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px]">
                      <div className="scanner-line"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="glass p-4 rounded-full animate-pulse">
                          <Activity className="w-8 h-8 text-blue-400" />
                        </div>
                      </div>
                   </div>
                )}

                {!isAnalyzing && !result && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={reset} className="p-2 bg-slate-900/80 rounded-lg hover:bg-rose-900/80 transition-all">
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {!result && selectedMedia && !isAnalyzing && (
            <button 
              onClick={runAnalysis}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 transition-all"
            >
              <Activity className="w-5 h-5" />
              RUN DEEPFAKE PROTOCOL
            </button>
          )}

          {isAnalyzing && (
            <div className="glass p-6 rounded-xl border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm font-semibold">AI ANALYSIS IN PROGRESS...</span>
              </div>
              <div className="space-y-2 text-xs text-slate-500 mono">
                <p>+ Loading multimodal model...</p>
                <p>+ Scanning pixel densities...</p>
                <p>+ Verifying metadata signatures...</p>
                <p>+ Cross-referencing latent artifacts...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-rose-500 shrink-0 w-5 h-5" />
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}

          {/* Database History Preview */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-slate-400 text-sm font-semibold uppercase tracking-widest">
              <Database className="w-4 h-4" />
              Recent Scans
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {history.length === 0 ? (
                <div className="col-span-2 text-center p-8 glass rounded-xl border-dashed border-slate-800 text-slate-600 text-sm">
                  No scan history in database
                </div>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="glass p-3 rounded-xl border-slate-800/50 hover:border-slate-700 transition-all cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${h.isDeepfake ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {h.isDeepfake ? 'FAKE' : 'REAL'}
                      </span>
                      <span className="text-[10px] text-slate-500">{h.confidence}%</span>
                    </div>
                    <p className="text-[10px] mono text-slate-400 truncate">{h.metadata.sourceGuess}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Analysis Result Section */}
        <div className="lg:col-span-7 space-y-8">
          {!result ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center glass rounded-2xl p-12 text-slate-600 border-dashed border-2 border-slate-800">
               <Activity className="w-16 h-16 mb-4 opacity-10" />
               <h2 className="text-xl font-semibold mb-2">Waiting for Input</h2>
               <p className="max-w-xs">Upload a photo or video to begin forensic analysis and provenance tracing.</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Score Card */}
                <div className={`p-8 rounded-3xl border-2 shadow-2xl ${
                  result.isDeepfake ? 'bg-rose-950/20 border-rose-500/50' : 'bg-emerald-950/20 border-emerald-500/50'
                }`}>
                  <h2 className="text-sm font-bold uppercase tracking-widest mb-6 text-slate-400">Deepfake Probability</h2>
                  <div className="flex items-end gap-2">
                    <span className="text-7xl font-black leading-none">{result.confidence}%</span>
                    <span className={`text-sm font-bold uppercase pb-2 ${result.isDeepfake ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {result.isDeepfake ? 'Malicious AI' : 'Organic Origin'}
                    </span>
                  </div>
                  <div className="mt-6 h-3 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${result.isDeepfake ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Metadata Card */}
                <div className="glass p-8 rounded-3xl border-slate-800">
                  <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">File Metadata</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-slate-500">Source Hash</span>
                      <span className="mono text-xs text-blue-400 truncate w-32 text-right">0x9a7b...4f2e</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-slate-500">Format</span>
                      <span className="text-slate-200">{result.metadata.format}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-slate-500">Resolution</span>
                      <span className="text-slate-200">{result.metadata.resolution}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Capture Device</span>
                      <span className="text-slate-200">{result.metadata.sourceGuess}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Log */}
              <div className="glass p-8 rounded-3xl mb-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="text-blue-400 w-5 h-5" />
                  Forensic Diagnostics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Detection Insights</h4>
                    <ul className="space-y-3">
                      {result.analysisLog.map((log, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300">
                          <span className="text-blue-500 font-bold">»</span>
                          {log}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Detected Artifacts</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.artifacts.map((art, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300">
                          {art}
                        </span>
                      ))}
                      {result.artifacts.length === 0 && (
                        <span className="text-sm text-slate-500 italic">No forensic artifacts detected.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Provenance Chain Component */}
              <ProvenanceChain steps={result.provenance} />

              <div className="mt-12 flex justify-center">
                 <button onClick={reset} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-lg border border-slate-800 hover:bg-slate-800">
                    <RefreshCcw className="w-4 h-4" />
                    Clear and Perform New Analysis
                 </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-20">
        <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-purple-600 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default App;

import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Camera, FileVideo, FileImage, ShieldCheck, Activity, Database, History, RefreshCcw, AlertTriangle } from 'lucide-react';
import { analyzeMedia } from './services/geminiService';
import { AnalysisResult, MediaUpload } from './types';
import { ProvenanceChain } from './components/ProvenanceChain';

const App: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaUpload | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from "database" (localStorage)
  useEffect(() => {
    const savedHistory = localStorage.getItem('verisight_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Save to "database"
  const saveToHistory = (newResult: AnalysisResult) => {
    const updated = [newResult, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('verisight_history', JSON.stringify(updated));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const previewUrl = URL.createObjectURL(file);
      setSelectedMedia({ file, previewUrl, type });
      setResult(null);
      setError(null);
    }
  };

  const runAnalysis = async () => {
    if (!selectedMedia) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const analysis = await analyzeMedia(base64Data, selectedMedia.file.type);
          setResult(analysis);
          saveToHistory(analysis);
        } catch (err) {
          setError("Analysis failed. Please check your API key or file format.");
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(selectedMedia.file);
    } catch (err) {
      setIsAnalyzing(false);
      setError("An unexpected error occurred.");
    }
  };

  const reset = () => {
    setSelectedMedia(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">VERISIGHT <span className="text-blue-500">AI</span></h1>
              <p className="text-[10px] mono text-slate-500 uppercase tracking-widest">Digital Forensics Protocol</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <button className="hover:text-white transition-colors">Lab</button>
            <button className="hover:text-white transition-colors">Explorer</button>
            <button className="hover:text-white transition-colors">Docs</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass p-8 rounded-2xl border-dashed border-2 border-slate-700 hover:border-blue-500/50 transition-all">
            {!selectedMedia ? (
              <label className="flex flex-col items-center justify-center cursor-pointer py-12">
                <Upload className="w-12 h-12 text-slate-500 mb-4" />
                <span className="text-lg font-medium mb-1">Inject Media for Analysis</span>
                <span className="text-sm text-slate-500 text-center mb-6">Upload .jpg, .png, or .mp4 files</span>
                <div className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-sm font-semibold transition-all">
                  Browse Files
                </div>
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden group">
                {selectedMedia.type === 'image' ? (
                  <img src={selectedMedia.previewUrl} className="w-full aspect-square object-cover" alt="Preview" />
                ) : (
                  <video src={selectedMedia.previewUrl} className="w-full aspect-square object-cover" controls />
                )}
                
                {isAnalyzing && (
                   <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px]">
                      <div className="scanner-line"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="glass p-4 rounded-full animate-pulse">
                          <Activity className="w-8 h-8 text-blue-400" />
                        </div>
                      </div>
                   </div>
                )}

                {!isAnalyzing && !result && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={reset} className="p-2 bg-slate-900/80 rounded-lg hover:bg-rose-900/80 transition-all">
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {!result && selectedMedia && !isAnalyzing && (
            <button 
              onClick={runAnalysis}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 transition-all"
            >
              <Activity className="w-5 h-5" />
              RUN DEEPFAKE PROTOCOL
            </button>
          )}

          {isAnalyzing && (
            <div className="glass p-6 rounded-xl border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm font-semibold">AI ANALYSIS IN PROGRESS...</span>
              </div>
              <div className="space-y-2 text-xs text-slate-500 mono">
                <p>+ Loading multimodal model...</p>
                <p>+ Scanning pixel densities...</p>
                <p>+ Verifying metadata signatures...</p>
                <p>+ Cross-referencing latent artifacts...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-rose-500 shrink-0 w-5 h-5" />
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}

          {/* Database History Preview */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-slate-400 text-sm font-semibold uppercase tracking-widest">
              <Database className="w-4 h-4" />
              Recent Scans
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {history.length === 0 ? (
                <div className="col-span-2 text-center p-8 glass rounded-xl border-dashed border-slate-800 text-slate-600 text-sm">
                  No scan history in database
                </div>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="glass p-3 rounded-xl border-slate-800/50 hover:border-slate-700 transition-all cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${h.isDeepfake ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {h.isDeepfake ? 'FAKE' : 'REAL'}
                      </span>
                      <span className="text-[10px] text-slate-500">{h.confidence}%</span>
                    </div>
                    <p className="text-[10px] mono text-slate-400 truncate">{h.metadata.sourceGuess}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Analysis Result Section */}
        <div className="lg:col-span-7 space-y-8">
          {!result ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center glass rounded-2xl p-12 text-slate-600 border-dashed border-2 border-slate-800">
               <Activity className="w-16 h-16 mb-4 opacity-10" />
               <h2 className="text-xl font-semibold mb-2">Waiting for Input</h2>
               <p className="max-w-xs">Upload a photo or video to begin forensic analysis and provenance tracing.</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Score Card */}
                <div className={`p-8 rounded-3xl border-2 shadow-2xl ${
                  result.isDeepfake ? 'bg-rose-950/20 border-rose-500/50' : 'bg-emerald-950/20 border-emerald-500/50'
                }`}>
                  <h2 className="text-sm font-bold uppercase tracking-widest mb-6 text-slate-400">Deepfake Probability</h2>
                  <div className="flex items-end gap-2">
                    <span className="text-7xl font-black leading-none">{result.confidence}%</span>
                    <span className={`text-sm font-bold uppercase pb-2 ${result.isDeepfake ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {result.isDeepfake ? 'Malicious AI' : 'Organic Origin'}
                    </span>
                  </div>
                  <div className="mt-6 h-3 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${result.isDeepfake ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Metadata Card */}
                <div className="glass p-8 rounded-3xl border-slate-800">
                  <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">File Metadata</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-slate-500">Source Hash</span>
                      <span className="mono text-xs text-blue-400 truncate w-32 text-right">0x9a7b...4f2e</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-slate-500">Format</span>
                      <span className="text-slate-200">{result.metadata.format}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-slate-500">Resolution</span>
                      <span className="text-slate-200">{result.metadata.resolution}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Capture Device</span>
                      <span className="text-slate-200">{result.metadata.sourceGuess}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Log */}
              <div className="glass p-8 rounded-3xl mb-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="text-blue-400 w-5 h-5" />
                  Forensic Diagnostics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Detection Insights</h4>
                    <ul className="space-y-3">
                      {result.analysisLog.map((log, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300">
                          <span className="text-blue-500 font-bold">»</span>
                          {log}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Detected Artifacts</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.artifacts.map((art, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300">
                          {art}
                        </span>
                      ))}
                      {result.artifacts.length === 0 && (
                        <span className="text-sm text-slate-500 italic">No forensic artifacts detected.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Provenance Chain Component */}
              <ProvenanceChain steps={result.provenance} />

              <div className="mt-12 flex justify-center">
                 <button onClick={reset} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-lg border border-slate-800 hover:bg-slate-800">
                    <RefreshCcw className="w-4 h-4" />
                    Clear and Perform New Analysis
                 </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-20">
        <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-purple-600 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default App;
