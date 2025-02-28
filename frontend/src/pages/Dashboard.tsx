import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
import { DashboardProps } from "@/App";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const Dashboard: React.FC<DashboardProps> = ({ sentimentData }) => {
  console.log("sentimentData:", sentimentData);

  const analysis = sentimentData.analysis;
  console.log("Analysis:", analysis);

  const commentStats = {
    total: analysis?.commentCount || 0,
    agree: analysis?.sentimentBreakdown.agree || 0,
    disagree: analysis?.sentimentBreakdown.disagree || 0,
    neutral: analysis?.sentimentBreakdown.neutral || 0,
  };
  const agreePercentage = (commentStats.agree / commentStats.total) * 100;
  const disagreePercentage = (commentStats.disagree / commentStats.total) * 100;
  const neutralPercentage = (commentStats.neutral / commentStats.total) * 100;

  const allSentimentData = [
    {
      label: "Agree",
      value: parseFloat(agreePercentage.toFixed(2)),
      color: "bg-green-500",
    },
    {
      label: "Disagree",
      value: parseFloat(disagreePercentage.toFixed(2)),
      color: "bg-red-500",
    },
    {
      label: "Neutral",
      value: parseFloat(neutralPercentage.toFixed(2)),
      color: "bg-blue-500",
    },
  ];

  const monthlyDistribution = analysis?.monthlyDistribution || [];
  console.log("Monthly Distribution:", monthlyDistribution);

  const chartData = Object.entries(monthlyDistribution).map(
    ([month, desktop]) => ({
      month,
      desktop,
    })
  );
  console.log("ChartData:", chartData);

  const chartConfig = {
    desktop: {
      label: "Comments",
      color: "#A855F7",
    },
  } satisfies ChartConfig;

  const keywords = analysis?.keywords || [];

  // Calculate max value for chart scaling
  // const maxMonthlyCount = Math.max(...monthlyData.map((item) => item.count));

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
              {allSentimentData.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-200">{item.label}</span>
                    <span className="text-white">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
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
                  <div className="text-gray-200">Agree</div>
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
            2/2025
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 20,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={0}>
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-white "
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
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
