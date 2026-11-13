import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const clientSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(160),
  companyName: optionalText(160),
  email: z.union([z.email().max(254), z.literal("")]).optional(),
  phone: optionalText(40),
  contactPerson: optionalText(120),
  billingDetails: optionalText(1000),
  address: optionalText(1000),
  internalNotes: optionalText(2000),
});

export const projectSchema = z.object({
  id: z.uuid().optional(),
  clientId: z.uuid(),
  reference: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/),
  title: z.string().trim().min(2).max(180),
  propertyAddress: z.string().trim().min(4).max(500),
  propertyType: optionalText(100),
  category: optionalText(100),
  serviceType: optionalText(120),
  description: optionalText(4000),
  priority: z.coerce.number().int().min(1).max(5),
  status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]),
  startDate: z.union([z.iso.date(), z.literal("")]).optional(),
  targetCompletionDate: z.union([z.iso.date(), z.literal("")]).optional(),
  internalNotes: optionalText(2000),
});
