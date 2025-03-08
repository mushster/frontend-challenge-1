import { z } from "zod";

// Tax Identifier Object
const taxIdentifierSchema = z.object({
  type: z.enum(["ein", "npi"]),
  value: z.string(),
});

// Provider Object
const providerSchema = z.object({
  billed_charge: z.number(),
  npi: z.array(z.string()),
});

// Out-Of-Network Payment Object
const outOfNetworkPaymentSchema = z.object({
  allowed_amount: z.number(),
  billing_code_modifier: z.array(z.string()).optional(),
  providers: z.array(providerSchema),
});

// Allowed Amounts Object
const allowedAmountsSchema = z.object({
  tin: taxIdentifierSchema,
  service_code: z.array(z.string()).optional(),
  billing_class: z.enum(["professional", "institutional"]),
  payments: z.array(outOfNetworkPaymentSchema),
});

// Out-Of-Network Object
const outOfNetworkSchema = z.object({
  name: z.string(),
  billing_code_type: z.string(),
  billing_code: z.string(),
  billing_code_type_version: z.string(),
  description: z.string(),
  allowed_amounts: z.array(allowedAmountsSchema),
});

// Root MRF Schema
export const mrfSchema = z.object({
  reporting_entity_name: z.string(),
  reporting_entity_type: z.string(),
  plan_name: z.string().optional(),
  plan_id_type: z.enum(["EIN", "HIOS"]).optional(),
  plan_id: z.string().optional(),
  plan_market_type: z.enum(["group", "individual"]).optional(),
  out_of_network: z.array(outOfNetworkSchema),
  last_updated_on: z.string(), // ISO 8601 format (YYYY-MM-DD)
  version: z.string(),
});

export type MrfFile = z.infer<typeof mrfSchema>; 