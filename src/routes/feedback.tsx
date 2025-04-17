import { db } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { InterviewPin } from "@/components/pin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Award, BrainCircuit, Check, ClipboardList, MessageSquare, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Feedback = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [activeFeed, setActiveFeed] = useState("");
  const { userId } = useAuth();
  const navigate = useNavigate();

  if (!interviewId) {
    navigate("/generate", { replace: true });
  }
  useEffect(() => {
    if (interviewId) {
      const fetchInterview = async () => {
        if (interviewId) {
          try {
            const interviewDoc = await getDoc(
              doc(db, "interviews", interviewId)
            );
            if (interviewDoc.exists()) {
              setInterview({
                id: interviewDoc.id,
                ...interviewDoc.data(),
              } as Interview);
            }
          } catch (error) {
            console.log(error);
          }
        }
      };

      const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
          console.log("Fetching feedback for interviewId:", interviewId, "and userId:", userId);
          
          const querSanpRef = query(
            collection(db, "userAnswers"),
            where("userId", "==", userId),
            where("mockIdRef", "==", interviewId)
          );

          const querySnap = await getDocs(querSanpRef);
          console.log("Query returned", querySnap.size, "documents");

          const interviewData: UserAnswer[] = querySnap.docs.map((doc) => {
            const data = { id: doc.id, ...doc.data() } as UserAnswer;
            console.log("Feedback document:", data.id, "for question:", data.question.substring(0, 30) + "...");
            return data;
          });

          setFeedbacks(interviewData);
          
          if (interviewData.length === 0) {
            console.warn("No feedback data found for this interview. Check if answers were properly saved.");
          } else {
            console.log("Successfully loaded", interviewData.length, "feedback items");
          }
        } catch (error) {
          console.error("Error fetching feedback:", error);
          toast("Error", {
            description: "Something went wrong loading feedback. Please try again later..",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchInterview();
      fetchFeedbacks();
    }
  }, [interviewId, navigate, userId]);

  //   calculate the ratings out of 10

  const overAllRating = useMemo(() => {
    if (feedbacks.length === 0) return "0.0";

    const totalRatings = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );

    return (totalRatings / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  // Function to determine color based on rating
  const getRatingColor = (rating: number) => {
    if (rating > 7) return "text-green-600";
    if (rating >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  // Function to get card background based on rating
  const getCardBackground = (rating: number) => {
    if (rating > 7) return "bg-green-50 border-green-100";
    if (rating >= 4) return "bg-yellow-50 border-yellow-100";
    return "bg-red-50 border-red-100";
  };

  // Function to get progress bar color based on rating
  const getProgressColor = (rating: number) => {
    if (rating > 7) return "bg-green-600";
    if (rating >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-blue-50/30">
      {/* Header section with breadcrumb */}
      <div className="w-full bg-white border-b border-blue-100 shadow-sm px-4 py-4">
        <div className="max-w-screen-2xl mx-auto">
          <CustomBreadCrumb
            breadCrumbPage={"Feedback"}
            breadCrumpItems={[
              { label: "Mock Interviews", link: "/generate" },
              {
                label: `${interview?.position}`,
                link: `/generate/interview/${interview?.id}`,
              },
            ]}
          />
        </div>
      </div>
      
      <div className="flex-grow w-full pt-8 px-6">
        <div className="max-w-screen-2xl mx-auto">
          {/* Title & description */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-2.5 rounded-full">
              <BrainCircuit className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Interview Feedback Report</h1>
              <p className="text-blue-600 text-sm">Review your performance and insights to improve your interview skills</p>
            </div>
          </div>

          {/* Overall Rating Card */}
          <div className="mb-8">
            <Card className="border-blue-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100 pb-4">
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  <CardTitle className="text-blue-900">Overall Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "text-4xl font-bold", 
                      getRatingColor(parseFloat(overAllRating))
                    )}>
                      {overAllRating}
                      <span className="text-lg text-blue-400">/10</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-blue-600">Overall Rating</span>
                      <div className="w-36 mt-1">
                        <Progress 
                          value={parseFloat(overAllRating)} 
                          max={10}
                          className="h-2" 
                          indicatorClassName={getProgressColor(parseFloat(overAllRating))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-600">Questions</span>
                      <span className="text-xl font-semibold text-blue-700">
                        {feedbacks.length}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-600">Completed</span>
                      <span className="text-xl font-semibold text-blue-700">
                        {feedbacks.length > 0 ? "100%" : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Interview details card */}
          {interview && (
            <Card className="border-blue-100 shadow-sm mb-8">
              <CardHeader className="bg-blue-50/70 border-b border-blue-100 pb-3">
                <div className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
                  <CardTitle className="text-blue-900 text-lg">Interview Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex flex-col md:flex-row gap-6">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-blue-700">Position</p>
                  <p className="text-blue-900">{interview.position}</p>
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-blue-700">Experience Level</p>
                  <p className="text-blue-900">{interview.experience} years</p>
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-blue-700">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {interview.techStack.split(",").map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question Feedback Accordions */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-blue-900">Question Feedback</h2>
            </div>
            
            {feedbacks.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {feedbacks.map((feed) => (
                  <AccordionItem
                    key={feed.id}
                    value={feed.id}
                    className="border border-blue-100 rounded-lg shadow-sm overflow-hidden"
                  >
                    <AccordionTrigger
                      onClick={() => setActiveFeed(feed.id)}
                      className={cn(
                        "px-5 py-4 flex items-center gap-3 text-base rounded-t-lg transition-colors hover:no-underline",
                        activeFeed === feed.id
                          ? "bg-gradient-to-r from-blue-50 to-blue-100"
                          : "hover:bg-blue-50/50"
                      )}
                    >
                      <div className="flex-1 text-left pr-4">
                        <p className="text-blue-800 font-medium">{feed.question}</p>
                      </div>
                      <div className={cn(
                        "px-2.5 py-1 rounded text-sm flex items-center font-medium whitespace-nowrap",
                        feed.rating > 7 ? "bg-green-100 text-green-700" :
                        feed.rating >= 4 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {feed.rating > 7 ? (
                          <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                        ) : feed.rating >= 4 ? (
                          <div className="h-3.5 w-3.5 mr-1.5">•</div>
                        ) : (
                          <ThumbsDown className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        {feed.rating}/10
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 py-6 bg-white space-y-5">
                      <div className="flex items-center mb-2">
                        <Progress 
                          value={feed.rating} 
                          max={10}
                          className="h-2 flex-1" 
                          indicatorClassName={getProgressColor(feed.rating)}
                        />
                        <span className={cn(
                          "ml-3 font-semibold",
                          getRatingColor(feed.rating)
                        )}>
                          {feed.rating}/10
                        </span>
                      </div>

                      {/* Expected Answer */}
                      <Card className={cn("border shadow-sm", feed.rating > 7 ? "border-green-100" : "border-blue-100")}>
                        <CardHeader className="bg-blue-50/50 pb-3 border-b border-blue-100">
                          <CardTitle className="text-blue-800 text-base flex items-center">
                            <Check className="h-4 w-4 mr-2 text-blue-600" />
                            Expected Answer
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <p className="text-blue-700 whitespace-pre-line">{feed.correct_ans}</p>
                        </CardContent>
                      </Card>

                      {/* User Answer */}
                      <Card className={cn(
                        "border shadow-sm", 
                        getCardBackground(feed.rating)
                      )}>
                        <CardHeader className={cn(
                          "pb-3 border-b",
                          feed.rating > 7 ? "bg-green-50/70 border-green-100" : 
                          feed.rating >= 4 ? "bg-yellow-50/70 border-yellow-100" : 
                          "bg-red-50/70 border-red-100"
                        )}>
                          <CardTitle className={cn(
                            "text-base flex items-center",
                            feed.rating > 7 ? "text-green-800" : 
                            feed.rating >= 4 ? "text-yellow-800" : 
                            "text-red-800"
                          )}>
                            <MessageSquare className={cn(
                              "h-4 w-4 mr-2",
                              feed.rating > 7 ? "text-green-600" : 
                              feed.rating >= 4 ? "text-yellow-600" : 
                              "text-red-600"
                            )} />
                            Your Answer
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <p className={cn(
                            "whitespace-pre-line",
                            feed.rating > 7 ? "text-green-700" : 
                            feed.rating >= 4 ? "text-yellow-700" : 
                            "text-red-700"
                          )}>
                            {feed.user_ans}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Feedback */}
                      <Card className="border border-blue-100 shadow-sm">
                        <CardHeader className="bg-blue-50/50 pb-3 border-b border-blue-100">
                          <CardTitle className="text-blue-800 text-base flex items-center">
                            <Award className="h-4 w-4 mr-2 text-blue-600" />
                            AI Feedback
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <p className="text-blue-700 whitespace-pre-line">{feed.feedback}</p>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card className="border-blue-100 shadow-sm p-8 text-center">
                <p className="text-blue-600">No feedback available. Complete your interview to see feedback.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
