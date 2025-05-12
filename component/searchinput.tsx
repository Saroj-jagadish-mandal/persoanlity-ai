"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEventHandler, useEffect, useState } from "react";
import qs from "query-string";

export const SearchInput = () => {
    const router = useRouter(); // Corrected: `useRouter` is invoked
    const searchParams = useSearchParams();

    const categoryId = searchParams.get("categoryId");
    const name = searchParams.get("name");
    const [value, setValue] = useState(name || "");
    const debounceValue = useDebounce<string>(value, 500);

    const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setValue(e.target.value);
    };

    useEffect(() => {
        const query = {
            name: debounceValue,
            categoryId: categoryId,
        };
        const url = qs.stringifyUrl(
            {
                url: window.location.href,
                query,
            },
            { skipNull: true, skipEmptyString: true }
        );
        router.push(url); // This will now work correctly
    }, [debounceValue, categoryId, router]);

    return (
        <div className="relative">
            <Search className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
            <Input
                placeholder="Search..."
                className="pl-10 bg-primary/10"
                value={value}
                onChange={onChange} // Ensure the input is controlled
            />
        </div>
    );
};