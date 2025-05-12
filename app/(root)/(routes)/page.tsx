import { Categories } from "@/component/categories";
import { SearchInput } from "@/component/searchinput";
import { Companions } from "@/components/companions";
import prismadb from "@/lib/prismadb"; 

interface RootPageProps{
    searchParams: {
        categoryId:string;
        name:string;
    }
}
const RootPage = async ({searchParams}:RootPageProps) => {
    const data=await prismadb.companion.findMany({
        where:{
            categoryId:searchParams.categoryId,
            name:{
                search:searchParams.name,
            },
        },
        orderBy:{
            createdAt:"desc",
        },
       
    })
    const categories = await prismadb.category.findMany(); 

    return (
        <div className="h-full p-4 space-y-2">
            <SearchInput />
            <Categories data={categories} />
            <Companions data={data} />
        </div>
    );
};

export default RootPage;
