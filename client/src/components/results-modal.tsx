import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  PieChart, 
  Users, 
  Calendar,
  Clock,
  User,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceData: AttendanceResults;
  onBack?: () => void;
}

export interface AttendanceResults {
  classId: number;
  className: string;
  date: string;
  question: string;
  answers: AnswerResult[];
  totalStudents: number;
  respondedStudents: number;
  attendanceRate: number;
  sessionDuration: number; // in minutes
  teacherName: string;
  checkInTimes: Record<string, string>; // student name -> timestamp
  allStudents: string[]; // Complete list of all students in the class
  metadata: {
    themeUsed: string;
    settingsUsed: any;
    startTime: string;
    endTime: string;
  };
}

interface AnswerResult {
  answer: string;
  count: number;
  percentage: number;
  students: string[]; // student names
  color: string;
}

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export default function ResultsModal({
  isOpen,
  onClose,
  attendanceData,
  onBack
}: ResultsModalProps) {
  const [hoveredSlice, setHoveredSlice] = useState<AnswerResult | null>(null);

  const totalResponses = attendanceData.answers.reduce((sum, answer) => sum + answer.count, 0);
  const responseRate = (attendanceData.respondedStudents / attendanceData.totalStudents) * 100;

  const handleExport = (exportFormat: 'pdf' | 'csv') => {
    const timestamp = format(new Date(attendanceData.date), 'yyyy-MM-dd');
    const filename = `Attendance_Results_${timestamp}_${attendanceData.className}.${exportFormat}`;
    
    if (exportFormat === 'csv') {
      exportToCSV(filename);
    } else {
      exportToPDF(filename);
    }
  };

  const exportToCSV = (filename: string) => {
    // Create comprehensive attendance report with times
    let csv = 'Student Name,Status,Check-in Time,Answer,Class,Date,Question\n';
    
    // Get all students from the class with safety check
    const respondedStudents = new Set(Object.keys(attendanceData.checkInTimes));
    const allStudents = attendanceData.allStudents || [];
    const absentStudents = allStudents.filter(student => !respondedStudents.has(student));
    
    // Add responded students with their data
    attendanceData.answers.forEach(answer => {
      answer.students.forEach(student => {
        const checkInTime = attendanceData.checkInTimes[student] || 'N/A';
        csv += `"${student}","Present","${checkInTime}","${answer.answer}","${attendanceData.className}","${format(new Date(attendanceData.date), 'yyyy-MM-dd')}","${attendanceData.question}"\n`;
      });
    });
    
    // Add absent students
    absentStudents.forEach(student => {
      csv += `"${student}","Absent","N/A","N/A","${attendanceData.className}","${format(new Date(attendanceData.date), 'yyyy-MM-dd')}","${attendanceData.question}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (filename: string) => {
    // Enhanced PDF generation focusing on attendance times
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Get all students and their status with safety check
      const respondedStudents = new Set(Object.keys(attendanceData.checkInTimes));
      const allStudents = attendanceData.allStudents || [];
      const absentStudents = allStudents.filter(student => !respondedStudents.has(student));
      
      printWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .stats { display: flex; justify-content: space-around; margin: 20px 0; }
              .stat { text-align: center; }
              .attendance-section { margin: 30px 0; }
              .section-title { font-size: 18px; font-weight: bold; margin: 15px 0; color: #333; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .present { background-color: #d4edda; }
              .absent { background-color: #f8d7da; }
              .summary { background-color: #e2e3e5; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📊 Attendance Report</h1>
              <p><strong>Class:</strong> ${attendanceData.className}</p>
              <p><strong>Date:</strong> ${format(new Date(attendanceData.date), 'PPP')}</p>
              <p><strong>Question:</strong> ${attendanceData.question}</p>
              <p><strong>Teacher:</strong> ${attendanceData.teacherName}</p>
            </div>
            
            <div class="summary">
              <h3>📈 Session Summary</h3>
              <div class="stats">
                <div class="stat">
                  <h3>${attendanceData.totalStudents}</h3>
                  <p>Total Students</p>
                </div>
                <div class="stat">
                  <h3>${attendanceData.respondedStudents}</h3>
                  <p>Present</p>
                </div>
                <div class="stat">
                  <h3>${absentStudents.length}</h3>
                  <p>Absent</p>
                </div>
                <div class="stat">
                  <h3>${responseRate.toFixed(1)}%</h3>
                  <p>Attendance Rate</p>
                </div>
              </div>
            </div>
            
            <div class="attendance-section">
              <div class="section-title">✅ Present Students (${attendanceData.respondedStudents})</div>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Check-in Time</th>
                    <th>Answer</th>
                  </tr>
                </thead>
                <tbody>
                  ${attendanceData.answers.map(answer => 
                    answer.students.map(student => {
                      const checkInTime = attendanceData.checkInTimes[student] || 'N/A';
                      return `
                        <tr class="present">
                          <td>${student}</td>
                          <td><strong>${checkInTime}</strong></td>
                          <td>${answer.answer}</td>
                        </tr>
                      `;
                    }).join('')
                  ).join('')}
                </tbody>
              </table>
            </div>
            
            ${absentStudents.length > 0 ? `
            <div class="attendance-section">
              <div class="section-title">❌ Absent Students (${absentStudents.length})</div>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${absentStudents.map(student => `
                    <tr class="absent">
                      <td>${student}</td>
                      <td><strong>Absent</strong></td>
                      <td>No response recorded</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}
            
            <div class="attendance-section">
              <div class="section-title">📊 Answer Distribution</div>
              <table>
                <thead>
                  <tr>
                    <th>Answer</th>
                    <th>Count</th>
                    <th>Percentage</th>
                    <th>Students</th>
                  </tr>
                </thead>
                <tbody>
                  ${attendanceData.answers.map(answer => `
                    <tr>
                      <td>${answer.answer}</td>
                      <td>${answer.count}</td>
                      <td>${answer.percentage.toFixed(1)}%</td>
                      <td>${answer.students.join(', ')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="summary">
              <p><strong>Session Duration:</strong> ${attendanceData.sessionDuration} minutes</p>
              <p><strong>Theme Used:</strong> ${attendanceData.metadata.themeUsed}</p>
              <p><strong>Start Time:</strong> ${attendanceData.metadata.startTime}</p>
              <p><strong>End Time:</strong> ${attendanceData.metadata.endTime}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onBack && (
                <Button onClick={onBack} variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <DialogTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Attendance Results
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => handleExport('pdf')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {attendanceData.totalStudents}
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
                    <p className="text-sm font-medium text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {attendanceData.respondedStudents}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {attendanceData.totalStudents - attendanceData.respondedStudents}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Duration</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {attendanceData.sessionDuration}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ATTENDANCE TIMES - PRIMARY FOCUS */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Clock className="w-5 h-5" />
                📊 Attendance Times & Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Present Students */}
                <div>
                  <h4 className="font-bold text-lg text-green-700 mb-4 flex items-center gap-2">
                    ✅ Present Students ({attendanceData.respondedStudents})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(attendanceData.checkInTimes)
                      .sort(([,a], [,b]) => a.localeCompare(b)) // Sort by check-in time
                      .map(([student, time]) => {
                        const answer = attendanceData.answers.find(a => 
                          a.students.includes(student)
                        )?.answer || 'N/A';
                        return (
                          <div key={student} className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {student.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-green-800">{student}</p>
                                <p className="text-sm text-green-600">Answered: {answer}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-700 text-lg">{time}</p>
                              <p className="text-xs text-green-600">Check-in</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Absent Students */}
                <div>
                  <h4 className="font-bold text-lg text-red-700 mb-4 flex items-center gap-2">
                    ❌ Absent Students ({attendanceData.totalStudents - attendanceData.respondedStudents})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(() => {
                      // Use the complete student list from the class with safety check
                      const respondedStudents = new Set(Object.keys(attendanceData.checkInTimes));
                      const allStudents = attendanceData.allStudents || [];
                      const absentStudents = allStudents.filter(student => !respondedStudents.has(student));
                      
                      return absentStudents.length > 0 ? (
                        absentStudents.map(student => (
                          <div key={student} className="flex items-center justify-between p-3 bg-red-100 rounded-lg border border-red-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {student.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-red-800">{student}</p>
                                <p className="text-sm text-red-600">No response</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-700 text-lg">--:--</p>
                              <p className="text-xs text-red-600">No check-in</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-green-100 rounded-lg border border-green-200 text-center">
                          <p className="text-green-700 font-medium">🎉 All students present!</p>
                          <p className="text-sm text-green-600">100% attendance rate</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question and Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Question of the Day</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {attendanceData.question}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Session Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Class:</strong> {attendanceData.className}</p>
                    <p><strong>Date:</strong> {format(new Date(attendanceData.date), 'PPP')}</p>
                    <p><strong>Teacher:</strong> {attendanceData.teacherName}</p>
                    <p><strong>Theme:</strong> {attendanceData.metadata.themeUsed}</p>
                    <p><strong>Start Time:</strong> {attendanceData.metadata.startTime}</p>
                    <p><strong>End Time:</strong> {attendanceData.metadata.endTime}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Answer Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Pie Chart */}
                <div className="flex-1">
                  <div className="relative w-64 h-64 mx-auto">
                    <svg width="256" height="256" viewBox="0 0 256 256" className="transform -rotate-90">
                      {attendanceData.answers.map((answer, index) => {
                        const previousAnswers = attendanceData.answers.slice(0, index);
                        const previousTotal = previousAnswers.reduce((sum, a) => sum + a.count, 0);
                        const startAngle = (previousTotal / totalResponses) * 360;
                        const endAngle = ((previousTotal + answer.count) / totalResponses) * 360;
                        
                        const startRadians = (startAngle * Math.PI) / 180;
                        const endRadians = (endAngle * Math.PI) / 180;
                        
                        const centerX = 128;
                        const centerY = 128;
                        const radius = 100;
                        
                        const startX = centerX + radius * Math.cos(startRadians);
                        const startY = centerY + radius * Math.sin(startRadians);
                        const endX = centerX + radius * Math.cos(endRadians);
                        const endY = centerY + radius * Math.sin(endRadians);
                        
                        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                        
                        const pathData = [
                          `M ${centerX} ${centerY}`,
                          `L ${startX} ${startY}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                          'Z'
                        ].join(' ');

                        return (
                          <TooltipProvider key={answer.answer}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <path
                                  d={pathData}
                                  fill={answer.color}
                                  className="cursor-pointer transition-all duration-200 hover:opacity-80"
                                  onMouseEnter={() => setHoveredSlice(answer)}
                                  onMouseLeave={() => setHoveredSlice(null)}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="p-2">
                                  <p className="font-medium">{answer.answer}</p>
                                  <p className="text-sm">{answer.count} students ({answer.percentage.toFixed(1)}%)</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {answer.students.join(', ')}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-4">Answer Breakdown</h4>
                  <div className="space-y-3">
                    {attendanceData.answers.map((answer, index) => (
                      <div
                        key={answer.answer}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                          hoveredSlice?.answer === answer.answer
                            ? 'border-gray-400 bg-gray-50'
                            : 'border-gray-200'
                        }`}
                        onMouseEnter={() => setHoveredSlice(answer)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: answer.color }}
                          />
                          <div>
                            <p className="font-medium">{answer.answer}</p>
                            <p className="text-sm text-gray-600">
                              {answer.students.join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{answer.count}</p>
                          <p className="text-sm text-gray-600">{answer.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 