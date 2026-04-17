

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

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useCreateWorkspace } from "../api/use-create-workspace";

import {
    useCreateWorkspaceModal

} from "../store/use-create-workspace-modal";
import { Router } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
export const CreateWorkspaceModal = () => {
    const router=useRouter();
    const [open, setOpen] = useCreateWorkspaceModal();
    const [name, setName] = useState("");

    const { mutate, isPending, isError, isSuccess, data, error } = useCreateWorkspace();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        mutate({ name }, {

            onSuccess(data) {
                toast.success("workspace created");
                router.push(`/workspace/${data}`);
                handleClose();


            },
        })

    };


    const handleClose = () => {
        setOpen(false);
        setName("");

    }
    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>

                    <DialogTitle>Add a workspace</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        required
                        autoFocus
                        minLength={3}
                        placeholder="Worksapce name e.g.'Work','Personal', 'Home'"
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending}>
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )

}