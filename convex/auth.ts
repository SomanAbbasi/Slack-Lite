import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";

import Google from "@auth/core/providers/google";
import { DataModel } from "./_generated/dataModel";

function validatePasswordRequirements(password: string) {
  const trimmed = password.trim();
  if (password !== trimmed) {
    throw new Error("Password cannot start or end with spaces.");
  }
  if (trimmed.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const hasUpper = /[A-Z]/.test(trimmed);
  const hasLower = /[a-z]/.test(trimmed);
  const hasNumber = /\d/.test(trimmed);
  const hasSymbol = /[^A-Za-z0-9]/.test(trimmed);
  if (!hasUpper || !hasLower || !(hasNumber || hasSymbol)) {
    throw new Error(
      "Password must include an uppercase letter, a lowercase letter, and a number or symbol.",
    );
  }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      validatePasswordRequirements,
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
    GitHub,
    Google,
  ],
});
