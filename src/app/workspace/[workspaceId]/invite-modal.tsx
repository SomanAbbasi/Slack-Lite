

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


interface InviteModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}


export const InviteModal = (props: InviteModalProps) => {

    return (
        <Dialog open={props.open} onOpenChange={props.setOpen}>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        
                        Invite people to your workspace 
                        
                        
                        </DialogTitle>

                </DialogHeader>

            </DialogContent>
        </Dialog>
    )
}

