import { FormMockInterview } from "@/components/form-mock-interview";
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";

export const CreateEditPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      if (interviewId) {
        setLoading(true);
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            setInterview({
              id: interviewDoc.id,
              ...interviewDoc.data(),
            } as Interview);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInterview();
  }, [interviewId]);

  if (loading) {
    return <LoaderPage className="h-[70vh]" />;
  }

  return (
    <div className="min-h-[calc(100vh-150px)] w-full bg-white pb-16">
      <div className="w-full max-w-6xl mx-auto px-4 pt-8">
        <FormMockInterview initialData={interview} />
      </div>
    </div>
  );
};
