import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  // Sample data based on the image
  const sentimentData = [
    { label: "Agree", value: 62.9, color: "bg-green-500" },
    { label: "Disagree", value: 17.1, color: "bg-red-500" },
    { label: "Neutral", value: 20, color: "bg-blue-500" },
  ];

  const commentStats = {
    total: 1035,
    agree: 456,
    disagree: 234,
    neutral: 345,
  };

  const monthlyData = [
    { month: "Jan", count: 120 },
    { month: "Feb", count: 150 },
    { month: "Mar", count: 200 },
    { month: "Apr", count: 180 },
  ];

  const keywords = [
    { word: "awesome", count: 45 },
    { word: "great", count: 38 },
    { word: "interesting", count: 32 },
    { word: "thanks", count: 28 },
    { word: "helpful", count: 25 },
    { word: "amazing", count: 22 },
    { word: "perfect", count: 20 },
    { word: "good", count: 18 },
  ];

  // Calculate max value for chart scaling
  const maxMonthlyCount = Math.max(...monthlyData.map((item) => item.count));

  return (
    <div className="bg-slate-900 text-slate-50 p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Analysis Results</h1>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sentiment Distribution Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Sentiment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sentimentData.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white">{item.value}%</span>
                  </div>
                  <Progress
                    value={item.value}
                    className={`h-2 ${item.color}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comment Statistics Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Comment Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700 p-4 rounded-md">
                  <div className="text-sm text-gray-400">Total Comments</div>
                  <div className="text-3xl font-bold text-white">
                    {commentStats.total.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-500 p-4 rounded-md">
                  <div className="text-gray-400">Agree</div>
                  <div className="text-3xl font-bold text-white">
                    {commentStats.agree}
                  </div>
                </div>
                <div className="bg-red-500 p-4 rounded-md">
                  <div className="text-gray-400">Disagree</div>
                  <div className="text-3xl font-bold text-white">
                    {commentStats.disagree}
                  </div>
                </div>
                <div className="bg-blue-500 p-4 rounded-md">
                  <div className="text-gray-400">Neutral</div>
                  <div className="text-3xl font-bold text-white">
                    {commentStats.neutral}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Distribution Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Monthly Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 relative pt-6">
                {/* Y-axis labels and grid lines */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
                  <div>200</div>
                  <div>150</div>
                  <div>100</div>
                  <div>50</div>
                  <div>0</div>
                </div>

                {/* Grid lines */}
                <div className="absolute left-8 right-0 top-0 h-full flex flex-col justify-between">
                  <div className="border-t border-slate-700 w-full h-0"></div>
                  <div className="border-t border-slate-700 w-full h-0"></div>
                  <div className="border-t border-slate-700 w-full h-0"></div>
                  <div className="border-t border-slate-700 w-full h-0"></div>
                  <div className="border-t border-slate-700 w-full h-0"></div>
                </div>

                {/* Bars */}
                <div className="absolute left-10 right-4 bottom-6 h-52 flex justify-between items-end">
                  {monthlyData.map((item) => {
                    const height = (item.count / maxMonthlyCount) * 100;
                    return (
                      <div
                        key={item.month}
                        className="flex flex-col items-center"
                        style={{ width: "18%" }}
                      >
                        <div
                          className="w-full bg-purple-500 rounded-sm"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="mt-2 text-sm text-white">
                          {item.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Keywords Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Top Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {keywords.map((item) => (
                  <Badge
                    key={item.word}
                    className="bg-slate-700 hover:bg-slate-600 text-white text-sm py-1 px-3"
                  >
                    {item.word}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
