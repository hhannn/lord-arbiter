import { Pencil } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden">
                <DialogHeader>
                    {/* <DialogTitle>Profile</DialogTitle> */}
                </DialogHeader>
                <div className="flex items-center gap-4 ps-2">
                    <img className="absolute -left-0 -top-20 w-[calc(100% + 8px)] h-auto" src="https://cdn.wanderer.moe/wuthering-waves/cards/T_Card5.png" alt="Banner" />
                    <div className="absolute left-0 top-0 w-full h-32 bg-linear-180 from-neutral-950 to-neutral-900/0" />
                    <Avatar className="relative size-32 border bg-background/5 backdrop-blur-xs">
                        <AvatarImage src="https://static.wikia.nocookie.net/wutheringwaves/images/d/da/Resonator_Qiuyuan.png" alt="MN" />
                    </Avatar>
                    <div className="relative flex flex-col gap-2 w-full">
                        <div className="text-2xl font-medium">
                            Tofu
                            <Button className="ms-2 size-8" variant="outline" size="sm"><Pencil /></Button>
                        </div>
                        <div className="">UID: 1098123412</div>
                    </div>
                </div>
                <div className="relative flex flex-col gap-2 w-full mt-4">
                    <Label>API Key</Label>
                    <Input value="JvFeHcgoCZ2uusY6dL" disabled />
                    <Label>API Secret</Label>
                    <Input value="******" disabled />
                    <Label>Password</Label>
                    <Input value="******" disabled />
                </div>
            </DialogContent>
        </Dialog>
    )
}