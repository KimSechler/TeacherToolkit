import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  Gamepad2, 
  HelpCircle, 
  Plus,
  Clock,
  CheckCircle,
  Star,
  Settings
} from "lucide-react";
import { PlanManager } from "@/components/plan-manager";
import { AdminPanel } from "@/components/admin-panel";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  type Stats = {
    totalStudents: number;
    attendanceRate: number;
    totalGames: number;
    totalQuestions: number;
  };
  type Class = { id: number; name: string; grade?: string };
  type Game = { id: number; title: string };

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const { data: recentGames = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const userName = (user as User)?.firstName || "Teacher";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {getGreeting()}, {userName}! 👋
                </h1>
                <p className="text-gray-600 mt-1">Ready to make learning fun today?</p>
              </div>
              <div className="flex space-x-3">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Class
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Create Game
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {statsLoading ? "..." : stats?.totalStudents || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {statsLoading ? "..." : `${stats?.attendanceRate || 0}%`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Games Created</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {statsLoading ? "..." : stats?.totalGames || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Question Bank</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {statsLoading ? "..." : stats?.totalQuestions || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Classes */}
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Today's Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : classes && classes.length > 0 ? (
                  <div className="space-y-3">
                    {classes.slice(0, 3).map((classItem: any) => (
                      <div key={classItem.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {classItem.grade || "A"}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-800">{classItem.name}</p>
                          <p className="text-xs text-gray-600">
                            {classItem.grade ? `Grade ${classItem.grade}` : "No grade set"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            9:00 AM
                          </Badge>
                          <Button size="sm" variant="outline">
                            Take Attendance
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No classes found</p>
                    <Button className="mt-4" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Class
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Take Attendance
                </Button>
                <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Create Game
                </Button>
                <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Questions
                </Button>
                <Button className="w-full justify-start bg-amber-600 hover:bg-amber-700">
                  <Star className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Games */}
          <Card className="mt-6 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Recent Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gamesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : recentGames && recentGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentGames.slice(0, 3).map((game: any) => (
                    <div key={game.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-800">{game.title}</h3>
                        <Badge variant="secondary">{game.template}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{game.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{game.theme}</Badge>
                        <Button size="sm" variant="outline">Deploy</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gamepad2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No games created yet</p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Game
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Management */}
          <Card className="mt-6 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Plan & Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlanManager />
            </CardContent>
          </Card>

          {/* Admin Panel - Only visible to admin users */}
          {user?.email === 'andrewjstoy@gmail.com' && (
            <Card className="mt-6 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminPanel />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
