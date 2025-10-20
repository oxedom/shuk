import { UserRole } from "@oxedom/shared-shuk";
import "next-auth";
import "next-auth/jwt";

//TODO understand why this is needed typescript wise?
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      user_id: number;
      gym_id: number;
      roles: UserRole[];
    };
  }

  interface User {
    user_id: number;
    gym_id: number;
    roles: UserRole[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id: number;
    gym_id: number;
    roles: UserRole[];
  }
}
