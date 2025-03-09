import { render, screen, } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import ClaimsUpload from '../ClaimsUpload';
import claimsStore from '../../../stores/claimsStore';
import '@testing-library/jest-dom';
import { ReactNode } from 'react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the claimsStore
jest.mock('../../../stores/claimsStore', () => ({
  clearAll: jest.fn(),
  uploadCSV: jest.fn(),
  isUploading: false,
  parseError: null,
}));

// Helper function to render component with MantineProvider
const renderWithProvider = (ui: ReactNode) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  );
};

describe('ClaimsUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock properties
    (claimsStore as jest.Mocked<typeof claimsStore>).isUploading = false;
    (claimsStore as jest.Mocked<typeof claimsStore>).parseError = null;
  });

  // Test for basic rendering and button state
  it('disables the upload button when no file is selected', () => {
    renderWithProvider(<ClaimsUpload />);
    expect(screen.getByRole('button', { name: /Upload/i })).toBeDisabled();
  });

  // Test for loading state
  it('shows loading state when isUploading is true', () => {
    // Set isUploading to true
    (claimsStore as jest.Mocked<typeof claimsStore>).isUploading = true;
    
    renderWithProvider(<ClaimsUpload />);
    
    // Check if the upload button is disabled during loading
    expect(screen.getByRole('button', { name: /Upload/i })).toBeDisabled();
  });

  it('displays error when parseError exists', () => {
    // Mock the store with an error using proper type assertion
    (claimsStore as jest.Mocked<typeof claimsStore>).parseError = 'Error parsing CSV';
    
    renderWithProvider(<ClaimsUpload />);
    
    // Look for any element containing the error text in the alert
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Error parsing CSV');
  });
}); 