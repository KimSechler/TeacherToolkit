import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar as CalendarIcon,
  Download,
  FileText,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Clock
} from "lucide-react";
import { format, subDays } from "date-fns";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

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

  type Class = { id: number; name: string; grade?: string };
  type Stats = { totalStudents: number; attendanceRate: number };
  type Game = { id: number; title: string };
  type Question = { id: number; text: string };

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const { data: dashboardStats = { totalStudents: 0, attendanceRate: 0 } } = useQuery<Stats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    retry: false,
  });

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
    retry: false,
  });

  // Mock data for demonstration - in real app would come from API
  const attendanceData = [
    { date: "2024-01-01", present: 28, absent: 2, rate: 93.3 },
    { date: "2024-01-02", present: 29, absent: 1, rate: 96.7 },
    { date: "2024-01-03", present: 27, absent: 3, rate: 90.0 },
    { date: "2024-01-04", present: 30, absent: 0, rate: 100.0 },
    { date: "2024-01-05", present: 28, absent: 2, rate: 93.3 },
  ];

  const gamePerformanceData = [
    { name: "Math Quiz", plays: 45, avgScore: 85, completion: 92 },
    { name: "Science Match", plays: 38, avgScore: 78, completion: 89 },
    { name: "Reading Game", plays: 52, avgScore: 91, completion: 95 },
    { name: "History Quiz", plays: 31, avgScore: 73, completion: 87 },
  ];

  const topStudents = [
    { name: "Emma Johnson", score: 95, games: 12, attendance: 98 },
    { name: "Jake Smith", score: 92, games: 10, attendance: 95 },
    { name: "Sarah Wilson", score: 89, games: 11, attendance: 97 },
    { name: "Michael Brown", score: 87, games: 9, attendance: 92 },
    { name: "Lisa Davis", score: 85, games: 8, attendance: 94 },
  ];

  const exportReport = (type: string) => {
    toast({
      title: "Export Started",
      description: `Generating ${type} report...`,
    });
    // In real app, this would trigger actual export
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
                <p className="text-gray-600">Track student performance and class insights</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => exportReport("PDF")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => exportReport("CSV")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes?.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {dashboardStats?.totalStudents || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {dashboardStats?.attendanceRate || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Games Played</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {games?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg Score</p>
                    <p className="text-2xl font-bold text-gray-800">87%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="attendance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="games">Game Performance</TabsTrigger>
              <TabsTrigger value="students">Student Rankings</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LineChart className="w-5 h-5 mr-2" />
                      Attendance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Attendance chart would render here</p>
                        <p className="text-sm text-gray-500">Integration with charting library needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attendance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">94%</div>
                        <div className="text-sm text-gray-600">Average Rate</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Perfect Days</span>
                          <span className="text-sm font-medium">8/20</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lowest Rate</span>
                          <span className="text-sm font-medium">87%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Highest Rate</span>
                          <span className="text-sm font-medium">100%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Present</th>
                          <th className="text-left p-2">Absent</th>
                          <th className="text-left p-2">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceData.map((record, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{format(new Date(record.date), "MMM dd, yyyy")}</td>
                            <td className="p-2">
                              <Badge variant="outline" className="text-green-600">
                                {record.present}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant="outline" className="text-red-600">
                                {record.absent}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge 
                                variant={record.rate >= 95 ? "default" : "secondary"}
                                className={record.rate >= 95 ? "bg-green-100 text-green-800" : ""}
                              >
                                {record.rate}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="games" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Game Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {gamePerformanceData.map((game, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-2">{game.name}</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Plays</span>
                            <span className="font-medium">{game.plays}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Score</span>
                            <span className="font-medium">{game.avgScore}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completion</span>
                            <span className="font-medium">{game.completion}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Top Performing Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topStudents.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-blue-600">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-sm text-gray-600">Rank #{index + 1}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{student.score}</div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{student.games}</div>
                              <div className="text-xs text-gray-500">Games</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{student.attendance}%</div>
                              <div className="text-xs text-gray-500">Attendance</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-medium text-green-800 mb-2">📈 Attendance Improving</h3>
                        <p className="text-sm text-green-700">
                          Class attendance has increased by 5% this month compared to last month.
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">🎮 Games Popular</h3>
                        <p className="text-sm text-blue-700">
                          Math games are the most played, with 45% higher engagement than other subjects.
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h3 className="font-medium text-purple-800 mb-2">⭐ Top Performers</h3>
                        <p className="text-sm text-purple-700">
                          5 students have maintained 95%+ scores across all activities this month.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border-l-4 border-amber-500 bg-amber-50">
                        <h3 className="font-medium text-amber-800 mb-2">Focus Areas</h3>
                        <p className="text-sm text-amber-700">
                          Consider creating more science games to boost engagement in that subject.
                        </p>
                      </div>
                      <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                        <h3 className="font-medium text-blue-800 mb-2">Question Bank</h3>
                        <p className="text-sm text-blue-700">
                          Add more variety to your Question of the Day to maintain student interest.
                        </p>
                      </div>
                      <div className="p-4 border-l-4 border-green-500 bg-green-50">
                        <h3 className="font-medium text-green-800 mb-2">Best Practices</h3>
                        <p className="text-sm text-green-700">
                          Your current game rotation is working well - keep the variety!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
