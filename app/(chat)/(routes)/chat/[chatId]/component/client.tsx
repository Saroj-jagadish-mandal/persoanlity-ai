"use client";

import { ChatHeader } from "@/component/chat-header";
import { Companion, Message } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { useCompletion } from '@ai-sdk/react';
import { ChatForm } from "@/component/chat-form";
import { ChatMessages } from "@/component/chat-messages";
import { ChatMessageProps } from "@/component/chat-message";

interface ChatClientProps {
    companion: Companion & {
        messages: Message[],
    };
};

export const ChatClient = ({ companion }: ChatClientProps) => {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessageProps[]>(companion.messages);
    const completionState = useCompletion({
        api: `/api/chat/${companion.id}`,
        onFinish(prompt, completion) {
            console.log("onFinish - Completion received:", completion);
            const systemMessage: ChatMessageProps = {
                role: "system",
                content: completion,
            };
            setMessages((current) => [...current, systemMessage]);
            setInput("");
        },
    });
    const { input, isLoading, handleInputChange, handleSubmit, setInput } = completionState;
    console.log("useCompletion state:", completionState);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input || isLoading) {
            return;
        }
        const userMessage: ChatMessageProps = {
            role: "user",
            content: input,
        };
        setMessages((current) => [...current, userMessage]);
        handleSubmit(e);
    };

    useEffect(() => {
        console.log("Current messages:", messages);
    }, [messages]);

    return (
        <div className="flex flex-col h-full p-4 space-y-2 ">
            <ChatHeader companion={companion} />
            <ChatMessages
                companion={companion}
                isLoading={isLoading}
                messages={messages}
            />
            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit}
            />
        </div>
    );
}