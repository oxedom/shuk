import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UserInstance, UserRole } from "@oxedom/shared-shuk";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

export const authOptions: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    ...(!process.env.CI
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID as string,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET as string,
    // }),
  ],
  callbacks: {
    //TODO: FIX THIS URGENTLY
    //@ts-ignore
    jwt: async ({
      token,
      user,
      account,
    }: {
      token: JWT;
      user: User;
      account: any;
    }) => {
      // Enrich token with user data - on initial sign in or if missing user_id
      if (
        (account?.provider === "google" && user?.email) ||
        (!token.user_id && token.email)
      ) {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXTAUTH_URL || "http://localhost:3000";
        const url = new URL("/api/auth/userStatus", baseUrl);
        url.searchParams.set("secret", process.env.SECRET || "");
        url.searchParams.set("email", user?.email || token.email || "");

        try {
          const response = await fetch(url.href, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            console.error(`Failed to fetch user status: ${response.status}`);
            return token;
          }

          const { user: dbUser } = (await response.json()) as {
            user: UserInstance;
          };
          if (dbUser) {
            // Map user roles based on flags
            const roles = [
              dbUser.is_trainee && UserRole.TRAINEE,
              dbUser.is_coach && UserRole.COACH,
              dbUser.is_gym_admin && UserRole.GYM_ADMIN,
              dbUser.is_super_admin && UserRole.SUPERADMIN,
            ].filter(Boolean) as UserRole[];

            if (!dbUser.gym_id) {
              throw new Error("User does not have a gym");
            }

            token.user_id = dbUser.user_id;
            token.gym_id = dbUser.gym_id;
            token.roles = roles;
          }
        } catch (error) {
          console.error("Error fetching user status:", error);
        }
      }
      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (token && session.user) {
        session.user.user_id = token.user_id;
        session.user.gym_id = token.gym_id;
        session.user.roles = token.roles;
      }
      return session;
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
