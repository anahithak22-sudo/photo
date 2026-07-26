import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type Anthropic from "@anthropic-ai/sdk";

export const SectionSchema = z.object({
  works: z.array(z.string()).min(1).max(5),
  improve: z.array(z.string()).min(0).max(5),
  recommendation: z.string(),
});

export const PhotoAnalysisSchema = z.object({
  composition: SectionSchema,
  color: SectionSchema,
  light: SectionSchema,
  quality: SectionSchema,
  retouching: SectionSchema,
  format: SectionSchema,
  visualStyle: z.object({
    label: z.string(),
    characteristics: z.array(z.string()).min(3).max(7),
  }),
  overall: z.object({
    strengths: z.array(z.string()).min(2).max(4),
    problems: z.array(z.string()).min(3).max(5),
    priority: z
      .array(
        z.object({
          action: z.string(),
          why: z.string(),
        })
      )
      .min(3)
      .max(5),
  }),
});

export const SeriesStyleSchema = z.object({
  label: z.string(),
  summary: z.string(),
  characteristics: z.array(z.string()).min(3).max(8),
  consistency: z.number().min(0).max(100),
});

function confidenceSchema<T extends z.ZodTypeAny>(primary: T) {
  return z.object({
    confidence: z.enum(["high", "medium", "low"]),
    primary,
    alternatives: z
      .array(
        z.object({
          option: z.string(),
          reasoning: z.string(),
        })
      )
      .max(3),
  });
}

export const ReconstructSchema = z.object({
  camera: confidenceSchema(z.string()),
  lens: confidenceSchema(
    z.object({
      type: z.enum(["wide", "standard", "portrait", "telephoto", "macro"]),
      range: z.string(),
    })
  ),
  settings: confidenceSchema(
    z.object({
      aperture: z.string(),
      shutter: z.string(),
      iso: z.string(),
    })
  ),
  perspective: confidenceSchema(z.string()),
  lighting: confidenceSchema(z.string()),
  location: confidenceSchema(z.string()),
  props: z
    .array(
      z.object({
        item: z.string(),
        function: z.string(),
      })
    )
    .min(1),
  styling: z.string(),
  composition: z.string(),
  postProcessing: z.string(),
  shootingPlan: z
    .array(
      z.object({
        step: z.number(),
        title: z.string(),
        description: z.string(),
      })
    )
    .min(8),
});

const PropSchema = z.object({
  item: z.string(),
  function: z.string(),
});

export const ConceptSchema = z.object({
  title: z.string(),
  mood: z.string(),
  location: z.string(),
  background: z.string(),
  lighting: z.string(),
  props: z.array(PropSchema).min(1),
  composition: z.string(),
  colorPalette: z
    .array(
      z.object({
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        name: z.string(),
      })
    )
    .min(3)
    .max(5),
  moodDescription: z.string(),
  searchPrompts: z.array(z.string()).min(3).max(5),
  referenceNotes: z.array(z.string()).min(3),
});

export const ConceptsSchema = z.object({
  concepts: z.array(ConceptSchema).min(3).max(4),
});

export const ShootingPlanSchema = z.object({
  location: z.string(),
  props: z.array(PropSchema).min(1),
  lighting: z.string(),
  camera: z.string(),
  lens: z.string(),
  composition: z.string(),
  styling: z.string(),
  shotList: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .min(5)
    .max(10),
  editingDirection: z.string(),
});

export function toTool(
  name: string,
  description: string,
  schema: z.ZodTypeAny
): Anthropic.Tool {
  const jsonSchema = zodToJsonSchema(schema, { target: "openApi3" }) as Record<string, unknown>;
  delete jsonSchema.$schema;
  return {
    name,
    description,
    input_schema: jsonSchema as unknown as Anthropic.Tool.InputSchema,
  };
}
