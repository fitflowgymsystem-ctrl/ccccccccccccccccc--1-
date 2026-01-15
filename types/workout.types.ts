
export enum ExerciseType {
  NORMAL = 'Normal',
  SUPER_SET = 'Super Set',
  DROP_SET = 'Drop Set',
  CIRCUIT = 'Circuit',
  AMRAP = 'AMRAP'
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  type: ExerciseType;
  restTime?: string;
  completed?: boolean;
}

export interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  durationWeeks: number;
  startDate: string;
  days: WorkoutDay[];
}

export interface WaterLog {
  date: string;
  amountMl: number;
}
