import { z } from "zod";

// Define the schema for claim validation
export const claimSchema = z.object({
  tin: z.string().min(1, "TIN is required"),
  providerName: z.string().min(1, "Provider name is required"),
  npi: z.string().regex(/^\d{10}$/, "NPI must be a 10-digit number"),
  procedureCode: z.string().min(1, "Procedure code is required"),
  billingCodeType: z.enum(["CPT", "HCPCS", "DRG"], {
    errorMap: () => ({ message: "Billing code type must be CPT, HCPCS, or DRG" }),
  }),
  negotiatedRate: z.coerce
    .number({ invalid_type_error: "Negotiated rate must be a number" })
    .nonnegative("Negotiated rate must be a positive number"),
  effectiveDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Invalid date format" }
  ),
  expirationDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Invalid date format" }
  ),
  serviceCode: z.string().optional(),
  description: z.string().optional(),
}); 