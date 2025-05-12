"use client";
import axios from "axios";
import { Companion, category } from "@prisma/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CompanionFormProps {
    initialData:Companion|null;
    categories:category[];
}

const formSchema=z.object({
    name:z.string().min(1,{
        message:"Name is required"
    }),
    description:z.string().min(1,{
        message:"Description is required"
    }),
    instructions:z.string().min(200,{
        message:"Instructions is required"
    }),
    seed:z.string().min(1,{
        message:"Seed is required"
    }),
    src:z.string().min(1,{
        message:"Image is required"
    }),
    categoryId:z.string().min(1,{
        message:"Category is required"
    }),
});
export const CompanionForm = ({
    categories,
    initialData
}: CompanionFormProps) => {

  const router=useRouter();

    const form=useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:initialData||{
            name:"",
            description:"",
            instructions:"",
            seed:"",
            src:"",
            categoryId:undefined,
        }
    });
     const isLoading=form.formState.isSubmitting;

     const onSubmit=async(values:z.infer<typeof formSchema>)=>{
        try{
          if(initialData){
             await axios.patch(`/api/companion/${initialData.id}`,values);
          }else{
            await axios.post("/api/companion",values);
          }

          router.refresh();
          router.push("/");

        }catch(error){
            console.log(error);
        }
     }


    return (
        <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                    <div className="space-y-2 w-full ">
                        <div>
                            <h3 className="text-lg font-medium">
                                General Information
                            </h3>
                            <p>
                                General information about your companion.
                            </p>
                        </div>
                        <Separator className="bg-primary/10"/>

                    </div>

                    <FormField
            name="src"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4">
                <FormControl>
                    <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} /> 


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <FormField
              name="name"
              control={form.control}
              render={
                ({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="text" disabled={isLoading} {...field} className="input" placeholder="Saroj Mandal" />
                    </FormControl>
                    <FormDescription>
                      This is how your AI Companion will be named.

                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )
              } />
            <FormField
              name="description"
              control={form.control}
              render={
                ({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input type="text" disabled={isLoading} {...field} className="input" placeholder="Description here..." />
                    </FormControl>
                    <FormDescription>
                      Short description for your AI Companion.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              } />

            <FormField
              name="categoryId"
              control={form.control}
              render={
                ({ field }) => (
                  <FormItem >
                    <FormLabel>Category</FormLabel>
                    
                      <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue
                            defaultValue={field.value}
                            placeholder="Select a category"
                          />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   
                    <FormMessage /> {/* Moved FormMessage inside FormItem */}
                    <FormDescription>
                      Category for your AI Companion.
                    </FormDescription>
                  </FormItem>
                )
              } />



          </div>

          <div className="space-y-2 w-full ">
            <div>
              <h3 className="text-lg font-medium">
                Configuration

              </h3>
              <p className="text-sm text-muted-foreground">
                Detailed instructions for AI Behaviour

              </p>
            </div>
            <Separator className="bg-primary/10" />

          </div>
          <FormField
            name="instructions"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea rows={8} disabled={isLoading} {...field} className="bg-background resize-none " placeholder="kuch bhi" />
                </FormControl>
                <FormDescription>
                  Describe in detail of your AI Companion's behaviour, personality, backstory and other details.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />

          <FormField
            name="seed" //Added missing field.
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Seed</FormLabel>
                <FormControl>
                  <Textarea rows={8} disabled={isLoading} {...field} className="bg-background resize-none " placeholder="Enter Seed here ...." />
                </FormControl>
                <FormDescription>
                  Describe in detail of your AI Companion's initial State.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />

          <div className="w-full flex justify-center ">
            <Button size="lg" disabled={isLoading} className="cursor-pointer">
              {initialData ? "Save Changes" : "Create Companion"}
              <Wand2 className="ml-2 h-4 w-4" />

            </Button>

          </div>


                </form>

            </Form>
        </div>
    );
};