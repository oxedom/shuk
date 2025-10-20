import { Gender } from ".";
interface TimeSchema {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSchema {
  gender: Gender;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  birthday: Date | null;
  is_active: boolean;
  is_coach: boolean;
  is_trainee: boolean;
  is_gym_admin: boolean;
  is_super_admin: boolean;
  gym_id: number | null;
}

export interface UserInstance extends UserSchema, TimeSchema {
  user_id: number;
}
