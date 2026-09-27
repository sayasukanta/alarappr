import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    isProfileComplete?: boolean;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      image?: string | null;
      isProfileComplete?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    isProfileComplete?: boolean;
    image?: string | null;
  }
}
