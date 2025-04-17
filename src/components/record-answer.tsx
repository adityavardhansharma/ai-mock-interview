/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@clerk/clerk-react";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Video,
  VideoOff,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { chatSession } from "@/scripts";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

// TypeScript interface for browser SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

// Define SpeechRecognition browser compatibility
const SpeechRecognition = typeof window !== 'undefined' ? 
  window.SpeechRecognition || window.webkitSpeechRecognition : null;
const hasSpeechRecognition = !!SpeechRecognition;

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}: RecordAnswerProps) => {
  // Speech recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const [userAnswer, setUserAnswer] = useState("");
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { userId } = useAuth();
  const { interviewId } = useParams();

  // Initialize speech recognition
  useEffect(() => {
    if (hasSpeechRecognition) {
      try {
        // Initialize speech recognition
        const initializeSpeechRecognition = () => {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            console.log("Native speech recognition started");
            setIsRecording(true);
          };

          recognition.onend = () => {
            console.log("Native speech recognition ended");
            setIsRecording(false);
          };

          recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = 0; i < event.results.length; i++) {
              const result = event.results[i];
              
              if (result.isFinal) {
                final += result[0].transcript + ' ';
              } else {
                interim += result[0].transcript;
              }
            }

            if (final) {
              console.log("Final transcript:", final);
              setTranscript(prev => prev + final);
              setUserAnswer(prev => prev + final);
            }

            if (interim) {
              console.log("Interim transcript:", interim);
              setInterimTranscript(interim);
            }
          };

          recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            
            // Handle specific error types
            switch (event.error) {
              case 'network':
                toast.error("Network Error", {
                  description: "Speech recognition encountered a network error. Check your internet connection."
                });
                break;
              case 'not-allowed':
              case 'permission-denied':
                toast.error("Microphone Access Denied", {
                  description: "Please allow microphone access in your browser settings."
                });
                break;
              case 'no-speech':
                toast.info("No Speech Detected", {
                  description: "No speech was detected. Please try speaking again."
                });
                break;
              case 'aborted':
                // User or system aborted, don't show error
                break;
              default:
                toast.error("Speech Recognition Error", {
                  description: `Error: ${event.error}. Please try again.`
                });
            }
            
            setIsRecording(false);
          };

          return recognition;
        };

        // Create and store the recognition instance
        recognitionRef.current = initializeSpeechRecognition();
        console.log("Speech recognition initialized successfully");
        
      } catch (error) {
        console.error("Failed to initialize speech recognition:", error);
        toast.error("Speech Recognition Error", {
          description: "Failed to initialize speech recognition. Please try a different browser."
        });
      }
    } else {
      console.warn("SpeechRecognition is not supported in this browser");
      toast.error("Browser Not Supported", {
        description: "Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari."
      });
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current && isRecording) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error("Error stopping recognition on cleanup:", error);
        }
      }
    };
  }, []);

  // Start the speech recognition
  const startRecording = () => {
    try {
      // Reset state for a new recording
      setTranscript("");
      setInterimTranscript("");
      
      // Create a fresh instance for better reliability
      if (recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        // Copy event handlers
        recognition.onstart = recognitionRef.current.onstart;
        recognition.onend = recognitionRef.current.onend;
        recognition.onresult = recognitionRef.current.onresult;
        recognition.onerror = recognitionRef.current.onerror;
        
        // Replace the reference
        recognitionRef.current = recognition;
        
        // Start recording
        recognition.start();
        
        toast.success("Recording Started", {
          description: "Speak clearly into your microphone"
        });
      } else {
        toast.error("Speech Recognition Unavailable", {
          description: "Could not initialize speech recognition"
        });
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Recording Failed", {
        description: "Could not start speech recognition. Please refresh and try again."
      });
    }
  };

  // Stop the speech recognition
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        console.log("Recording stopped");
        toast.success("Recording Stopped", {
          description: "Processing your answer..."
        });
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
    }
  };

  const recordUserAnswer = async () => {
    try {
      console.log("Record button clicked, current state:", { isRecording });
      
      if (isRecording) {
        console.log("Stopping recording...");
        stopRecording();

        // Only proceed if there's an answer
        if (userAnswer && userAnswer.trim().length > 0) {
          setLoading(true);
          
          // Generate AI result and save answer
          try {
            // AI result
            const aiResult = await generateResult(
                question.question,
                question.answer,
                userAnswer
            );
            
            setAiResult(aiResult);
            
            // Save the answer to Firebase
            const currentQuestion = question.question;
            
            try {
              // Check if the user already answered this question
              const userAnswerQuery = query(
                collection(db, "userAnswers"),
                where("userId", "==", userId),
                where("question", "==", currentQuestion)
              );

              const querySnap = await getDocs(userAnswerQuery);

              // If the answer doesn't exist yet, save it
              if (querySnap.empty) {
                await addDoc(collection(db, "userAnswers"), {
                  mockIdRef: interviewId,
                  question: question.question,
                  correct_ans: question.answer,
                  user_ans: userAnswer,
                  feedback: aiResult.feedback,
                  rating: aiResult.ratings,
                  userId,
                  createdAt: serverTimestamp(),
                });
                
                // Show success toast
                toast.success("Answer Saved", { 
                  description: "Your answer has been saved automatically",
                  duration: 3000
                });
              } else {
                // Answer already exists - update it with new information
                const existingAnswerDoc = querySnap.docs[0];
                try {
                  await updateDoc(doc(db, "userAnswers", existingAnswerDoc.id), {
                    user_ans: userAnswer,
                    feedback: aiResult.feedback,
                    rating: aiResult.ratings,
                    updatedAt: serverTimestamp(),
                  });
                  
                  toast.success("Answer Updated", {
                    description: "Your previous answer has been updated with new recording",
                  });
                } catch (updateError) {
                  console.error("Error updating answer:", updateError);
                  toast.error("Update Failed", {
                    description: "There was a problem updating your answer"
                  });
                }
              }
            } catch (dbError) {
              console.error("Database error:", dbError);
              toast.error("Error Saving", {
                description: "There was a problem saving your answer to the database"
              });
            }
          } catch (error) {
            console.error("Error processing answer:", error);
            toast.error("Error Processing", {
              description: "There was a problem processing your answer"
            });
          } finally {
            setLoading(false);
          }
        }
      } else {
        console.log("Starting recording...");
        toast.info("Recording", {
          description: "Microphone access requested. Please allow if prompted."
        });
        
        // Set user answer to empty for a fresh recording
        setUserAnswer("");
        startRecording();
      }
    } catch (error) {
      console.error("Error in recordUserAnswer:", error);
      toast.error("Recording Error", {
        description: "Failed to start/stop recording. Please check microphone permissions."
      });
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    console.log("Raw AI response:", responseText);
    
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(```json|```|`)/g, "");
    
    // Step 3: Try to find JSON-like structure if the response isn't properly formatted
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("JSON parse error:", error);
      console.log("Failed to parse:", cleanText);
      
      // Attempt to extract JSON-like structure using regex
      try {
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0];
          console.log("Extracted JSON structure:", extractedJson);
          return JSON.parse(extractedJson);
        }
      } catch (regexError) {
        console.error("Regex extraction failed:", regexError);
      }
      
      // If all parsing attempts fail, create a default response
      console.warn("Using default response due to parsing failure");
      return {
        ratings: 5,
        feedback: "The system was unable to generate specific feedback. Please review the model answer to improve your response."
      };
    }
  };

  const generateResult = async (
      qst: string,
      qstAns: string,
      userAns: string
  ): Promise<AIResponse> => {
    const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
      Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
    `;

    try {
      const aiResult = await chatSession.sendMessage(prompt);

      const parsedResult: AIResponse = cleanJsonResponse(
          aiResult.response.text()
      );
      return parsedResult;
    } catch (error) {
      console.log(error);
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    }
  };

  const recordNewAnswer = () => {
    // Clear all text and state
    setUserAnswer("");
    setTranscript("");
    setInterimTranscript("");
    setAiResult(null);
    
    // Stop any ongoing recording
    if (isRecording) {
      stopRecording();
    }
    
    // Short delay to ensure previous recording is fully stopped
    setTimeout(() => {
      try {
        console.log("Starting new recording session");
        toast.info("New Recording", {
          description: "Starting a new recording session"
        });
        
        startRecording();
      } catch (error) {
        console.error("Failed to restart recording:", error);
        toast.error("Recording Failed", {
          description: "Could not start recording. Please try again."
        });
      }
    }, 1000); // Increased delay for better reliability
  };

  // Debug logging for recording state changes
  useEffect(() => {
    console.log("Recording state changed:", isRecording);
  }, [isRecording]);

  return (
    <div className="flex flex-col gap-6">
      {!userAnswer ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={recordUserAnswer}
                className={`flex items-center gap-2 py-2 px-4 rounded-md text-white ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-600 hover:bg-blue-700"
                } transition-colors duration-200 shadow-sm`}
              >
                {isRecording ? (
                  <>
                    <CircleStop className="h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Record Answer
                  </>
                )}
              </button>

              <button
                onClick={() => setIsWebCam(!isWebCam)}
                className="flex items-center gap-2 p-2 rounded-md text-blue-700 hover:bg-blue-50 border border-blue-200"
              >
                {isWebCam ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Webcam container */}
          {isWebCam && (
            <div className="flex justify-center items-center">
              <div className="w-full max-w-md aspect-video rounded-lg overflow-hidden border border-blue-100 shadow-sm bg-blue-50/30">
                <WebCam
                  audio={false}
                  width={"100%"}
                  height={"100%"}
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Realtime transcription */}
          {isRecording && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-blue-800">
                Your Answer (Real-time):
              </h3>
              <div className="p-4 bg-blue-50/50 rounded-md border border-blue-100 min-h-20">
                <p className="text-blue-700 whitespace-pre-line">
                  {transcript}
                  <span className="text-blue-400">{interimTranscript}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-blue-800">Your Answer:</h3>
            <div className="flex items-center gap-2">
              <TooltipButton
                content="Record New Answer"
                buttonClassName="hover:bg-blue-50 text-blue-700"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={recordNewAnswer}
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-md border border-blue-100 min-h-32">
            <p className="text-blue-700 whitespace-pre-line">{userAnswer}</p>
          </div>

          {loading ? (
            <div className="w-full flex items-center justify-center p-4">
              <Loader className="animate-spin h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-700 ml-2">Saving your answer...</p>
            </div>
          ) : (
            <p className="text-sm text-blue-600 italic text-center my-2">
              Answer saved successfully! ✓ <br />
              To see detailed feedback for all questions, click "End Interview" when you've completed all answers.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
