/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Camera, Lightbulb, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import WebCam from "react-webcam";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const MockLoadPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebCamEnabled, setIsWebCamEnabled] = useState(false);
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

  if (isLoading) {
    return <LoaderPage className="w-full h-screen" />;
  }

  if (!interviewId || !interview) {
    navigate("/generate", { replace: true });
    return null;
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-blue-50/30">
      {/* Header section with breadcrumb and title */}
      <div className="w-full bg-white border-b border-blue-100 shadow-sm px-4 py-4">
        <div className="max-w-screen-2xl mx-auto">
          <CustomBreadCrumb
            breadCrumbPage={interview.position}
            breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
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
              <h1 className="text-2xl font-bold text-blue-900">{interview.position}</h1>
              <p className="text-blue-600 text-sm">Prepare for your interview with realistic questions</p>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side - interview details */}
            <div className="w-full lg:w-1/2">
              <Card className="border-blue-100 shadow-sm bg-white overflow-hidden mb-6">
                <CardHeader className="border-b border-blue-50 bg-blue-50/50 pb-3">
                  <CardTitle className="text-lg text-blue-900">Interview Details</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">Description</p>
                    <p className="text-sm text-blue-700">{interview.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">Experience Level</p>
                    <p className="text-sm text-blue-700">{interview.experience} years</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {interview.techStack.split(",").map((tech, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {tech.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">Number of Questions</p>
                    <p className="text-sm text-blue-700">{interview.questions?.length || 0} questions</p>
                  </div>
                </CardContent>
              </Card>
              
              <Alert className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center">
                        <AlertTitle className="text-blue-800 font-semibold">
                          Important Information
                        </AlertTitle>
                      </div>
                      
                      {showInfo && (
                        <AlertDescription className="text-sm text-blue-700 mt-1">
                          Enable your webcam and microphone to start the AI-generated
                          mock interview. You'll receive a personalized report based on your responses.
                          <br /><br />
                          <span className="font-medium text-blue-800">Note:</span> Your video is <strong className="text-blue-900">never recorded</strong>. 
                          You can disable your webcam at any time.
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
            </div>
            
            {/* Right side - webcam */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white border border-blue-100 p-6 rounded-lg shadow-sm">
                {isWebCamEnabled ? (
                  <div className="aspect-video rounded-md overflow-hidden">
                    <WebCam
                      onUserMedia={() => setIsWebCamEnabled(true)}
                      onUserMediaError={() => setIsWebCamEnabled(false)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center bg-blue-50/50 rounded-md border border-blue-100">
                    <Camera className="h-16 w-16 text-blue-300 mb-3" />
                    <p className="text-blue-700 font-medium">Webcam is disabled</p>
                    <p className="text-blue-600/70 text-sm mt-1">Enable to test your camera before starting</p>
                  </div>
                )}
                
                <div className="flex items-center justify-end gap-4 mt-8">
                  <Button 
                    onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {isWebCamEnabled ? "Disable Camera" : "Enable Camera"}
                  </Button>
                  
                  <Link to={`/generate/interview/${interviewId}/start`}>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Interview
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
