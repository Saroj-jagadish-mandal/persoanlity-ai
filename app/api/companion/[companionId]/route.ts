import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function PATCH(req:Request,{params}:{params:{companionId:string}} ){
    try{
        const body=await req.json();
        const user=await currentUser();
        const {name,description,instructions,seed,src,categoryId}=body;

        if(!params.companionId){
            return new NextResponse("Companion ID is required",{
                status:400,
            });
        }

        if(!user||!user.id||!user.firstName){
            return new NextResponse("Unauthorized",{
                status:401,
            });
        }
        if(!name||!description||!instructions||!seed||!src||!categoryId){
            return new NextResponse("Missing Fields",{
                status:400,
            });
        }

        const companion=await prismadb.companion.update({
            where:{
                id:params.companionId,
            },
            data:{  
                name,
                description,
                instructions,
                seed,
                src,
                categoryId,
                userId:user.id,
                userName:user.firstName,

            },
        });
        return NextResponse.json(companion);

    }catch(error){
        console.log("[COMPANION_PATCH]",error);
        return new NextResponse("Internal Error",{
            status:500, });

    }
}