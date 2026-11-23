import { z } from "zod";

export const CATEGORIES = ["road", "trail", "walking"] as const;
export const USAGES = ["daily", "tempo", "race", "long", "recovery", "trail", "walking"] as const;
export const WIDTHS = ["narrow", "standard", "wide", "extra-wide"] as const;
export const CURRENCIES = ["EUR", "KRW"] as const;

const score = z.number().int().min(1).max(5);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "ISO 날짜 형식이어야 합니다");

export const OfferSchema = z.object({
  retailer: z.string().min(1),
  url: z.string().url(),
  price: z.number().positive(),
  currency: z.enum(CURRENCIES),
  region: z.enum(["DE", "KR", "EU", "US"]),
  inStock: z.boolean(),
  checkedAt: isoDate,
});

export const ShoeSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    brand: z.string().min(1),
    model: z.string().min(1),
    category: z.enum(CATEGORIES),
    usages: z.array(z.enum(USAGES)).min(1),
    releaseYear: z.number().int().min(2000).max(2100),
    price: z.object({ eur: z.number().positive(), krw: z.number().positive() }),
    specs: z.object({
      /** 남성 US 9 기준 */
      weightG: z.number().positive(),
      dropMm: z.number().min(0),
      stackHeelMm: z.number().positive(),
      stackForefootMm: z.number().positive(),
      cushioning: score,
      stability: score,
    }),
    widths: z.array(z.enum(WIDTHS)).min(1),
    rating: z.number().min(0).max(5),
    summary: z.string().min(1),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    recommendedFor: z.array(z.string()),
    offers: z.array(OfferSchema),
    image: z.string().optional(),
    isSample: z.boolean(),
    updatedAt: isoDate,
  })
  .refine((s) => s.specs.stackHeelMm - s.specs.stackForefootMm === s.specs.dropMm, {
    message: "dropMm 은 stackHeelMm - stackForefootMm 과 같아야 합니다",
    path: ["specs", "dropMm"],
  });

export const ShoeListSchema = z
  .array(ShoeSchema)
  .refine((list) => new Set(list.map((s) => s.id)).size === list.length, "id 중복")
  .refine((list) => new Set(list.map((s) => s.slug)).size === list.length, "slug 중복");

export type Category = (typeof CATEGORIES)[number];
export type Usage = (typeof USAGES)[number];
export type Width = (typeof WIDTHS)[number];
export type Currency = (typeof CURRENCIES)[number];
export type Offer = z.infer<typeof OfferSchema>;
export type Shoe = z.infer<typeof ShoeSchema>;
