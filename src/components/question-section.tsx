import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./tooltip-button";
import { Mic, Volume2, VolumeX } from "lucide-react";
import { RecordAnswer } from "./record-answer";
import { Badge } from "./ui/badge";

interface QuestionSectionProps {
  questions: { question: string; answer: string }[];
}

export const QuestionSection = ({ questions }: QuestionSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWebCam, setIsWebCam] = useState(false);

  const [currentSpeech, setCurrentSpeech] =
    useState<SpeechSynthesisUtterance | null>(null);

  const handlePlayQuestion = (qst: string) => {
    if (isPlaying && currentSpeech) {
      // stop the speech if already playing
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSpeech(null);
    } else {
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(qst);
        window.speechSynthesis.speak(speech);
        setIsPlaying(true);
        setCurrentSpeech(speech);

        // handle the speech end
        speech.onend = () => {
          setIsPlaying(false);
          setCurrentSpeech(null);
        };
      }
    }
  };

  return (
    <div className="w-full">
      <Tabs
        defaultValue={questions[0]?.question}
        className="w-full"
      >
        <div className="bg-blue-50/60 rounded-lg p-2 mb-6 overflow-hidden">
          <TabsList className="w-full h-auto flex flex-wrap items-center justify-start gap-2 bg-transparent">
            {questions?.map((tab, i) => (
              <TabsTrigger
                className={cn(
                  "text-sm px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:font-medium text-blue-600 h-10"
                )}
                key={tab.question}
                value={tab.question}
              >
                {`Question ${i + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {questions?.map((tab, i) => (
          <TabsContent key={i} value={tab.question} className="space-y-6">
            <div className="bg-blue-50/30 p-5 rounded-lg border border-blue-100 relative">
              <Badge className="absolute -top-2 left-3 bg-blue-100 text-blue-800 border-blue-200 text-xs">
                Question {i + 1}
              </Badge>
              
              <div className="flex items-start justify-between">
                <p className="text-base text-blue-900 tracking-wide leading-relaxed pr-8 mt-1">
                  {tab.question}
                </p>
                
                <TooltipButton
                  content={isPlaying ? "Stop Audio" : "Play Question"}
                  icon={
                    isPlaying ? (
                      <VolumeX className="h-5 w-5 text-blue-700" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-blue-700" />
                    )
                  }
                  buttonClassName="hover:bg-blue-100"
                  onClick={() => handlePlayQuestion(tab.question)}
                />
              </div>
            </div>

            <RecordAnswer
              question={tab}
              isWebCam={isWebCam}
              setIsWebCam={setIsWebCam}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
