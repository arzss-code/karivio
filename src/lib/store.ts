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

export const setGenerationError = (error: string) => {
  generationState.set({ ...generationState.get(), isGenerating: false, error });
};
