/* eslint-disable @typescript-eslint/no-unused-vars */
import { Interview } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Lightbulb, BrainCircuit, ChevronDown, ChevronUp } from "lucide-react";
import { QuestionSection } from "@/components/question-section";

export const MockInterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const fetchInterview = async () => {
      if (interviewId) {
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
          setIsLoading(false);
        }
      }
    };

    fetchInterview();
  }, [interviewId, navigate]);

  useEffect(() => {
    if (!interviewId) {
      navigate("/generate", { replace: true });
    }
  }, [interviewId, navigate]);

  const handleEndInterview = () => {
    if (interviewId) {
      navigate(`/generate/feedback/${interviewId}`);
    }
  };

  if (isLoading) {
    return <LoaderPage className="w-full h-screen" />;
  }

  if (!interview) {
    return null;
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-blue-50/30">
      {/* Header with breadcrumb */}
      <div className="w-full bg-white border-b border-blue-100 shadow-sm px-4 py-4">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <CustomBreadCrumb
            breadCrumbPage="Interview"
            breadCrumpItems={[
              { label: "Mock Interviews", link: "/generate" },
              {
                label: interview.position,
                link: `/generate/interview/${interview.id}`,
              },
            ]}
          />
          
          <Button 
            variant="default" 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            onClick={handleEndInterview}
          >
            <ClipboardCheck className="h-4 w-4" />
            End Interview
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow w-full pt-8 px-6">
        <div className="max-w-screen-2xl mx-auto">
          {/* Title & description */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-2.5 rounded-full">
              <BrainCircuit className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">{interview.position} Interview</h1>
              <p className="text-blue-600 text-sm">Answer the questions as if you were in a real interview setting</p>
            </div>
          </div>
          
          {/* Collapsible Information Alert */}
          <Alert className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center">
                    <AlertTitle className="text-blue-800 font-semibold">
                      How to Complete the Interview
                    </AlertTitle>
                  </div>
                  
                  {showInfo && (
                    <AlertDescription className="text-sm text-blue-700 mt-2 leading-relaxed">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Press "Record Answer" to begin answering each question</li>
                        <li>Speak clearly when providing your answers</li>
                        <li>Use the audio button to hear the question read aloud if needed</li>
                        <li>Click "End Interview" when you've completed all questions</li>
                      </ul>
                      <p className="mt-3">
                        <strong className="text-blue-800">Note:</strong>{" "}
                        <span className="font-medium text-blue-900">Your video is never recorded.</span>{" "}
                        You can disable the webcam anytime if preferred.
                      </p>
                    </AlertDescription>
                  )}
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-auto text-blue-600 hover:bg-blue-100"
                onClick={() => setShowInfo(!showInfo)}
              >
                {showInfo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
          </Alert>

          <div className="bg-white border border-blue-100 rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-blue-100 bg-blue-50/50 px-6 py-4">
              <h2 className="text-blue-900 font-medium">Interview Questions</h2>
            </div>
            <div className="p-6">
              <QuestionSection questions={interview.questions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
