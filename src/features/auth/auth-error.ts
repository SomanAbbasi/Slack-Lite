export type AuthFlow = "signIn" | "signUp";
export type AuthProvider = "google" | "github";

function extractMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "";
  }
}

function cleanMessage(message: string): string {
  if (!message) return "";
  const firstLine = message.split("\n")[0] ?? "";
  return firstLine
    .replace(/^\[Request ID:[^\]]+\]\s*/i, "")
    .replace(/^Server Error\s*/i, "")
    .replace(/^Uncaught Error:\s*/i, "")
    .trim();
}

function isInvalidCredentialsMessage(message: string): boolean {
  return /invalid\s+(credentials|email|password)|wrong\s+password/i.test(message);
}

function isRateLimitMessage(message: string): boolean {
  return /too\s+many\s+requests|rate\s*limit|try\s+again\s+later/i.test(message);
}

export function getAuthErrorMessage(
  error: unknown,
  opts: { flow: AuthFlow; provider?: AuthProvider },
): string {
  const raw = extractMessage(error);
  const message = cleanMessage(raw);

  if (opts.flow === "signIn") {
    if (isRateLimitMessage(message)) {
      return "Too many attempts. Please try again in a moment.";
    }
    if (isInvalidCredentialsMessage(message)) {
      return "Invalid email or password.";
    }
    // In dev, Convex may wrap the original error in a generic server message.
    // For sign-in, keep it simple and safe.
    return "Invalid email or password.";
  }

  // signUp
  if (isRateLimitMessage(message)) {
    return "Too many attempts. Please try again in a moment.";
  }

  // Show safe, user-actionable validation messages.
  if (/^password\b/i.test(message) || /password\s+must/i.test(message)) {
    return message || "Password does not meet the requirements.";
  }

  if (/already\s+exists|already\s+in\s+use/i.test(message)) {
    return "An account with this email already exists. Try signing in instead.";
  }

  return "Couldn’t create your account. Please try again.";
}

export function getProviderErrorMessage(provider: AuthProvider): string {
  return provider === "google"
    ? "Couldn’t continue with Google. Please try again."
    : "Couldn’t continue with GitHub. Please try again.";
}
