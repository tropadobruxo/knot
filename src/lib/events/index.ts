import { z } from "zod";

export const createEventSchema = z.object({
  type: z.enum(["munch", "workshop", "festa"]),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  city: z.string().min(1).max(100),
  venue: z.string().max(200).optional(),
  datetime: z.string().datetime(),
  priceCents: z.number().int().min(0).default(0),
  capacity: z.number().int().min(1).optional(),
  safetyInfo: z.string().max(2000).optional(),
  codeOfConductRequired: z.boolean().default(true),
}).refine(
  (data) => {
    // Munch must have safetyInfo (local público)
    if (data.type === "munch" && !data.safetyInfo?.trim()) {
      return false;
    }
    return true;
  },
  { message: "Munches exigem informações de segurança (local público).", path: ["safetyInfo"] },
);

export const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  city: z.string().min(1).max(100).optional(),
  venue: z.string().max(200).optional(),
  datetime: z.string().datetime().optional(),
  priceCents: z.number().int().min(0).optional(),
  capacity: z.number().int().min(1).optional(),
  safetyInfo: z.string().max(2000).optional(),
});
