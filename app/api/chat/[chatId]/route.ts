import { StreamingTextResponse, LangChainStream } from 'ai';
import { useAuth, useUser } from "@clerk/nextjs";
import { CallbackManager } from "@langchain/core/callbacks/manager";
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memory';
import { rateLimit } from '@/lib/rate-limit';
import prismadb from '@/lib/prismadb';
import { Readable } from 'stream';
import { create } from 'domain';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(
    request:Request,
    {params}:{params:{chatId:string}}
){
    try{
        const {prompt}=await request.json();
        const user=await currentUser();
        if(!user||!user.id){
            return new NextResponse("Unauthorized",{status:401});
        }
        const identifier=request.url+"-"+user.id;
        const {success}=await rateLimit(identifier);
        if(!success){
            return new NextResponse("Rate limit exceeded", {status:429});
        }

        const companion=await prismadb.companion.update({
            where:{
                id:params.chatId,
            },
            data:{
                messages:{
                    create:{
                        content:prompt,
                        role:"user",
                        userId:user.id,
                    }
                }
            },
        });

        if(!companion){
            return new NextResponse("Companion not found", {status:404});
        }

        const name=companion.id;
        const companion_file_name=name+".txt";

        const companionKey={
            companionName:name,
            userId:user.id,
            modelName:"gemini-pro",
        };

        const memoryManager=await MemoryManager.getInstance();
        const records=await memoryManager.readLatestHistory(companionKey);
        if(records.length===0){
            await memoryManager.seedChatHistory(
                companion.seed,
                "\n\n",
                companionKey
            );
        }

        await memoryManager.writeTOHistory("user:"+prompt+"\n",companionKey);
        const recentChatHistory=await memoryManager.readLatestHistory(companionKey);
        const similarDocs=await memoryManager.vectorSearch(recentChatHistory,companion_file_name);

        let relevantHistory=""
        if(!!similarDocs && similarDocs.length!==0){
            relevantHistory=similarDocs.map((doc)=>doc.pageContent).join("\n");
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const formattedPrompt = `ONLY generate plain sentences without prefix of who is speaking .DO NOT use ${name}:prefix.
${companion.instructions}
BELOW are the relevant details about ${name}'s past and the conversation you are in.
${relevantHistory}
${companion.seed}
${recentChatHistory}\n${name}: `;

        const generateContentRequest = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: formattedPrompt }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 2048,
            },
        };

        const result = await model.generateContentStream(generateContentRequest as any); // TEMPORARY 'as any' CAST

        async function* transformStream() {
            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                    yield text;
                }
            }
        }

        // Convert async generator to ReadableStream
        const readableStream = new ReadableStream({
            async pull(controller) {
                for await (const chunk of transformStream()) {
                    controller.enqueue(new TextEncoder().encode(chunk));
                }
                controller.close();
            },
        });

        let response = "";
        const reader = readableStream.getReader();
        let done: boolean = false, value: Uint8Array | undefined;
        while (!done) {
            ({ done, value } = await reader.read());
            if (value) {
                response += new TextDecoder().decode(value);
            }
        }
        response = response.trim();

        await memoryManager.writeTOHistory(""+response,companionKey);

        if (response !== undefined && response.length > 1) {
            await prismadb.companion.update({
                where: {
                    id: params.chatId,
                },
                data: {
                    messages: {
                        create: {
                            content: response,
                            role: "system",
                            userId: user.id,
                        }
                    }
                }
            });
        }

        return new StreamingTextResponse(readableStream);

    }catch(error){
        console.log("[chat_post]",error)
        return new NextResponse("Internal Error", { status: 500 });
    }
}