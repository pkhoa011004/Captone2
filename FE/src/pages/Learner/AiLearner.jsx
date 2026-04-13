import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Sparkles,
  Mic,
  SendHorizontal,
  BarChart2,
  Map as MapIcon,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Info,
  Loader,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SUGGESTED_TOPICS = [
  "Traffic Signs",
  "Right of Way",
  "Speed Limits",
  "Parking Rules",
  "Emergency",
  "Vehicle Maintenance",
];

const PAST_CONVERSATIONS = [
  { title: "Navigating roundabouts...", date: "Today, 10:45 AM", active: true },
  { title: "Parallel parking tips", date: "Yesterday", active: false },
  { title: "Hazard perception", date: "Oct 24, 2023", active: false },
];

const QUICK_SUGGESTIONS = [
  "Explain roundabout rules",
  "What are speed limits?",
  "Parking regulations",
  "Emergency procedures",
];

const TOPIC_PROMPTS = {
  "Traffic Signs": "Giải thích giúp tôi các nhóm biển báo giao thông quan trọng và mẹo nhớ nhanh.",
  "Right of Way": "Cho tôi quy tắc nhường đường trong các tình huống thường gặp khi thi bằng lái.",
  "Speed Limits": "Tóm tắt giới hạn tốc độ thường gặp và các lỗi dễ bị mất điểm liên quan tốc độ.",
  "Parking Rules": "Hướng dẫn các quy tắc đỗ xe quan trọng và các lỗi đỗ xe hay gặp trong đề thi.",
  Emergency: "Cho tôi các nguyên tắc xử lý tình huống khẩn cấp khi lái xe máy an toàn.",
  "Vehicle Maintenance": "Những kiểm tra bảo dưỡng xe cơ bản cần nhớ trước khi tham gia giao thông là gì?",
};

// Category code to readable label mapping
const CATEGORY_MAP = {
  REGULATIONS: "Luật và hành vi bị cấm",
  TRAFFIC_SIGNS: "Biển báo giao thông",
  DRIVING_TECHNIQUE: "Kỹ thuật lái xe",
  SITUATION_HANDLING: "Sa hình & tình huống",
  VEHICLE_MAINTENANCE: "Bảo dưỡng xe",
  SAFETY: "An toàn giao thông",
  TRAFFIC_CULTURE: "Văn hóa giao thông",
};

  // Function to compute weak topics from quiz analysis
const computeWeakTopics = (quizAnalysis) => {
  if (!quizAnalysis || !Array.isArray(quizAnalysis.wrongQuestions)) {
    return [];
  }

  const categoryStats = {};

  // Group wrong questions by category
  quizAnalysis.wrongQuestions.forEach((question) => {
    const category = question.category || "UNKNOWN";
    if (!categoryStats[category]) {
      categoryStats[category] = {
        count: 0,
        fatalCount: 0,
        questions: [],
      };
    }
    categoryStats[category].count += 1;
    categoryStats[category].questions.push(question);
    // Assume questions with explanation length > 100 or marked as critical are fatal
    if (question.explanation && question.explanation.length > 100) {
      categoryStats[category].fatalCount += 1;
    }
  });

  // Calculate weighted score (frequency + 2x weight for fatal questions)
  const weakTopics = Object.entries(categoryStats)
    .map(([category, stats]) => {
      const weightedScore = stats.count + stats.fatalCount * 2;
      return {
        category,
        display: CATEGORY_MAP[category] || category,
        errorCount: stats.count,
        fatalCount: stats.fatalCount,
        weightedScore,
        questions: stats.questions,
        priority:
          weightedScore >= 8 ? "Cao" : weightedScore >= 4 ? "Trung" : "Thấp",
      };
    })
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, 5); // Top 5 weak topics

  console.log("📊 Weak Topics Computed:", weakTopics);
  return weakTopics;
};

export const AiLearner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const autoAnalysisRanRef = useRef(false);
  const learnerName = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        const nameFromUser =
          parsedUser?.name ||
          parsedUser?.fullName ||
          parsedUser?.username ||
          "";

        if (String(nameFromUser).trim()) {
          return String(nameFromUser).trim();
        }
      }

      const rawUserInfo = localStorage.getItem("userInfo");
      if (rawUserInfo) {
        const parsedUserInfo = JSON.parse(rawUserInfo);
        const nameFromUserInfo =
          parsedUserInfo?.name ||
          parsedUserInfo?.fullName ||
          parsedUserInfo?.username ||
          "";

        if (String(nameFromUserInfo).trim()) {
          return String(nameFromUserInfo).trim();
        }
      }
    } catch (err) {
      console.warn("Failed to read learner name from localStorage:", err);
    }

    return "there";
  }, []);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        `Hi ${learnerName}! I'm your AI driving assistant. I can help explain traffic rules, clarify practice test questions, or give you tips for your upcoming exam. What would you like to learn today?`,
    },
  ]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizAnalysis, setQuizAnalysis] = useState(
    location.state?.quizAnalysis || null,
  );
  const [autoAnalyzePending, setAutoAnalyzePending] = useState(
    Boolean(location.state?.autoAnalyze && location.state?.quizAnalysis),
  );
  const [weakTopics, setWeakTopics] = useState([]);

  // Log state changes
  useEffect(() => {
    console.log("📊 STATE UPDATED:");
    console.log("   - Messages count:", messages.length);
    console.log("   - Loading:", loading);
    console.log("   - Error:", error);
    console.log("   - ConversationId:", conversationId);
    console.log("   - QuizAnalysis exists:", !!quizAnalysis);
    if (quizAnalysis) {
      console.log("   - Quiz wrong questions:", quizAnalysis.wrongQuestions?.length || 0);
    }
  }, [messages, loading, error, conversationId, quizAnalysis]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, quizAnalysis]);

  // Auto-send quiz analysis if coming from Quiz page
  useEffect(() => {
    console.log("🔍 Checking sessionStorage for quizAnalysis...");
    if (location.state?.quizAnalysis) {
      console.log("✅ Found quizAnalysis from route state");
      setQuizAnalysis(location.state.quizAnalysis);
      setAutoAnalyzePending(Boolean(location.state?.autoAnalyze));
      return;
    }

    const analysisData = sessionStorage.getItem("quizAnalysis");
    if (analysisData) {
      console.log("✅ Found quizAnalysis in sessionStorage");
      console.log("📍 Raw string length:", analysisData.length);
      try {
        const data = JSON.parse(analysisData);
        console.log("📦 Parsed quizAnalysis object:");
        console.log("   - examName:", data.examName);
        console.log("   - score:", data.score);
        console.log("   - percentage:", data.percentage);
        console.log("   - licenseType:", data.licenseType);
        console.log("   - totalWrong:", data.totalWrong);
        console.log("   - wrongQuestions type:", typeof data.wrongQuestions);
        console.log("   - wrongQuestions:", data.wrongQuestions);
        if (Array.isArray(data.wrongQuestions)) {
          console.log(`   ✅ wrongQuestions is array, length: ${data.wrongQuestions.length}`);
          if (data.wrongQuestions.length > 0) {
            console.log("   First question:", data.wrongQuestions[0]);
          }
        } else {
          console.log(`   ❌ wrongQuestions is NOT an array! Type: ${typeof data.wrongQuestions}`);
        }
        console.log("   - answersByQuestion keys:", Object.keys(data.answersByQuestion || {}));
        console.log("📋 FULL DATA:", JSON.stringify(data, null, 2));
        setQuizAnalysis(data);
        setAutoAnalyzePending(true);
        sessionStorage.removeItem("quizAnalysis");
        console.log("✅ Removed quizAnalysis from sessionStorage");
      } catch (err) {
        console.error("❌ Error parsing quiz analysis:", err);
        console.error("   - Type:", err.constructor.name);
        console.error("   - Message:", err.message);
        console.error("   - Data preview:", analysisData.substring(0, 200));
      }
    } else {
      console.log("⚠️ No quizAnalysis in sessionStorage");
    }
  }, [location.state]);

  const handlePracticeByChapter = (topic) => {
    console.log("📚 Starting 15-question practice for chapter:", topic);
    // Navigate to quiz with specific category preset
    navigate("/learner/quiz", {
      state: {
        examConfig: {
          topicId: null,
          licenseType: "A1",
          questionCount: 15,
          examName: `Ôn tập: ${topic.display}`,
          generationMode: "structured",
          examsSource: "exam_250",
          fatalOnly: false,
          selectedCategories: [topic.category],
        },
      },
    });
  };

  const handleSendMessage = async (e, messageText = null) => {
    console.log("🔹 handleSendMessage called");
    if (e) {
      console.log("📋 Event prevented");
      e.preventDefault();
    }
    
    const messageToSend = messageText || inputValue;
    console.log("💬 Message to send:", messageToSend);
    console.log("📝 Input value:", inputValue);
    
    if (!messageToSend.trim()) {
      console.log("⚠️ Message is empty, returning");
      return;
    }

    // Add user message to chat
    const userMessage = { role: "user", content: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInputValue("");
    setLoading(true);
    setError("");

    try {
      console.log("🌐 Fetching from:", `${import.meta.env.VITE_AI_API_URL}/chat/message`);
      console.log("🔄 Conversation ID:", conversationId);
      
      const response = await fetch(
        `${import.meta.env.VITE_AI_API_URL}/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageToSend,
            conversation_id: conversationId,
          }),
        }
      );

      console.log("✅ Response received, status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`Failed to get AI response: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Response data:", data);

      // Set conversation ID from response
      if (!conversationId && data.conversation_id) {
        console.log("🆔 Setting conversation ID:", data.conversation_id);
        setConversationId(data.conversation_id);
      }

      // Add AI message to chat
      if (data.ai_response) {
        const aiMessage = { role: "assistant", content: data.ai_response };
        setMessages((prev) => [...prev, aiMessage]);
        console.log("💬 AI message added to chat");
      } else {
        console.warn("⚠️ No AI response in data");
      }
    } catch (err) {
      console.error("❌ Error in handleSendMessage:", err);
      console.error("📍 Error stack:", err.stack);
      setError("Failed to send message. Please try again.");
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      console.log("✔️ Loading finished");
    }
  };

  // Auto-send analysis prompt when quiz data arrives
  useEffect(() => {
    console.log("\n🔄 AUTO-SEND useEffect triggered");
    console.log("   quizAnalysis:", quizAnalysis);
    console.log("   loading:", loading);

    if (autoAnalysisRanRef.current) {
      console.log("⚠️ Auto analysis already ran, skipping");
      return;
    }

    if (!quizAnalysis || !autoAnalyzePending) {
      console.log("⚠️ quizAnalysis is null or auto analyze is disabled, skipping");
      return;
    }

    autoAnalysisRanRef.current = true;
    setAutoAnalyzePending(false);

    console.log("✅ quizAnalysis exists");
    console.log("   Type:", typeof quizAnalysis);
    console.log("   Keys:", Object.keys(quizAnalysis));

    if (!quizAnalysis.wrongQuestions) {
      console.log("❌ PROBLEM: wrongQuestions is undefined!");
      console.log("   Available properties:", Object.keys(quizAnalysis));
      console.log("   Full quizAnalysis:", quizAnalysis);
      return;
    }

    console.log("✅ wrongQuestions exists");
    console.log("   Type:", typeof quizAnalysis.wrongQuestions);
    console.log("   Value:", quizAnalysis.wrongQuestions);

    if (!Array.isArray(quizAnalysis.wrongQuestions)) {
      console.log("❌ PROBLEM: wrongQuestions is NOT an array!");
      console.log("   Type:", typeof quizAnalysis.wrongQuestions);
      return;
    }

    console.log("✅ wrongQuestions is an array");
    console.log("   Length:", quizAnalysis.wrongQuestions.length);

    if (quizAnalysis.wrongQuestions.length === 0) {
      console.log("❌ PROBLEM: wrongQuestions array is EMPTY!");
      console.log("   totalWrong from data:", quizAnalysis.totalWrong);
      console.log("   Full quizAnalysis data:", quizAnalysis);
      return;
    }
    
    console.log("✅ All checks passed, preparing analysis...");
    console.log(`   - ${quizAnalysis.wrongQuestions.length} wrong questions found`);
    console.log("   Questions:", quizAnalysis.wrongQuestions.map(q => ({ 
      id: q.id, 
      text: q.question_text?.substring(0, 30),
      user_answer: q.user_answer,
      correct_answer: q.correct_answer
    })));
    
    const sendAnalysis = async () => {
      console.log("\n📤 SEND_ANALYSIS function started");
      
      try {
        console.log("🔨 Building userAnswerTexts...");
        const userAnswerTexts = quizAnalysis.wrongQuestions.map((q, idx) => {
          console.log(`   Processing question ${idx + 1}:`, q.id);
          const userAnswerText = q.user_answer_text || "Không chọn";
          const correctAnswerText = q.correct_answer_text || "Không xác định";
          const hasKnownCorrectAnswer =
            correctAnswerText &&
            correctAnswerText !== "Không xác định" &&
            correctAnswerText !== "Không rõ";

          const correctAnswerLine = hasKnownCorrectAnswer
            ? `\n   ✅ **Đáp án đúng:** ${correctAnswerText}`
            : "";

          return `${idx + 1}. **Câu ${q.id}** ${q.category ? `[${q.category}]` : ""}
   📝 **Đề bài:** ${q.question_text}
   ❌ **Bạn chọn:** ${userAnswerText}
${correctAnswerLine}
   📚 **Giải thích:** ${q.explanation || "Không có giải thích"}`;
        }).join("\n\n");
        
        console.log("✅ userAnswerTexts built, length:", userAnswerTexts.length);
        
        const analysisPrompt = `Bạn là gia sư luyện thi lái xe. Hãy phân tích BÀI KIỂM TRA dưới đây theo đúng cấu trúc, không trả lời chung chung, không lặp lại đề bài nguyên văn dài dòng, và không bỏ sót câu nào.

      YÊU CẦU TRẢ LỜI BẰNG TIẾNG VIỆT, theo 4 phần cố định:
      1. Điểm yếu chính: tóm tắt 3-5 điểm yếu nổi bật nhất từ toàn bộ các câu sai.
      2. Phân tích từng câu sai: mỗi câu trình bày theo mẫu: vì sao sai, nguyên tắc đúng là gì, vì sao nguyên tắc đó đúng, mẹo nhớ nhanh.
      3. Hướng dẫn ôn tập cụ thể: đưa ra kế hoạch ôn tập ngắn hạn trong 3-5 bước, ưu tiên các lỗi dễ mất điểm.
      4. Chủ đề cần ôn thêm: liệt kê các nhóm kiến thức cần học lại.

      Ràng buộc:
      - Chỉ phân tích các câu sai được cung cấp bên dưới.
      - Cần rõ ràng, thực tế, dễ hiểu.
      - Không được viết câu kiểu "Đáp án đúng: Không xác định".
      - Nếu thiếu đáp án đúng dạng lựa chọn A/B/C/D, hãy dùng mục Giải thích để nêu nguyên tắc đúng thay thế.
      - Chỉ tập trung giải thích lỗi sai; không liệt kê lại toàn bộ đáp án của đề.
      - Nếu câu nào là câu điểm liệt, phải nhấn mạnh mức độ quan trọng.

      📊 THÔNG TIN CHUNG:
      - Tên bài: ${quizAnalysis.examName}
      - Loại bằng: ${quizAnalysis.licenseType}
      - Kết quả: ${quizAnalysis.score} (${quizAnalysis.percentage}%)
      - Tổng câu sai: ${quizAnalysis.wrongQuestions.length}

      ❌ CÁC CÂU SAI:
      ${userAnswerTexts}

      Hãy trả lời ngay bằng 4 mục trên, dùng tiêu đề Markdown rõ ràng và bullet points ngắn gọn.`;

        console.log("✅ analysisPrompt built, length:", analysisPrompt.length);

        // Add user message to chat
        const userMessage = {
          role: "user",
          content:
            `Nhờ bạn phân tích bài ${quizAnalysis.examName}: ${quizAnalysis.score} (${quizAnalysis.percentage}%), tổng ${quizAnalysis.wrongQuestions.length} câu sai.`,
        };
        console.log("➕ Adding user message to chat");
        setMessages((prev) => {
          console.log("   Current messages count:", prev.length);
          const newMessages = [...prev, userMessage];
          console.log("   New messages count:", newMessages.length);
          return newMessages;
        });
        
        setLoading(true);
        setError("");

        console.log("📤 Sending analysis request to AI...");
        console.log("🔗 API URL:", `${import.meta.env.VITE_AI_API_URL}/chat/message`);
        console.log("💬 Message length:", analysisPrompt.length);
        console.log("🆔 Conversation ID:", conversationId || "NEW");

        const response = await fetch(
          `${import.meta.env.VITE_AI_API_URL}/chat/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: analysisPrompt,
              conversation_id: conversationId,
            }),
          }
        );

        console.log("📥 Response received");
        console.log("   Status:", response.status);
        console.log("   StatusText:", response.statusText);
        console.log("   Headers Content-Type:", response.headers.get("Content-Type"));

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ ERROR Response body:", errorText);
          throw new Error(`Failed to get AI response: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Response parsed successfully");
        console.log("   Response keys:", Object.keys(data));
        console.log("   conversation_id:", data.conversation_id);
        console.log("   ai_response length:", data.ai_response?.length || 0);
        console.log("   ai_response preview:", data.ai_response?.substring(0, 100));

        // Set conversation ID from response
        if (!conversationId && data.conversation_id) {
          console.log("🆔 Setting new conversation ID:", data.conversation_id);
          setConversationId(data.conversation_id);
        }

        // Add AI message to chat
        if (data.ai_response) {
          const aiMessage = { role: "assistant", content: data.ai_response };
          console.log("➕ Adding AI message to chat");
          setMessages((prev) => {
            console.log("   Current messages count:", prev.length);
            const newMessages = [...prev, aiMessage];
            console.log("   New messages count:", newMessages.length);
            return newMessages;
          });
          console.log("✅ AI message added to state");
          
          // Compute weak topics after AI analysis is received
          if (quizAnalysis) {
            console.log("📊 Computing weak topics from quizAnalysis...");
            const topics = computeWeakTopics(quizAnalysis);
            setWeakTopics(topics);
            console.log("✅ Weak topics computed:", topics);
          }
        } else {
          console.warn("⚠️ data.ai_response is empty or missing");
        }
      } catch (err) {
        console.error("❌ CRITICAL ERROR in sendAnalysis:", err);
        console.error("   Error type:", err.constructor.name);
        console.error("   Error message:", err.message);
        console.error("   Error stack:", err.stack);
        setError(`Failed to send analysis: ${err.message}`);
        // Remove the user message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        console.log("✅ SEND_ANALYSIS function finished");
        setLoading(false);
      }
    };

    void sendAnalysis();
  }, [quizAnalysis, autoAnalyzePending]);

  return (
    <div className="h-screen overflow-hidden bg-[#f9f9ff] font-sans">
      <main className="h-full w-full max-w-screen-xl mx-auto p-8 flex flex-col gap-8 overflow-hidden">
        {/* 1. Header & Stats */}
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#141b2b] tracking-tight font-manrope">
              AI Assistant
            </h1>
            <p className="text-slate-500 font-medium">
              Get instant help with driving questions
            </p>
          </div>

        </section>

        {/* 2. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0 overflow-hidden">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1 flex flex-col gap-6 min-h-0">
            {/* Suggested Topics */}
            <Card className="border-none shadow-sm rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#141b2b]">
                  Suggested Topics
                </h3>
                <div className="flex flex-col gap-1">
                  {SUGGESTED_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors group"
                      onClick={() => handleSendMessage(null, TOPIC_PROMPTS[topic] || topic)}
                      disabled={loading}
                    >
                      {topic}
                      <ChevronRight
                        size={14}
                        className="text-slate-300 group-hover:text-blue-600"
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

          </aside>

          {/* Chat Workspace */}
          <section className="lg:col-span-3 flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-0">
            <ScrollArea className="flex-1 min-h-0 p-8 overflow-y-auto overscroll-contain">
              <div className="space-y-8">
                {messages.map((msg, i) =>
                  msg.role === "assistant" ? (
                    <div key={i} className="flex gap-4 max-w-3xl">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Sparkles size={20} />
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-slate-100 flex-1">
                        <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex gap-4 max-w-3xl ml-auto flex-row-reverse">
                      <Avatar className="w-10 h-10 rounded-full bg-emerald-500 text-white shrink-0">
                        <AvatarFallback className="bg-emerald-500 font-bold">
                          T
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-blue-600 p-5 rounded-2xl rounded-tr-none shadow-md shadow-blue-100">
                        <p className="text-sm text-white font-medium whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  )
                )}
                
                {loading && (
                  <div className="flex gap-4 max-w-3xl">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Loader size={20} className="animate-spin" />
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-slate-100">
                      <p className="text-sm text-slate-500">AI đang phân tích...</p>
                    </div>
                  </div>
                )}

                {/* Practice by Chapter Section */}
                {weakTopics.length > 0 && !loading && (
                  <div className="mt-12 space-y-4 max-w-3xl">
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart2 size={20} className="text-slate-700" />
                      <h3 className="text-lg font-bold text-[#141b2b]">
                        Ôn tập theo chương
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {weakTopics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-all"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">
                              {idx + 1}. {topic.display}
                            </h4>
                          </div>
                          <Button
                            onClick={() => handlePracticeByChapter(topic)}
                            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg whitespace-nowrap transition-all"
                          >
                            Luyện Tập
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestions Bubbles */}
              {messages.length <= 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-12 mb-4">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <Button
                      key={s}
                      variant="secondary"
                      className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[11px] h-9 px-4"
                      onClick={() => {
                        console.log("✅ Quick suggestion clicked:", s);
                        handleSendMessage(null, s);
                      }}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input Bar */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
              <div className="max-w-4xl mx-auto space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask a question about driving rules..."
                    className="w-full h-16 pl-6 pr-24 rounded-2xl border-slate-200 shadow-sm focus-visible:ring-blue-400 font-medium placeholder:text-slate-400"
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-blue-600 rounded-xl"
                    >
                      <Mic size={20} />
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl w-10 h-10 shadow-lg shadow-blue-200 disabled:opacity-50"
                      disabled={loading || !inputValue.trim()}
                    >
                      {loading ? (
                        <Loader size={20} className="animate-spin" />
                      ) : (
                        <SendHorizontal size={20} />
                      )}
                    </Button>
                  </div>
                </form>

                <div className="flex justify-center gap-6">
                  <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-blue-600 tracking-widest uppercase transition-colors">
                    <BarChart2 size={12} /> Progress
                  </button>
                  <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-blue-600 tracking-widest uppercase transition-colors">
                    <MapIcon size={12} /> Map
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AiLearner;
