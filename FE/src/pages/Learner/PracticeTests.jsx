import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Trophy,
  HelpCircle,
  Activity,
  RotateCcw,
  Play,
  Filter,
  TrendingUp,
  CloudRain,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// --- Dữ liệu Các Bài Kiểm tra ---
const PRACTICE_TOPICS = [
  {
    id: "traffic-signs-signals",
    difficulty: "EASY",
    questions: 25,
    selectedCategories: ["TRAFFIC_SIGNS"],
  },
  {
    id: "right-of-way-rules",
    difficulty: "MEDIUM",
    questions: 20,
    selectedCategories: ["REGULATIONS", "TRAFFIC_CULTURE"],
  },
  {
    id: "speed-limits-zones",
    difficulty: "EASY",
    questions: 15,
    selectedCategories: ["REGULATIONS"],
  },
  {
    id: "parking-regulations",
    difficulty: "MEDIUM",
    questions: 30,
    selectedCategories: ["REGULATIONS", "DRIVING_TECHNIQUE"],
  },
  {
    id: "emergency-procedures",
    difficulty: "HARD",
    questions: 15,
    selectedCategories: ["SITUATION_HANDLING"],
    decoIcon: <Shield />,
  },
  {
    id: "night-weather-driving",
    difficulty: "HARD",
    questions: 20,
    selectedCategories: ["DRIVING_TECHNIQUE", "SITUATION_HANDLING"],
    decoIcon: <CloudRain />,
  },
];

const CATEGORY_LABELS = {
  REGULATIONS: "Khái niệm & quy tắc",
  TRAFFIC_CULTURE: "Văn hóa giao thông",
  DRIVING_TECHNIQUE: "Kỹ thuật lái xe",
  VEHICLE_REPAIR: "Cấu tạo & sửa chữa",
  TRAFFIC_SIGNS: "Biển báo đường bộ",
  SITUATION_HANDLING: "Sa hình & tình huống",
};

const LEGACY_TOPIC_TITLES = {
  "traffic-signs-signals": "Traffic Signs & Signals",
  "right-of-way-rules": "Right of Way Rules",
  "speed-limits-zones": "Speed Limits & Zones",
  "parking-regulations": "Parking Regulations",
  "emergency-procedures": "Emergency Procedures",
  "night-weather-driving": "Night & Weather Driving",
};

const buildTopicTitle = (topic, index) => {
  const labels = (topic.selectedCategories || [])
    .map((category) => CATEGORY_LABELS[category] || category)
    .filter(Boolean);

  if (!labels.length) {
    return `Đề ${index + 1} - ${topic.questions} câu`;
  }

  const shortLabel = labels.slice(0, 2).join(" + ");
  return `Đề ${index + 1}: ${shortLabel}`;
};

const PRACTICE_RESULTS_STORAGE_KEY = "practiceTopicResults";

const readPracticeResults = () => {
  try {
    const raw = localStorage.getItem(PRACTICE_RESULTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const getQuizConfigForTopic = (topic) => ({
  topicId: topic.id,
  licenseType: "A1",
  questionCount: topic.questions,
  examName: topic.title,
  generationMode: "random",
  examsSource: "exam_250",
  selectedCategories: Array.isArray(topic.selectedCategories)
    ? topic.selectedCategories
    : [],
});

const getDifficultyStyles = (level) => {
  switch (level) {
    case "EASY":
      return "bg-green-50 text-green-700 border-green-100";
    case "MEDIUM":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "HARD":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-slate-50 text-slate-700";
  }
};

export const PracticeTests = () => {
  const navigate = useNavigate();
  const [storedResults] = useState(() => readPracticeResults());

  const topicsWithResults = useMemo(
    () =>
      PRACTICE_TOPICS.map((topic, index) => {
        const topicTitle = buildTopicTitle(topic, index);
        const result =
          storedResults[topic.id] ||
          storedResults[topicTitle] ||
          storedResults[LEGACY_TOPIC_TITLES[topic.id]] ||
          null;
        const bestScore = Number.isFinite(Number(result?.bestScore))
          ? Number(result.bestScore)
          : null;

        return {
          ...topic,
          title: topicTitle,
          bestScore,
          attempted: bestScore !== null,
          attemptCount: Number(result?.attemptCount || 0),
        };
      }),
    [storedResults],
  );

  const handleStartOrRetake = (topic) => {
    const examConfig = getQuizConfigForTopic(topic);
    sessionStorage.setItem("quizExamConfig", JSON.stringify(examConfig));
    navigate("/learner/quiz", {
      state: { examConfig },
    });
  };

  const statsSummary = useMemo(() => {
    const attemptedTopics = topicsWithResults.filter(
      (topic) => topic.attempted,
    );
    const testsCompleted = topicsWithResults.reduce(
      (sum, topic) => sum + Number(topic.attemptCount || 0),
      0,
    );

    const averageScore = attemptedTopics.length
      ? Math.round(
          attemptedTopics.reduce((sum, topic) => {
            const result =
              storedResults[topic.id] ||
              storedResults[topic.title] ||
              storedResults[LEGACY_TOPIC_TITLES[topic.id]] ||
              null;
            const score = Number(result?.latestScore ?? topic.bestScore ?? 0);
            return sum + (Number.isFinite(score) ? score : 0);
          }, 0) / attemptedTopics.length,
        )
      : 0;

    const questionsAnswered = topicsWithResults.reduce((sum, topic) => {
      const result =
        storedResults[topic.id] ||
        storedResults[topic.title] ||
        storedResults[LEGACY_TOPIC_TITLES[topic.id]] ||
        null;
      const attemptCount = Number(result?.attemptCount || 0);
      const totalQuestions = Number(
        result?.totalQuestions || topic.questions || 0,
      );
      return sum + attemptCount * totalQuestions;
    }, 0);

    const readinessScore =
      averageScore >= 80 ? "High" : averageScore >= 60 ? "Medium" : "Low";

    return [
      {
        label: "Tests Completed",
        value: String(testsCompleted),
        icon: <FileText size={20} />,
        badge: "OVERALL",
        color: "bg-slate-100",
      },
      {
        label: "Average Score",
        value: `${averageScore}%`,
        icon: <Trophy size={20} />,
        color: "bg-blue-100",
        highlight: true,
      },
      {
        label: "Questions Answered",
        value: String(questionsAnswered),
        icon: <HelpCircle size={20} />,
        color: "bg-slate-100",
      },
      {
        label: "Readiness Score",
        value: readinessScore,
        icon: <Activity size={20} />,
        color: "bg-slate-100",
        textColor: "text-blue-600",
      },
    ];
  }, [topicsWithResults, storedResults]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans">
      <main className="flex-1 w-full max-w-screen-2xl mx-auto p-8 space-y-10">
        {/* 1. Header */}
        <header className="space-y-1">
          <h1 className="text-4xl font-extrabold text-[#141b2b] tracking-tight font-manrope">
            Practice Tests
          </h1>
          <p className="text-lg text-slate-500">
            Choose a topic and test your knowledge
          </p>
        </header>

        {/* 2. Overall Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsSummary.map((stat, idx) => (
            <Card
              key={idx}
              className={`border-none shadow-sm transition-all hover:shadow-md ${stat.highlight ? "border-l-4 border-l-blue-600" : ""}`}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${stat.color} text-blue-700`}>
                    {stat.icon}
                  </div>
                  {stat.badge && (
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest">
                      {stat.badge}
                    </span>
                  )}
                  {stat.trend && (
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-600 border-none gap-1 font-bold"
                    >
                      <TrendingUp size={12} /> {stat.trend}
                    </Badge>
                  )}
                </div>
                <div>
                  <h3
                    className={`text-3xl font-bold ${stat.textColor || "text-[#141b2b]"}`}
                  >
                    {stat.value}
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* 3. Filter Row */}
        <section className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-[#141b2b]">
            Choose a Practice Test
          </h2>
          <div className="flex gap-2">
            <Button className="rounded-xl bg-[#e1e8fd] text-blue-700 hover:bg-blue-100 font-bold px-6 border-none">
              All Topics
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl text-slate-500 font-bold px-6 gap-2"
            >
              <Filter size={16} /> Filter
            </Button>
          </div>
        </section>

        {/* 4. Topics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topicsWithResults.map((topic, idx) => (
            <Card
              key={idx}
              className="border-none shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => handleStartOrRetake(topic)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleStartOrRetake(topic);
                }
              }}
            >
              <CardContent className="p-8 flex flex-col h-full min-h-68.5">
                {/* Topic Header */}
                <div className="flex justify-between items-start mb-6">
                  <Badge
                    className={`${getDifficultyStyles(topic.difficulty)} border rounded-full px-3 py-1 font-bold tracking-widest text-[10px]`}
                  >
                    {topic.difficulty}
                  </Badge>
                  {topic.attempted ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-blue-600">
                        {topic.bestScore}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        best
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-slate-400 italic">
                      Not attempted
                    </span>
                  )}
                </div>

                {/* Topic Info */}
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-bold text-[#141b2b] leading-tight">
                    {topic.title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500">
                    <HelpCircle size={14} />
                    <span className="text-sm font-medium">
                      {topic.questions} questions
                    </span>
                  </div>
                </div>

                {/* Actions & Progress */}
                <div className="mt-8 space-y-4">
                  <Progress
                    value={topic.bestScore || 0}
                    className="h-1.5 bg-slate-100"
                    indicatorClassName={
                      topic.difficulty === "HARD" ? "bg-red-500" : "bg-blue-600"
                    }
                  />
                  {topic.attempted ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl bg-[#e1e8fd] border-none text-blue-700 font-bold gap-2 hover:bg-blue-200"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStartOrRetake(topic);
                      }}
                    >
                      <RotateCcw size={16} /> Retake
                    </Button>
                  ) : (
                    <Button
                      className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStartOrRetake(topic);
                      }}
                    >
                      <Play size={16} fill="currentColor" /> Start Test
                    </Button>
                  )}
                </div>

                {/* Decorative Background Icon for Hard/Unattempted */}
                {topic.decoIcon && (
                  <div className="absolute -top-4 -right-4 text-slate-50 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    {React.cloneElement(topic.decoIcon, { size: 120 })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
};
export default PracticeTests;
