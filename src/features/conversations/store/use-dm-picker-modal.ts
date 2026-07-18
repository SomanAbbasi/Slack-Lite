import { atom, useAtom } from "jotai";

const dmPickerModalAtom = atom(false);

export const useDmPickerModal = () => {
  return useAtom(dmPickerModalAtom);
};
