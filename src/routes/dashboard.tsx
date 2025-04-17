import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { useAuth, useUser } from "@clerk/clerk-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { 
  CalendarClock, 
  FolderPlus,
  Layers, 
  ListChecks, 
  Plus, 
  Settings, 
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Dashboard = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();
  const { user } = useUser();
  
  // Get the user's first name or full name if available
  const userName = user?.firstName || user?.fullName || "there";

  useEffect(() => {
    setLoading(true);
    const interviewQuery = query(
      collection(db, "interviews"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      interviewQuery,
      (snapshot) => {
        const interviewList: Interview[] = snapshot.docs.map((doc) => {
          const id = doc.id;
          return {
            id,
            ...doc.data(),
          };
        }) as Interview[];
        setInterviews(interviewList);
        setLoading(false);
      },
      (error) => {
        console.log("Error on fetching : ", error);
        toast.error("Error", {
          description: "Something went wrong. Try again later.",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="flex flex-col min-h-screen bg-blue-50/30">
      <Container>
        {/* Welcome Section */}
        <div className="mt-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
                Welcome, {userName}! 👋
              </h1>
              <p className="text-blue-700/70 mt-1">
                Create and practice with AI-powered mock interviews
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="bg-white border-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700/70">Total Interviews</p>
                    <p className="text-2xl font-bold text-blue-900">{interviews.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CalendarClock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700/70">Recent Activity</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {interviews.length > 0 ? "Active" : "None"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Interview Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-blue-900">
              Your Mock Interviews
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[180px] rounded-lg" />
              ))}
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviews.map((interview) => (
                <Card key={interview.id} className="bg-white border-blue-100 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-blue-900">{interview.position}</CardTitle>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        {interview.level}
                      </Badge>
                    </div>
                    <CardDescription className="text-blue-700/70">
                      {interview.company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-2 text-sm text-blue-700/80 mb-2">
                      <ListChecks className="h-4 w-4" />
                      <span>{interview.questions?.length || 0} Questions</span>
                    </div>
                    <p className="text-sm text-blue-700/70 line-clamp-2">{interview.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Link to={`/generate/feedback/${interview.id}`}>
                      <Button variant="outline" size="sm" className="text-blue-700 border-blue-200">
                        <Sparkles className="mr-1 h-4 w-4" />
                        Results
                      </Button>
                    </Link>
                    <Link to={`/generate/interview/${interview.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Start
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
              
              <Link to="/generate/create" className="block h-full">
                <Card className="border-dashed border-2 border-blue-200 bg-transparent hover:bg-blue-50/50 transition-colors h-full flex flex-col items-center justify-center cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <FolderPlus className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="font-medium text-blue-700">Create New Interview</p>
                    <p className="text-sm text-blue-600/70 text-center mt-2">
                      Add a new mock interview to practice
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ) : (
            <Card className="bg-white border-blue-100 py-12">
              <CardContent className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Settings className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">No Interviews Yet</h3>
                <p className="text-center text-blue-700/70 max-w-md mb-6">
                  You haven't created any mock interviews yet. Start by creating your first interview tailored to your job requirements.
                </p>
                <Link to="/generate/create">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Interview
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
};
