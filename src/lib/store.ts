import { atom } from 'nanostores';

export type GenerationType = 'cv' | 'cover-letter' | null;

export const generationState = atom<{
  isGenerating: boolean;
  type: GenerationType;
  result: any | null;
  error: string | null;
}>({
  isGenerating: false,
  type: null,
  result: null,
  error: null,
});

export const setGenerating = (isGenerating: boolean, type: GenerationType = null) => {
  generationState.set({ ...generationState.get(), isGenerating, type, error: null });
};

export const setGenerationResult = (result: any) => {
  generationState.set({ ...generationState.get(), isGenerating: false, result, error: null });
};

export const setGenerationType = (type: GenerationType) => {
  generationState.set({ ...generationState.get(), type });
};

export const setGenerationError = (error: string) => {
  generationState.set({ ...generationState.get(), isGenerating: false, error });
};

export const updateGenerationResultField = (path: (string | number)[], value: any) => {
  const currentState = generationState.get();
  if (!currentState.result) return;

  const newResult = JSON.parse(JSON.stringify(currentState.result)); // Deep clone
  let current = newResult;
  
  for (let i = 0; i < path.length - 1; i++) {
    if (current[path[i]] === undefined) {
      current[path[i]] = typeof path[i+1] === 'number' ? [] : {};
    }
    current = current[path[i]];
  }
  
  current[path[path.length - 1]] = value;
  setGenerationResult(newResult);
};

export const atsHistoryState = atom<{
  loadedResult: any | null;
  cvText: string | null;
  jobDescription: string | null;
}>({
  loadedResult: null,
  cvText: null,
  jobDescription: null,
});

export const setAtsHistory = (result: any, cvText: string, jobDescription: string) => {
  atsHistoryState.set({ loadedResult: result, cvText, jobDescription });
};
