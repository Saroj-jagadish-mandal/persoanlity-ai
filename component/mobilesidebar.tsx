import { Menu } from "lucide-react"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export const MobileSidebar =()=>{
    return(
       
        <Sheet>
            <SheetTrigger className="md:hidden pr-4">
                <Menu/>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-secondary pt-10">
                <Sidebar/>
            </SheetContent>
        </Sheet>
    )
}