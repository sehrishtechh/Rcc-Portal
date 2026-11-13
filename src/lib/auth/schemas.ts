import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().trim().max(254),
  password: z.string().min(1).max(128),
});

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.email().trim().max(254),
  password: z.string()
    .min(12)
    .max(128)
    .regex(/[a-z]/, "Include a lowercase letter.")
    .regex(/[A-Z]/, "Include an uppercase letter.")
    .regex(/[0-9]/, "Include a number.")
    .regex(/[^a-zA-Z0-9]/, "Include a symbol."),
  phone: z.string().trim().max(40).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  professionalDetails: z.string().trim().max(500).optional(),
});

export const employeeApprovalSchema = z.object({
  userId: z.uuid(),
  decision: z.enum(["approved", "rejected"]),
  role: z.enum(["senior_engineer", "inspector", "report_writer", "designer", "drafter"]).optional(),
});
