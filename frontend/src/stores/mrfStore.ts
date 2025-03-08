import { makeAutoObservable, runInAction } from "mobx";
import claimsStore, { Claim } from "./claimsStore";

export interface MrfFile {
  id: string;
  fileName: string;
  plan: string;
  createdDate: string;
  fileSize: string;
  status: "generated" | "processing";
}

export class MrfStore {
  mrfFiles: MrfFile[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  generatedMrfData: any = null; // To store the actual MRF data for download

  constructor() {
    makeAutoObservable(this);
  }

  fetchMrfFiles = async () => {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await fetch('http://localhost:8080/api/mrf-files');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch MRF files: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      runInAction(() => {
        this.mrfFiles = data.mrfFiles || [];
      });
    } catch (error) {
      runInAction(() => {
        console.error("Error fetching MRF files:", error);
        this.error = error instanceof Error ? error.message : "Failed to fetch MRF files";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  generateMrfFile = async (claims: Claim[]) => {
    this.isLoading = true;
    this.error = null;
    this.generatedMrfData = null;

    try {
      if (claims.length === 0) {
        throw new Error("No claims data available to generate MRF file");
      }
    
      const response = await fetch('http://localhost:8080/api/generate-mrf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claims }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate MRF file');
      }

      const data = await response.json();
      
      runInAction(() => {
        if (data.success && data.mrfFile) {
          this.mrfFiles.unshift(data.mrfFile);
          
          claimsStore.markClaimsAsUsedForMrf();
        } else {
          throw new Error(data.error || 'Unknown error generating MRF file');
        }
      });
      
      return true;
    } catch (error) {
      runInAction(() => {
        console.error("Error generating MRF file:", error);
        this.error = error instanceof Error ? error.message : "Failed to generate MRF file";
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  downloadMrfFile = async (fileId: string) => {
    this.isLoading = true;
    this.error = null;

    try {
      // Fetch the MRF file data
      const response = await fetch(`http://localhost:8080/api/mrf-files/${fileId}/download`);
      
      if (!response.ok) {
        throw new Error(`Failed to download MRF file: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Create a downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      
      // Find the file name from our list
      const file = this.mrfFiles.find(f => f.id === fileId);
      a.download = file ? file.fileName : `mrf-file-${fileId}.json`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      runInAction(() => {
        console.error("Error downloading MRF file:", error);
        this.error = error instanceof Error ? error.message : "Failed to download MRF file";
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
}

const mrfStore = new MrfStore();
export default mrfStore; 