import { makeAutoObservable, runInAction } from "mobx";
import { z } from "zod";
import Papa from "papaparse";
import { claimSchema } from "../schemas/claimSchema";

export type Claim = z.infer<typeof claimSchema>;

export class ClaimsStore {
  claims: Claim[] = [];
  savedClaims: Claim[] = [];
  errors: Record<number, string[]> = {};
  isUploading: boolean = false;
  parseError: string | null = null;
  showSuccessAlert: boolean = false;
  claimsUsedForMrf: boolean = false;
  
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
        
        result.data.forEach((row: any, index) => {
          try {
            // Map CSV column names to our schema field names
            const mappedRow = {
              claimId: row["Claim ID"],
              subscriberId: row["Subscriber ID"],
              memberSequence: row["Member Sequence"],
              claimStatus: row["Claim Status"],
              billed: row["Billed"],
              allowed: row["Allowed"],
              paid: row["Paid"],
              paymentStatusDate: row["Payment Status Date"],
              serviceDate: row["Service Date"],
              receivedDate: row["Received Date"],
              entryDate: row["Entry Date"],
              processedDate: row["Processed Date"],
              paidDate: row["Paid Date"],
              paymentStatus: row["Payment Status"],
              groupName: row["Group Name"],
              groupId: row["Group ID"],
              divisionName: row["Division Name"],
              divisionId: row["Division ID"],
              plan: row["Plan"],
              planId: row["Plan ID"],
              placeOfService: row["Place of Service"],
              claimType: row["Claim Type"],
              procedureCode: row["Procedure Code"],
              memberGender: row["Member Gender"],
              providerId: row["Provider ID"],
              providerName: row["Provider Name"],
            };
            
            const validClaim = claimSchema.parse(mappedRow);
            validatedClaims.push(validClaim);
          } catch (error) {
            if (error instanceof z.ZodError) {
              errors[index] = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
            } else {
              // Handle unexpected errors
              console.error("Unexpected error during validation:", error);
              errors[index] = ["Unexpected error occurred during validation"];
            }
          }
        });
        
        this.claims = validatedClaims;
        this.savedClaims = [...validatedClaims];
        this.errors = errors;
        this.claimsUsedForMrf = false;
        
        console.log("Validated claims:", validatedClaims.length);
        console.log("Errors:", Object.keys(errors).length);
      });
    } catch (error) {
      runInAction(() => {
        this.parseError = error instanceof Error ? error.message : "Failed to parse CSV file";
        console.error("Parse error:", this.parseError);
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
      this.savedClaims[index] = claim as Claim;
      
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
    this.savedClaims = this.savedClaims.filter((_, i) => i !== index);
    
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
    this.savedClaims = [];
    this.errors = {};
    this.parseError = null;
  };
  
  approveAndExport = async () => {
    console.log("Approved claims ready for processing:", this.claims);
    
    // Save the current claims to savedClaims
    this.savedClaims = [...this.claims];
    this.claimsUsedForMrf = false;
    
    this.showSuccessAlert = true;
    
  };
  
  dismissSuccessAlert = () => {
    this.showSuccessAlert = false;
    this.claims = [];
    this.errors = {};
    this.parseError = null;
  };
  
  markClaimsAsUsedForMrf = () => {
    this.claimsUsedForMrf = true;
  };
}

const claimsStore = new ClaimsStore();
export default claimsStore; 