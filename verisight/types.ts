
export interface ProvenanceStep {
  id: string;
  timestamp: string;
  action: string;
  export interface ProvenanceStep {
    id: string;
    timestamp: string;
    action: string;
    entity: string;
    hash: string;
    location?: string;
    status: 'verified' | 'modified' | 'unverified';
  }

  export interface AnalysisResult {
    isDeepfake: boolean;
    confidence: number; // 0-100
    analysisLog: string[];
    artifacts: string[];
    metadata: {
      format: string;
      resolution: string;
      sourceGuess: string;
    };
    provenance: ProvenanceStep[];
  }

  export interface MediaUpload {
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
  }
