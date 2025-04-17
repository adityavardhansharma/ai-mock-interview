import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Interview } from "@/types";

import { CustomBreadCrumb } from "./custom-bread-crumb";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { BrainCircuit, Loader, Sparkles, Trash2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { chatSession } from "@/scripts";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface FormMockInterviewProps {
  initialData: Interview | null;
}

const formSchema = z.object({
  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must be 100 characters or less"),
  description: z.string().min(10, "Description is required"),
  experience: z.coerce
    .number()
    .min(0, "Experience cannot be empty or negative"),
  techStack: z.string().min(1, "Tech stack must be at least a character"),
});

type FormData = z.infer<typeof formSchema>;

export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userId } = useAuth();

  const title = initialData
    ? initialData.position
    : "Create a new interview";

  const breadCrumpPage = initialData ? initialData?.position : "Create";
  const actions = initialData ? "Save Changes" : "Create Interview";
  const toastMessage = initialData
    ? { title: "Updated!", description: "Changes saved successfully." }
    : { title: "Created!", description: "New mock interview created." };

  const cleanAiResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Extract a JSON array by capturing text between square brackets
    const jsonArrayMatch = cleanText.match(/\[.*\]/s);
    if (jsonArrayMatch) {
      cleanText = jsonArrayMatch[0];
    } else {
      throw new Error("No JSON array found in response");
    }

    // Step 4: Parse the clean JSON text into an array of objects
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateAiResponse = async (data: FormData) => {
    const prompt = `
        As an experienced prompt engineer, generate a JSON array containing 5 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

        [
          { "question": "<Question text>", "answer": "<Answer text>" },
          ...
        ]

        Job Information:
        - Job Position: ${data?.position}
        - Job Description: ${data?.description}
        - Years of Experience Required: ${data?.experience}
        - Tech Stacks: ${data?.techStack}

        The questions should assess skills in ${data?.techStack} development and best practices, problem-solving, and experience handling complex requirements. Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.
        `;

    const aiResult = await chatSession.sendMessage(prompt);
    const cleanedResponse = cleanAiResponse(aiResult.response.text());

    return cleanedResponse;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      if (initialData) {
        // update
        if (isValid) {
          const aiResult = await generateAiResponse(data);

          await updateDoc(doc(db, "interviews", initialData?.id), {
            questions: aiResult,
            ...data,
            updatedAt: serverTimestamp(),
          }).catch((error) => console.log(error));
          toast(toastMessage.title, { description: toastMessage.description });
        }
      } else {
        // create a new mock interview
        if (isValid) {
          const aiResult = await generateAiResponse(data);

          await addDoc(collection(db, "interviews"), {
            ...data,
            userId,
            questions: aiResult,
            createdAt: serverTimestamp(),
          });

          toast(toastMessage.title, { description: toastMessage.description });
        }
      }

      navigate("/generate", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Error", {
        description: `Something went wrong. Please try again later`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack,
      });
    }
  }, [initialData, form]);

  return (
    <div className="w-full space-y-6">
      <CustomBreadCrumb
        breadCrumbPage={breadCrumpPage}
        breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
      />

      <Card className="border-blue-100 shadow-md overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 pb-4">
          <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-200 mb-2">
            <BrainCircuit className="h-3 w-3 mr-1" /> AI-Powered
          </Badge>
          <CardTitle className="text-xl text-blue-900">Interview Details</CardTitle>
          <CardDescription className="text-blue-700">
            Provide details about the position to generate custom interview questions
          </CardDescription>
          
          {initialData && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="absolute top-4 right-4 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm">Delete</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex-col flex items-start justify-start gap-6"
            >
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem className="w-full space-y-3">
                    <div className="w-full flex items-center justify-between">
                      <FormLabel className="text-blue-800 font-medium">Job Role / Position</FormLabel>
                      <FormMessage className="text-sm" />
                    </div>
                    <FormControl>
                      <Input
                        className="h-12 border-blue-200 focus-visible:ring-blue-500"
                        disabled={loading}
                        placeholder="e.g., Full Stack Developer"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full space-y-3">
                    <div className="w-full flex items-center justify-between">
                      <FormLabel className="text-blue-800 font-medium">Job Description</FormLabel>
                      <FormMessage className="text-sm" />
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-32 border-blue-200 focus-visible:ring-blue-500"
                        disabled={loading}
                        placeholder="Describe the job role, responsibilities, and requirements"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem className="w-full space-y-3">
                      <div className="w-full flex items-center justify-between">
                        <FormLabel className="text-blue-800 font-medium">Years of Experience</FormLabel>
                        <FormMessage className="text-sm" />
                      </div>
                      <FormControl>
                        <Input
                          type="number"
                          className="h-12 border-blue-200 focus-visible:ring-blue-500"
                          disabled={loading}
                          placeholder="e.g., 3"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="techStack"
                  render={({ field }) => (
                    <FormItem className="w-full space-y-3">
                      <div className="w-full flex items-center justify-between">
                        <FormLabel className="text-blue-800 font-medium">Tech Stack</FormLabel>
                        <FormMessage className="text-sm" />
                      </div>
                      <FormControl>
                        <Input
                          className="h-12 border-blue-200 focus-visible:ring-blue-500"
                          disabled={loading}
                          placeholder="e.g., React, TypeScript, Node.js"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      {!field.value && null}
                      {field.value && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.split(',').map((tech, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {tech.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full flex items-center justify-end gap-4 mt-4">
                <Button
                  type="reset"
                  variant={"outline"}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  disabled={isSubmitting || loading}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={isSubmitting || !isValid || loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>{actions}</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};
