import type { LucideIcon } from "lucide-react";

export interface ActionItem {
  labelKey: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  variant?: "destructive" | "ghost";
  condition?: boolean;
}

export interface ProgramPlanData {
  english_name: string;
  hebrew_name: string;
  is_active: boolean;
  is_locked: boolean;
  user_id: number;
  workouts: ProgramPlanWorkoutData[];
}

export interface ProgramPlanWorkoutData {
  english_name: string;
  hebrew_name: string;
  exercises: ProgramPlanWorkoutExerciseData[];
  comment: string;
}

export interface ProgramPlanWorkoutExerciseData {
  exercise_id: number;
  position: number;
  sets: number;
  comment: string;
  kg: number;
  reps: number;
}
