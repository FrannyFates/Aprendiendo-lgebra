export interface DrawExercise {
  x2: number;
  x: number;
  xd2: number;
  xd3: number;
  xd4: number;
  u: number;
  t: string;
}

export interface Balance1Exercise {
  x: number;
  c: number;
  r: number;
  isD?: boolean;
}

export interface StepPaso {
  v: string; // Formula with highlight
  p: string; // Current prompt question, e.g. "(2 * 4)" or "6 + 8"
  r: number; // Correct result
  bOutside: number; // Single tiles outside the operation
  bOp1?: number; // First operand for op
  bOp2?: number; // Second operand for op
  mul?: number; // If multiplication, number of groups
  mulCount?: number; // Count per group
  div?: number; // If division, number of columns
  divTotal?: number; // Total items to divide
  order?: 'opFirst' | 'outsideFirst'; // Whether op is before or after the outside number
}

export interface StepExercise {
  id: number;
  title: string;
  pasos: StepPaso[];
}

export interface Balance2Exercise {
  x: number;
  c: number;
  r: number;
  ty: 'm' | 'f'; // 'm' for coefficient multiplication, 'f' for fraction division
  den?: number;
}

export interface ManipulativeExercise {
  id: number;
  title: string;
  xCount: number;
  c: number;
  r: number;
  ty: 'm' | 'f';
  den?: number;
  sol: number;
}

export interface TutorialStep {
  txt: string;
  v: string;
}

export interface Tutorial {
  t: string;
  steps: TutorialStep[];
}
