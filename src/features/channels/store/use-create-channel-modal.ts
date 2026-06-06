
import {atom,useAtom} from "jotai";


const createWorkspaceModalAtom=atom(false);


const modalState=atom(false);

export const useCreateChannelModal=()=>{
    return useAtom(modalState);
}