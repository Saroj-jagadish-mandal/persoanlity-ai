import { Companion } from "@prisma/client"
import { Card, CardFooter, CardHeader } from "./ui/card";
import Link from "next/link";
import Image from "next/image";
import { MessagesSquare } from "lucide-react";

interface CompanionProps {
    data:Companion[];
}


export const Companions = ({data}: CompanionProps) => {


    return(
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pb-10 ">
           {
            data.map((item)=>(
                <Card 
                key={item.id}
                className="bg-primary/10 rounded-xl cursor-pointer hover:opacity-75 transition border-0"
                >
                    <Link href={`/chat/${item.id}`}>
                      <CardHeader className="flex flex-col items-center justify-center text-center text-muted-foreground">
                        <div className="relative w-32 h-32">
                            <Image
                            src={item.src}
                            fill
                            className="rounded-xl object-cover "
                            alt="character Image"
                            />

                        </div>
                        <p className="font-bold">
                            {item.name}
                        </p>
                        <p className="text-xs">
                        The error message is   The error message is  The error message is  The error message is  The error message is
                        </p>

                      </CardHeader>

                      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                        <p className="lowercase">
                            @{item.userName}

                        </p>
                        <div className="flex items-center">
                            <MessagesSquare className="w-3 h-3 mr-1"/>

                        </div>

                      </CardFooter>

                    </Link>

                </Card>
            ))
           }
        </div>
    )
}