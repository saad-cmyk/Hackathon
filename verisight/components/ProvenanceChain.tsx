
import React from 'react';
import { ProvenanceStep } from '../types';
import { Shield, ShieldAlert, CheckCircle, Clock, MapPin, Fingerprint } from 'lucide-react';

// Lucide icon wrappers for dynamic display
const IconMap = {
  verified: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  modified: <ShieldAlert className="w-5 h-5 text-amber-400" />,
  unverified: <Shield className="w-5 h-5 text-rose-400" />
};

export const ProvenanceChain: React.FC<{ steps: ProvenanceStep[] }> = ({ steps }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Shield className="text-blue-400" />
        Digital Provenance Chain (C2PA)
      </h3>
      <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative group">
            <div className={`absolute -left-[31px] top-1 p-1 rounded-full bg-slate-900 border-2 ${
              step.status === 'verified' ? 'border-emerald-500' : 
              step.status === 'modified' ? 'border-amber-500' : 'border-rose-500'
            }`}>
              {IconMap[step.status]}
            </div>
            <div className="glass p-4 rounded-xl transition-all group-hover:bg-slate-800/80 group-hover:border-slate-600">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-slate-100">{step.action}</h4>
                  <p className="text-sm text-slate-400">{step.entity}</p>
                </div>
                <div className="text-right">
                   <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                    <Clock className="w-3 h-3" />
                    {new Date(step.timestamp).toLocaleString()}
                  </div>
                  {step.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 justify-end">
                      <MapPin className="w-3 h-3" />
                      {step.location}
                    </div>
                  )}
                </div>
 
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 overflow-hidden">
                <Fingerprint className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="mono text-[10px] text-slate-500 truncate">{step.hash}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
