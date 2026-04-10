

'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


import { useCreateWorkspaceModal

 } from "../store/use-create-workspace-modal";
export const CreateWorkspaceModal=()=>{
    const [open,setOpen]=useCreateWorkspaceModal();

    const handleClose=()=>{
        setOpen(false);
        //Clear form

    }
    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>

                    <DialogTitle>Add a workspace</DialogTitle>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )

}