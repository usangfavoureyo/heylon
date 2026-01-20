import { action } from "./_generated/server";
import { v } from "convex/values";

// Simple single-user password verification
export const verifyPassword = action({
    args: { password: v.string() },
    handler: async (ctx, args) => {
        // In production, this usage of process.env is standard for Convex Actions
        const correctPassword = process.env.AUTH_PASSWORD || "heylon_admin"; // Default fallback for dev

        if (args.password === correctPassword) {
            return {
                success: true,
                // We can return a simple session token or just success.
                // For a single user system, the "token" can just be a signed string 
                // or effectively the password hash if we want stateless.
                // We'll return a static success marker for the client to set a cookie.
                token: "session_valid"
            };
        }

        return { success: false, message: "Invalid Password" };
    },
});
