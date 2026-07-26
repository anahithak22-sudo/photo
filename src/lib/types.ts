export type ProjectType = "analyze" | "reconstruct" | "idea" | "plan";

export interface Confidence<T> {
  confidence: "high" | "medium" | "low";
  primary: T;
  alternatives: { option: string; reasoning: string }[];
}

export interface Section {
  works: string[];
  improve: string[];
  recommendation: string;
}

export interface PhotoAnalysis {
  composition: Section;
  color: Section;
  light: Section;
  quality: Section;
  retouching: Section;
  format: Section;
  visualStyle: {
    label: string;
    characteristics: string[];
  };
  overall: {
    strengths: string[];
    problems: string[];
    priority: { action: string; why: string }[];
  };
}

export interface SeriesStyle {
  label: string;
  summary: string;
  characteristics: string[];
  consistency: number;
}

export interface AnalyzeResult {
  photos: PhotoAnalysis[];
  seriesStyle?: SeriesStyle;
}

export interface ShootingPlanStep {
  step: number;
  title: string;
  description: string;
}

export interface ReconstructResult {
  camera: Confidence<string>;
  lens: Confidence<{ range: string; type: string }>;
  settings: Confidence<{ aperture: string; shutter: string; iso: string }>;
  perspective: Confidence<string>;
  lighting: Confidence<string>;
  location: Confidence<string>;
  props: { item: string; function: string }[];
  styling: string;
  composition: string;
  postProcessing: string;
  shootingPlan: ShootingPlanStep[];
}

export interface ColorSwatch {
  hex: string;
  name: string;
}

export interface Concept {
  title: string;
  mood: string;
  location: string;
  background: string;
  lighting: string;
  props: { item: string; function: string }[];
  composition: string;
  colorPalette: ColorSwatch[];
  moodDescription: string;
  searchPrompts: string[];
  referenceNotes: string[];
}

export interface IdeaResult {
  description: string;
  concepts: Concept[];
}

export interface PlanResult {
  location: string;
  props: { item: string; function: string }[];
  lighting: string;
  camera: string;
  lens: string;
  composition: string;
  styling: string;
  shotList: { title: string; description: string }[];
  editingDirection: string;
}

export type ProjectResult = AnalyzeResult | ReconstructResult | IdeaResult | PlanResult;

export interface Project {
  id: string;
  type: ProjectType;
  title: string;
  createdAt: number;
  updatedAt: number;
  thumbnailId?: string;
  imageIds: string[];
  inputText?: string;
  result: ProjectResult;
  parentId?: string;
}
