import { makeAutoObservable, runInAction } from "mobx";
import { z } from "zod";
import Papa from "papaparse";
import { claimSchema } from "../schemas/claimSchema";

export type Claim = z.infer<typeof claimSchema>;

export class ClaimsStore {
  claims: Claim[] = [];
  errors: Record<number, string[]> = {};
  isUploading: boolean = false;
  parseError: string | null = null;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  uploadCSV = async (file: File) => {
    this.isUploading = true;
    this.parseError = null;
    this.errors = {};
    
    try {
      const result = await new Promise<Papa.ParseResult<unknown>>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject,
        });
      });
      
      runInAction(() => {
        const validatedClaims: Claim[] = [];
        const errors: Record<number, string[]> = {};
        
        result.data.forEach((row, index) => {
          try {
            const validClaim = claimSchema.parse(row);
            validatedClaims.push(validClaim);
          } catch (error) {
            if (error instanceof z.ZodError) {
              errors[index] = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
            }
          }
        });
        
        this.claims = validatedClaims;
        this.errors = errors;
      });
    } catch (error) {
      runInAction(() => {
        this.parseError = error instanceof Error ? error.message : "Failed to parse CSV file";
      });
    } finally {
      runInAction(() => {
        this.isUploading = false;
      });
    }
  };
  
  updateClaim = (index: number, updatedClaim: Partial<Claim>) => {
    const claim = { ...this.claims[index], ...updatedClaim };
    
    try {
      // Validate the updated claim
      claimSchema.parse(claim);
      
      // If validation passes, update the claim
      this.claims[index] = claim as Claim;
      
      // Clear any errors for this index
      if (this.errors[index]) {
        const newErrors = { ...this.errors };
        delete newErrors[index];
        this.errors = newErrors;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.errors[index] = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      }
    }
  };
  
  deleteClaim = (index: number) => {
    this.claims = this.claims.filter((_, i) => i !== index);
    
    // Update error indices after deletion
    const newErrors: Record<number, string[]> = {};
    Object.entries(this.errors).forEach(([key, value]) => {
      const numKey = Number(key);
      if (numKey > index) {
        newErrors[numKey - 1] = value;
      } else if (numKey < index) {
        newErrors[numKey] = value;
      }
    });
    
    this.errors = newErrors;
  };
  
  clearAll = () => {
    this.claims = [];
    this.errors = {};
    this.parseError = null;
  };
  
  approveAndExport = () => {
    // This would eventually connect to a backend API
    console.log("Approved claims ready for MRF generation:", this.claims);
    alert("Claims approved and ready for MRF generation!");
    // In a real implementation, this would make an API call to the backend
  };
}

// Create a single instance of the store
const claimsStore = new ClaimsStore();
export default claimsStore; 