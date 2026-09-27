import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password diperlukan");
        }

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase().trim() },
        });

        if (!user) {
          throw new Error("Email tidak ditemukan");
        }

        if (!user.passwordHash) {
          throw new Error(
            "Akun ini terdaftar menggunakan Google. Silakan masuk menggunakan tombol Google."
          );
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Password salah");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role,
          image: user.image || null,
          isProfileComplete: user.role !== "PESERTA" ? true : !!(user.nik && user.phoneNumber),
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const normalizedEmail = user.email.toLowerCase().trim();

        // Check if user exists in database
        let dbUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!dbUser) {
          // Create user verified by Google
          dbUser = await prisma.user.create({
            data: {
              email: normalizedEmail,
              fullName: user.name || "Peserta ALARA",
              role: "PESERTA",
              image: user.image || null,
            },
          });
        } else if (user.image && !dbUser.image) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { image: user.image },
          });
        }

        user.id = dbUser.id.toString();
        (user as any).role = dbUser.role;
        (user as any).isProfileComplete = dbUser.role !== "PESERTA" ? true : !!(dbUser.nik && dbUser.phoneNumber);
        (user as any).image = dbUser.image || user.image;
        return true;
      }
      return true;
    },
  },
});
