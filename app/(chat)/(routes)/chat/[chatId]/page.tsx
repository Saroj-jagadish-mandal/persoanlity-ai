
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";
import { ChatClient } from "./component/client";


interface ChatIdPageProps{
    params:{
        chatId:string
    }
}



const ChatIdPage=async ({
    params
}:ChatIdPageProps)=>{

    const { userId } = await auth();


   if (!userId) {
    return redirect("/");
  }
   

   const companion=await prismadb.companion.findUnique({
    where:{
        id:params.chatId
    },
    include:{
        messages:{
            orderBy:{
                createdAt:"asc",
            },
            where:{
                userId,
            }
            
        }
    }
   });
   if(!companion){
    return redirect("/")
   }
       

    return(
        <ChatClient companion={companion}/>
    );
}

export default ChatIdPage;