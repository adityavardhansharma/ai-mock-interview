import { Sparkles, History, FileText, Star, Zap } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HomePage = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-8 pb-2">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="px-4 py-1 border-blue-300 bg-blue-50 text-blue-700">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Powered By TrailBot
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-blue-900 leading-tight">
              AI <span className="text-blue-600">MOCK</span> INTERVIEW
            </h1>
            
            <p className="text-lg text-blue-700/80 max-w-2xl mx-auto mb-4">
              Prepare for your dream job with AI-powered mock interviews. Get real-time feedback and improve your interview skills.
            </p>
            
            <Link to="/generate">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-md mt-6 mb-3">
                Get Started
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
      
      {/* Features Section - No gap between hero and features */}
      <section className="py-8 pt-2 bg-white">
        <Container>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900">
              Boost Your Interview Confidence
            </h2>
            <p className="text-blue-700/70 mt-2">
              Everything you need to ace your next interview
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <History className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Interview History</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-700/70">
                  Keep track of all your previous mock interviews and review your progress over time.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Customizable</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-700/70">
                  Tailor interviews to your specific job description and role requirements.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Feature 3 */}
            <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Free Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-700/70">
                  Start with 5 free interviews to experience the platform before committing.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Feature 4 */}
            <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Detailed Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-700/70">
                  Receive comprehensive feedback to help you improve and nail your real interviews.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
