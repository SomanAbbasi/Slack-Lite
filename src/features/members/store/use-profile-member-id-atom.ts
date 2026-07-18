import { atom } from "jotai";
import { Id } from "../../../../convex/_generated/dataModel";

export const profileMemberIdAtom = atom<Id<"members"> | null>(null);
