import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

// Type definitions based on MRF schema
interface TaxIdentifier {
  type: "ein" | "npi";
  value: string;
}

interface Provider {
  billed_charge: number;
  npi: string[];
}

interface OutOfNetworkPayment {
  allowed_amount: number;
  billing_code_modifier?: string[];
  providers: Provider[];
}

interface AllowedAmount {
  tin: TaxIdentifier;
  service_code?: string[];
  billing_class: "professional" | "institutional";
  payments: OutOfNetworkPayment[];
}

interface OutOfNetwork {
  name: string;
  billing_code_type: string;
  billing_code: string;
  billing_code_type_version: string;
  description: string;
  allowed_amounts: AllowedAmount[];
}

interface MrfFile {
  reporting_entity_name: string;
  reporting_entity_type: string;
  plan_name?: string;
  plan_id_type?: "EIN" | "HIOS";
  plan_id?: string;
  plan_market_type?: "group" | "individual";
  out_of_network: OutOfNetwork[];
  last_updated_on: string;
  version: string;
}

interface Claim {
  claimId: string;
  subscriberId: string;
  memberSequence: number;
  claimStatus: string;
  billed: number;
  allowed: number;
  paid: number;
  serviceDate: string;
  paidDate: string;
  groupName: string;
  divisionName: string;
  plan: string;
  procedureCode: string;
  providerName: string;
  providerId: string;
  claimType: "Professional" | "Institutional";
  [key: string]: any; // For other claim properties
}

const app = new Hono();

// Enable CORS
app.use('/*', cors());

app.get("/", (c) => {
  return c.text("Clearest Health API");
});

// List available MRF files
app.get("/api/mrf-files", async (c) => {
  // This would normally fetch from a database
  const mrfFiles = [
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
  
  return c.json({ mrfFiles });
});

// Generate MRF file endpoint
app.post("/api/generate-mrf", async (c) => {
  try {
    const { claims } = await c.req.json();
    
    if (!Array.isArray(claims) || claims.length === 0) {
      return c.json({ success: false, error: "No valid claims data provided" }, 400);
    }
    
    // Process claims data into MRF format
    const mrfData = convertClaimsToMrf(claims);
    
    // In a real implementation, we would save the file to storage
    // For now, we'll simulate that step
    const today = new Date().toISOString().split('T')[0];
    const fileSize = JSON.stringify(mrfData).length / 1024;
    const formattedFileSize = fileSize > 1000 
      ? `${(fileSize / 1024).toFixed(1)} MB` 
      : `${Math.round(fileSize)} KB`;
    
    const newMrfFile = {
      id: crypto.randomUUID(),
      fileName: `out-of-network-rates_clearest-health_${today}.json`,
      plan: mrfData.plan_name || "Clearest Health Premium Plan",
      createdDate: today,
      fileSize: formattedFileSize,
      status: "generated"
    };
    
    return c.json({ 
      success: true, 
      mrfFile: newMrfFile
    });
  } catch (error) {
    console.error("Error generating MRF file:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate MRF file" 
    }, 500);
  }
});

// Download MRF file endpoint (would normally fetch from storage)
app.get("/api/mrf-files/:id/download", (c) => {
  const id = c.req.param('id');
  
  // In a real implementation, we would fetch the file from storage
  // For now, return a sample MRF file
  const sampleMrfFile = {
    "reporting_entity_name": "Clearest Health",
    "reporting_entity_type": "health insurance issuer",
    "plan_name": "Clearest Health Premium Plan",
    "plan_id_type": "EIN",
    "plan_id": "12-3456789",
    "plan_market_type": "group",
    "out_of_network": [
      // Sample data would go here
    ],
    "last_updated_on": new Date().toISOString().split('T')[0],
    "version": "1.0.0"
  };
  
  return c.json(sampleMrfFile);
});

// Function to convert claims to MRF format
function convertClaimsToMrf(claims: Claim[]): MrfFile {
  // Group claims by procedure code
  const claimsByProcedure = groupClaimsByProperty(claims, 'procedureCode');
  
  // Create out-of-network entries
  const outOfNetwork: OutOfNetwork[] = Object.entries(claimsByProcedure).map(([procedureCode, relatedClaims]) => {
    // Group by provider
    const claimsByProvider = groupClaimsByProperty(relatedClaims, 'providerId');
    
    // Create allowed amounts entries
    const allowedAmounts: AllowedAmount[] = Object.entries(claimsByProvider).map(([providerId, providerClaims]) => {
      // Get billing class from the first claim
      const billingClass = providerClaims[0].claimType.toLowerCase() as "professional" | "institutional";
      
      // Create payment objects
      const payments: OutOfNetworkPayment[] = [{
        allowed_amount: calculateAverageAllowedAmount(providerClaims),
        providers: [{
          billed_charge: calculateAverageBilledAmount(providerClaims),
          npi: [providerId] // In a real system, we'd get the actual NPI
        }]
      }];
      
      return {
        tin: {
          type: "npi",
          value: providerId
        },
        billing_class: billingClass,
        // Add service code for professional claims
        ...(billingClass === "professional" && { service_code: ["11"] }), // Default to office for example
        payments
      };
    });
    
    // Get a sample claim for this procedure code for details
    const sampleClaim = relatedClaims[0];
    
    return {
      name: `Medical service: ${procedureCode}`,
      billing_code_type: "CPT", // Assuming CPT codes for procedures
      billing_code: procedureCode,
      billing_code_type_version: new Date().getFullYear().toString(), // Current year as version
      description: `Medical procedure ${procedureCode} for ${sampleClaim.plan}`,
      allowed_amounts: allowedAmounts
    };
  });
  
  // Get plan info from the first claim
  const firstClaim = claims[0];
  
  // Create the MRF file
  return {
    reporting_entity_name: "Clearest Health",
    reporting_entity_type: "health insurance issuer",
    plan_name: firstClaim.plan,
    plan_id_type: "EIN",
    plan_id: "12-3456789", // Example EIN
    plan_market_type: "group",
    out_of_network: outOfNetwork,
    last_updated_on: new Date().toISOString().split('T')[0],
    version: "1.0.0"
  };
}

// Helper function to group claims by a specific property
function groupClaimsByProperty(claims: Claim[], property: keyof Claim): Record<string, Claim[]> {
  return claims.reduce((grouped, claim) => {
    const key = String(claim[property]);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(claim);
    return grouped;
  }, {} as Record<string, Claim[]>);
}

// Helper function to calculate average allowed amount
function calculateAverageAllowedAmount(claims: Claim[]): number {
  const total = claims.reduce((sum, claim) => sum + claim.allowed, 0);
  return Number((total / claims.length).toFixed(2));
}

// Helper function to calculate average billed amount
function calculateAverageBilledAmount(claims: Claim[]): number {
  const total = claims.reduce((sum, claim) => sum + claim.billed, 0);
  return Number((total / claims.length).toFixed(2));
}

serve({ fetch: app.fetch, port: 8080 });
console.log("Server is running on http://localhost:8080");
