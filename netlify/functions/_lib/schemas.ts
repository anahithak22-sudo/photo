import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type Anthropic from "@anthropic-ai/sdk";

// Bounds tightened (was works/improve max 5, characteristics max 7, etc.) —
// live testing showed real photos generating full-length content pushed
// analyze/reconstruct into the same ~30s proxy inactivity-timeout that hit
// concepts; less content generated means less time, same fix that worked there.
export const SectionSchema = z.object({
  works: z.array(z.string()).min(1).max(3),
  improve: z.array(z.string()).min(0).max(3),
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
    characteristics: z.array(z.string()).min(3).max(4),
  }),
  overall: z.object({
    strengths: z.array(z.string()).min(2).max(3),
    problems: z.array(z.string()).min(2).max(3),
    priority: z
      .array(
        z.object({
          action: z.string(),
          why: z.string(),
        })
      )
      .min(2)
      .max(3),
  }),
});

export const SeriesStyleSchema = z.object({
  label: z.string(),
  summary: z.string(),
  characteristics: z.array(z.string()).min(3).max(5),
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
    .min(1)
    .max(4),
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
    // PRD requires at least 8 steps and the prompt asks for them explicitly —
    // these bounds must stay in sync with that instruction or every response
    // fails validation.
    .min(8)
    .max(9),
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
  props: z.array(PropSchema).min(1).max(3),
  composition: z.string(),
  colorPalette: z
    .array(
      z.object({
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        name: z.string(),
      })
    )
    .min(3)
    .max(4),
  moodDescription: z.string(),
  searchPrompts: z.array(z.string()).min(3).max(4),
  referenceNotes: z.array(z.string()).min(3).max(5),
});

// Fixed at exactly 3 (rather than the original 3-4) to keep generation time
// well under the ~30s inactivity-timeout wall of the proxy in front of
// Netlify — measured live: a full non-streaming request consistently landed
// at ~31s regardless of max_tokens, so the fix is generating less content,
// not raising a ceiling that was never actually the limiting factor.
export const ConceptsSchema = z.object({
  concepts: z.array(ConceptSchema).length(2),
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
