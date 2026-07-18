import { atom } from "jotai";
import { Id } from "../../../../convex/_generated/dataModel";

export const parentMessageIdAtom = atom<Id<"messages"> | null>(null);
