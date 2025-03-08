import { z } from "zod";

export const claimSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required"),
  subscriberId: z.string().min(1, "Subscriber ID is required"),
  memberSequence: z.coerce.number({ invalid_type_error: "Member Sequence must be a number" }),
  claimStatus: z.enum(["Payable", "Denied", "Partial Deny"], {
    errorMap: () => ({ message: "Claim Status must be Payable, Denied, or Partial Deny" }),
  }),
  billed: z.coerce.number({ invalid_type_error: "Billed amount must be a number" })
    .nonnegative("Billed amount must be a positive number"),
  allowed: z.coerce.number({ invalid_type_error: "Allowed amount must be a number" })
    .nonnegative("Allowed amount must be a positive number"),
  paid: z.coerce.number({ invalid_type_error: "Paid amount must be a number" })
    .nonnegative("Paid amount must be a positive number"),
  paymentStatusDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Invalid payment status date format" }
  ),
  serviceDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Invalid service date format" }
  ),
  receivedDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Invalid received date format" }
  ),
  entryDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Invalid entry date format" }
  ),
  processedDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Invalid processed date format" }
  ),
  paidDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Invalid paid date format" }
  ),
  paymentStatus: z.enum(["Paid"], {
    errorMap: () => ({ message: "Payment Status must be Paid" }),
  }),
  groupName: z.string().min(1, "Group Name is required"),
  groupId: z.string().min(1, "Group ID is required"),
  divisionName: z.enum(["North", "South", "East", "West"], {
    errorMap: () => ({ message: "Division Name must be North, South, East, or West" }),
  }),
  divisionId: z.enum(["N", "S", "E", "W"], {
    errorMap: () => ({ message: "Division ID must be N, S, E, or W" }),
  }),
  plan: z.string().min(1, "Plan is required"),
  planId: z.string().min(1, "Plan ID is required"),
  placeOfService: z.enum(["Outpatient Hospital", "Inpatient Hospital", "Emergency Room - Hospital"], {
    errorMap: () => ({ message: "Place of Service must be valid" }),
  }),
  claimType: z.enum(["Professional", "Institutional"], {
    errorMap: () => ({ message: "Claim Type must be Professional or Institutional" }),
  }),
  procedureCode: z.string().min(1, "Procedure Code is required"),
  memberGender: z.enum(["Male", "Female"], {
    errorMap: () => ({ message: "Member Gender must be Male or Female" }),
  }),
  providerId: z.string().min(1, "Provider ID is required"),
  providerName: z.string().min(1, "Provider Name is required"),
});

export type Claim = z.infer<typeof claimSchema>; 