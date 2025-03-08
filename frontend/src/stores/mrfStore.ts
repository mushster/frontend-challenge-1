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

  constructor() {
    makeAutoObservable(this);
  }

  fetchMrfFiles = async () => {
    this.isLoading = true;
    this.error = null;

    try {
      // In a real app, this would be an API call
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      runInAction(() => {
        this.mrfFiles = [
          {
            id: "1",
            fileName: "out-of-network-rates_clearest-health_2023-01-01.json",
            plan: "Clearest Health Premium Plan",
            createdDate: "2023-01-01",
            fileSize: "2.3 MB",
            status: "generated"
          },
          {
            id: "2",
            fileName: "out-of-network-rates_clearest-health_2023-02-15.json",
            plan: "Clearest Health Basic Plan",
            createdDate: "2023-02-15",
            fileSize: "1.8 MB",
            status: "generated"
          },
          {
            id: "3",
            fileName: "out-of-network-rates_clearest-health_2023-03-10.json",
            plan: "Clearest Health Premium Plan",
            createdDate: "2023-03-10",
            fileSize: "3.1 MB",
            status: "generated"
          }
        ];
      });
    } catch (error) {
      runInAction(() => {
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

    try {
      // In a real app, this would send the data to a backend API
      // For now, simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a unique ID for the new file
      const newId = (this.mrfFiles.length + 1).toString();
      const today = new Date().toISOString().split('T')[0];
      
      runInAction(() => {
        // Add the new file to the list
        this.mrfFiles.unshift({
          id: newId,
          fileName: `out-of-network-rates_clearest-health_${today}.json`,
          plan: "Clearest Health Premium Plan",
          createdDate: today,
          fileSize: "2.9 MB",
          status: "generated"
        });
      });
      
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to generate MRF file";
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