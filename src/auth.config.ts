import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "alara-training-system-secret-key-2026",
  providers: [], // Configured with full providers in auth.ts
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.image = user.image;
        token.isProfileComplete =
          token.role !== "PESERTA"
            ? true
            : (user as any).isProfileComplete ?? false;
      }
      if (trigger === "update" && session) {
        if (session.isProfileComplete !== undefined) {
          token.isProfileComplete = session.isProfileComplete;
        }
      }
      if (token.role && token.role !== "PESERTA") {
        token.isProfileComplete = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.image = (token.image as string) || null;
        (session.user as any).isProfileComplete =
          token.role !== "PESERTA"
            ? true
            : (token.isProfileComplete as boolean ?? false);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
