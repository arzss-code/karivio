import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InputForm from '../InputForm';

// Mock lucide-react icons so they don't cause rendering issues
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="icon-alert" />,
  ChevronLeft: () => <div data-testid="icon-chevron-left" />,
  ChevronRight: () => <div data-testid="icon-chevron-right" />,
  Loader2: () => <div data-testid="icon-loader" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  FileText: () => <div data-testid="icon-file-text" />,
  Plus: () => <div data-testid="icon-plus" />,
  Trash2: () => <div data-testid="icon-trash" />
}));

// Mock nanostores to avoid ESM parsing issues in Jest
jest.mock('@nanostores/react', () => ({
  useStore: () => ({ isGenerating: false, error: null, result: null, type: null })
}));

jest.mock('../../lib/store', () => ({
  generationState: { get: () => ({}), set: jest.fn(), listen: jest.fn() },
  setGenerating: jest.fn(),
  setGenerationResult: jest.fn(),
  setGenerationError: jest.fn(),
}));

describe('InputForm Component', () => {
  it('should render the first step (Personal Information) by default', () => {
    render(<InputForm />);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/jane@example.com/i)).toBeInTheDocument();
  });

  it('should show validation error when trying to proceed without required fields', async () => {
    render(<InputForm />);
    
    const nextBtn = screen.getByText(/Next Step/i);
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText('Full Name is required')).toBeInTheDocument();
      expect(screen.getByText('Valid email is required')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Personal Information')).toBeVisible();
  });
});
