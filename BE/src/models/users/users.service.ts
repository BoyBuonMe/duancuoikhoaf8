import User from "@/models/users/User.model";

const DEFAULT_TELL_FALLBACK = "0123456789";

/** Returns the user's `tell` from DB, or null if unset. */
export async function getUserTellByEmail(email: string): Promise<string | null> {
  const user = await User.findOne({ email: email.toLowerCase() })
    .select("tell")
    .lean();

  const tell = user?.tell?.trim();
  return tell || null;
}

/** Phone for order emails: DB `tell` or default placeholder. */
export async function resolveUserTellForOrder(email: string): Promise<string> {
  return (await getUserTellByEmail(email)) ?? DEFAULT_TELL_FALLBACK;
}

export { DEFAULT_TELL_FALLBACK };
