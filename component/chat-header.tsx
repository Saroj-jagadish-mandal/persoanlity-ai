"use client"

import { Button } from "@/components/ui/button";
import { Companion, Message } from "@prisma/client"
import { ChevronLeft, Edit, MessagesSquare, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { BotAvatar } from "./botavatar";
import { useUser } from "@clerk/nextjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ChatHeaderProps{
    companion:Companion &{
        messages:Message[];
    };
};

export const ChatHeader=({companion}:ChatHeaderProps)=>{
    const router=useRouter();
    const {user}=useUser();
    return(
        <div className="flex w-full items-center justify-between border-b border-primary/10 pb-4">
            <div className="flex gap-x-2 items-center ">
                <Button onClick={()=>router.back()} size="icon" variant="ghost" >
                    <ChevronLeft className="w-10 h-10"/>

                </Button>
                <BotAvatar src={companion.src}/>

                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-2">
                        <p className="font-bold">
                            {companion.name}
                        </p>

                        <div className="flex items-center text-xs text-muted-foreground">
                            <MessagesSquare className="w-3 h-3 mr-1"/>


                        </div>

                    </div>
                    <p className="text-xs text-muted-foreground">
                        Created by {companion.userName}

                    </p>



                </div>

            </div>
            {user?.id===companion.userId &&(
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon">
                        <MoreVertical/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={()=>router.push(`/companion/${companion.id}`)}>
                        <Edit className="w-4 h-4 mr-2"/>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Trash className="w-4 h-4 mr-2"/>
                        Delete
                    </DropdownMenuItem>

                </DropdownMenuContent>
               </DropdownMenu>
            )}
        </div>
    )
}