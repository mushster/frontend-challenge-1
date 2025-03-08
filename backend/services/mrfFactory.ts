interface Claim {
  tin: string;
  providerName: string;
  npi: string;
  procedureCode: string;
  billingCodeType: string;
  negotiatedRate: number;
  effectiveDate: string;
  expirationDate: string;
  serviceCode: string;
  description: string;
}

interface AggregatedRate {
  negotiated_rate: number;
  providers: {
    tin: { type: string; value: string };
    provider_group_name?: string;
  }[];
  service_code: string[];
  billing_code_type: string;
  billing_code: string;
  description: string;
  negotiated_type: string;
  expiration_date: string;
}

interface MrfOutput {
  reporting_entity_name: string;
  reporting_entity_type: string;
  last_updated_on: string;
  version: string;
  out_of_network_allowed_amounts: {
    reporting_plan_name: string;
    reporting_plan_id_type: string;
    reporting_plan_id: string;
    allowed_amount_data: AggregatedRate[];
  }[]
}

export class MrfFactory {
  createMrfFromClaims(claims: Claim[]): MrfOutput {
    // Group claims by a composite key for aggregation
    const groupedClaims = this.groupClaimsByKey(claims);
    
    // Convert grouped claims to allowed amount data format
    const allowedAmountData = this.convertToAllowedAmountData(groupedClaims);
    
    // Create the full MRF output structure
    return {
      reporting_entity_name: "Healthcare Claims Processor",
      reporting_entity_type: "third_party_administrator",
      last_updated_on: new Date().toISOString().slice(0, 10),
      version: "1.0.0",
      out_of_network_allowed_amounts: [
        {
          reporting_plan_name: "Comprehensive Healthcare Plan",
          reporting_plan_id_type: "group",
          reporting_plan_id: "CHP-2023",
          allowed_amount_data: allowedAmountData
        }
      ]
    };
  }
  
  private groupClaimsByKey(claims: Claim[]): Map<string, Claim[]> {
    const grouped = new Map<string, Claim[]>();
    
    for (const claim of claims) {
      // Create a composite key for grouping similar claims
      const key = `${claim.procedureCode}|${claim.billingCodeType}|${claim.serviceCode}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      
      grouped.get(key)!.push(claim);
    }
    
    return grouped;
  }
  
  private convertToAllowedAmountData(groupedClaims: Map<string, Claim[]>): AggregatedRate[] {
    const result: AggregatedRate[] = [];
    
    groupedClaims.forEach((claims, key) => {
      // Calculate average negotiated rate
      const totalRate = claims.reduce((sum, claim) => sum + claim.negotiatedRate, 0);
      const averageRate = totalRate / claims.length;
      
      // Extract unique providers while preserving their TIN and name
      const uniqueProviders = new Map<string, { tin: string; name: string }>();
      claims.forEach(claim => {
        uniqueProviders.set(claim.npi, { tin: claim.tin, name: claim.providerName });
      });
      
      // Get a representative claim for common data
      const sample = claims[0];
      
      // Convert to the required format
      const aggregatedRate: AggregatedRate = {
        negotiated_rate: parseFloat(averageRate.toFixed(2)),
        providers: Array.from(uniqueProviders.values()).map(provider => ({
          tin: { type: "ein", value: provider.tin },
          provider_group_name: provider.name
        })),
        service_code: [sample.serviceCode],
        billing_code_type: sample.billingCodeType,
        billing_code: sample.procedureCode,
        description: sample.description,
        negotiated_type: "allowed_amount",
        expiration_date: sample.expirationDate
      };
      
      result.push(aggregatedRate);
    });
    
    return result;
  }
} 