const {PrismaClient} = require('@prisma/client');
const db= new PrismaClient();

async function main() { 
    try {
      await db.category.createMany({
        data: [
            {name: "General"},
            {name: "Technology"},
            {name: "Science"},
            {name: "Health"},
            {name: "Business"},
            {name: "Entertainment"},
            {name: "Sports"},
            {name: "Politics"},
            {name: "Travel"},
            {name: "Food"},
            {name: "Fashion"},
            {name: "Art"},
            {name: "Music"},
            {name: "Literature"},
            {name: "History"},
            {name: "Philosophy"},
            {name: "Psychology"},
            {name: "Religion"},
            {name: "Education"},
            {name: "Language"},
            {name: "Other"},
        ],
      });
    } catch (error) {
        console.error("Error connecting to the database:", error);
    } finally {
        await db.$disconnect();
    } 
};

main();


