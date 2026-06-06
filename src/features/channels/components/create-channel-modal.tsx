
import { Button } from "@/components/ui/button"
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

import { useState } from "react";


import { useCreateChannelModal } from "../store/use-create-channel-modal";
import { Input } from "@/components/ui/input";
import { useCreateChannel } from "./use-create-channel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { handleBuildComplete } from "next/dist/build/adapter/build-complete";

export const CreateChannelModal = () => {

    const workspaceId = useWorkspaceId();


    const [open, setOpen] = useCreateChannelModal();
    const [name, setName] = useState("");


    const { mutate, isPending } = useCreateChannel()

    const handleClose = () => {
        setOpen(false);
        setName("");
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, "-").toLowerCase(); //remove all white spaces

        setName(value);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate(
            { name, workspaceId: workspaceId }
            
            , 
            { 
                onSuccess:(id)=>{
                    // TODO: Redirect to the newly created channel
                    handleClose();
                }



             }
        
        
        );
    }


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>

                    <DialogTitle>Add a Channel</DialogTitle>

                </DialogHeader>

                <form  onSubmit={handleSubmit}    className="space-y-4">
                    <Input
                        value={name}
                        disabled={isPending}
                        onChange={handleChange}
                        required
                        autoFocus
                        minLength={3}
                        maxLength={80}
                        placeholder="e.g. plan-budget"

                    />

                    <div className="flex justify-end">
                        <Button disabled={false}>

                            Create
                        </Button>


                    </div>


                </form>


            </DialogContent>


        </Dialog>
    )
}
