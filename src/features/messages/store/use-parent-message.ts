"use client";

import { useAtom } from "jotai";
import { parentMessageIdAtom } from "../store/use-parent-message-id";

export const useParentMessageId = () => {
  return useAtom(parentMessageIdAtom);
};
