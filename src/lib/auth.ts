import { PrismaClient } from "@/generated/prisma-user-database/user-database-client-types";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
// If your Prisma file is located elsewhere, you can change the path
// import { PrismaClient } from "@/generated/prisma";
 
const prisma = new PrismaClient();
export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "sqlite", // or "mysql", "postgresql", ...etc
    }),
    plugins: [nextCookies()],
    emailAndPassword: {  
        enabled: true
    },
    socialProviders: { 
        github: { 
           clientId: process.env.GITHUB_CLIENT_ID as string, 
           clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
           clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }
    },
});