"use client"

import { cn } from "@/lib/utils";
import { BotAvatar } from "./botavatar";
import { useTheme } from "next-themes";
import {BeatLoader} from "react-spinners"
import { UserAvatar } from "./useravatar";


export interface ChatMessageProps{
    role:"system"|"user",
    content?:string;
    isLoading?:boolean;
    src?:string
};

export const ChatMessage=({
    role,content,isLoading,src
}:ChatMessageProps)=>{
    const {theme}=useTheme();
    return(
        <div className={cn("group flex items-start gap-x-3 py-4 w-full",
            role==="user" && "justify-end"
        )}>
            {role!=="user"&&src&&<BotAvatar src={src}/>}
            <div className="rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10">
            {isLoading?<BeatLoader 
            size={5}
            color={theme==="light"?"black":"white"}/>
            :content}

            </div>
            {role==="user" && <UserAvatar/>}
        </div>
    )
}