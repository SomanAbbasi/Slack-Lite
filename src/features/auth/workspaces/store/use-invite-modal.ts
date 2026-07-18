import { atom, useAtom } from "jotai";

const inviteModalAtom = atom(false);

export const useInviteModal = () => {
  return useAtom(inviteModalAtom);
};
