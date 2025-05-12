import{Redis} from "@upstash/redis"
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from '@langchain/pinecone';





export type companionkey={
    companionName:string;
    modelName:string;
    userId:string;
};

export class MemoryManager{
    private static instance :MemoryManager
    private history:Redis;
    private vectorDBClient: Pinecone;

    public constructor(){
        this.history=Redis.fromEnv();
        this.vectorDBClient = new Pinecone();
    }

    public async init(){
        if(this.vectorDBClient instanceof Pinecone){
            this.vectorDBClient = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY!,
                
               
            });
        }
    }

    public async vectorSearch (
        recentChatHistory:string,
        companionFileName:string,
    ){
        const pinecone=<Pinecone>this.vectorDBClient;
        const pineconeIndex=pinecone.Index(
            process.env.PINECONE_INDEX!||""
        );

        const vectorStore=await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings({openAIApiKey:process.env.OPEN_API_KEY}),
            {pineconeIndex}

        );

        const similarDocs=await vectorStore 
        .similaritySearch(recentChatHistory,3,{fileName:companionFileName})
        .catch((err: unknown) => {
            console.log("failed to get vector search result",err);
        })

        return similarDocs;
    }
    public static async getInstance():Promise<MemoryManager>{
        if(!MemoryManager.instance){
            MemoryManager.instance=new MemoryManager();
            await MemoryManager.instance.init();
        }
        return MemoryManager.instance
    }
    private generateRedisCompanionKey(companionKey: companionkey): string {
        return ` ${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
    }

    public async writeTOHistory(text:string,companionKey:companionkey){
        if(!companionKey||typeof companionKey.userId=="undefined"){
            console.log("companion key is wrong");
            return"";
        }
        const key=this.generateRedisCompanionKey(companionKey);
        const result=await this.history.zadd(key,{
            score:Date.now(),
            member:text,
        });
        return result;

    }
    public async readLatestHistory(comapnionKey:companionkey):Promise<string>{
        if (!comapnionKey || typeof comapnionKey.userId === "undefined") {
            console.log("companion key is wrong");
            return "";
        }
        const key = this.generateRedisCompanionKey(comapnionKey);
        let result = await this.history.zrange(key, 0, Date.now(),{
            byScore:true,
        });

        result=result.slice(-30).reverse();
        const recentChats=result.reverse().join("\n");
        return recentChats;

        // return latestHistory.length > 0 ? latestHistory[0] : "";
    }
    public async seedChatHistory(
        seedContent:string,
        delimiter:string="\n",
        companionKey:companionkey
    ){
        const key =this.generateRedisCompanionKey(companionKey);
        if(await this.history.exists(key)){
            console.log("history already exists");
            return;
        }
        const content =seedContent.split(delimiter);
        let counter=0;
        for(const line of content){
            await this.history.zadd(key,{
                score:counter,
                member:line
            });
            counter+=1;
        }
    }
}