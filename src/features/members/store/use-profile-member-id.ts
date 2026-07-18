"use client";

import { useAtom } from "jotai";
import { profileMemberIdAtom } from "./use-profile-member-id-atom";

export const useProfileMemberId = () => {
  return useAtom(profileMemberIdAtom);
};
