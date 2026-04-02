import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  BookOpen,
  Flame,
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

const STATS = [
  {
    label: "QUESTIONS ASKED",
    value: "47",
    icon: MessageSquare,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "TOPICS COVERED",
    value: "8",
    icon: BookOpen,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "STUDY STREAK",
    value: "5 days",
    icon: Flame,
    color: "bg-orange-50 text-orange-600",
  },
];

export const AiLearner = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi Thai! I'm your AI driving assistant. I can help explain traffic rules, clarify practice test questions, or give you tips for your upcoming exam. What would you like to learn today?",
    },
  ]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizAnalysis, setQuizAnalysis] = useState(null);
  const [debugMode, setDebugMode] = useState(true); // Debug mode enabled

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

  // Auto-send quiz analysis if coming from Quiz page
  useEffect(() => {
    console.log("🔍 Checking sessionStorage for quizAnalysis...");
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
  }, []);

  // Test function to debug AI API
  const testAiApi = async () => {
    const testMessage = "Hello, this is a test message";
    try {
      console.log("🧪 Testing AI API...");
      const response = await fetch(
        `${import.meta.env.VITE_AI_API_URL}/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: testMessage,
            conversation_id: "test-" + Date.now(),
          }),
        }
      );
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.ai_response) {
        setMessages(prev => [
          ...prev,
          { role: "user", content: testMessage },
          { role: "assistant", content: data.ai_response }
        ]);
        alert("✅ AI API test successful!");
      }
    } catch (err) {
      console.error("API test failed:", err);
      alert("❌ API test failed: " + err.message);
    }
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
    
    if (!quizAnalysis) {
      console.log("⚠️ quizAnalysis is null, skipping");
      return;
    }

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
          const userAnswerText = q.user_answer !== undefined ? q.options[q.user_answer] : "Không chọn";
          const correctAnswerText = q.options[q.correct_answer];
          return `${idx + 1}. **Câu ${q.id}** ${q.category ? `[${q.category}]` : ""}
   📝 **Đề bài:** ${q.question_text}
   ❌ **Bạn chọn:** ${userAnswerText}
   ✅ **Đáp án đúng:** ${correctAnswerText}
   📚 **Giải thích:** ${q.explanation || "Không có giải thích"}`;
        }).join("\n\n");
        
        console.log("✅ userAnswerTexts built, length:", userAnswerTexts.length);
        
        const analysisPrompt = `Hãy phân tích chi tiết kết quả bài kiểm tra luyện thi của tôi:

📊 **THÔNG TIN CHUNG:**
- Tên bài: ${quizAnalysis.examName}
- Loại bằng: ${quizAnalysis.licenseType}
- Kết quả: ${quizAnalysis.score} (${quizAnalysis.percentage}%)
- Tổng câu sai: ${quizAnalysis.wrongQuestions.length}

❌ **CÁC CÂU SAI:**
${userAnswerTexts}

📝 **YÊU CẦU PHÂN TÍCH:**
1. Đưa ra các điểm yếu chính từ những câu sai này
2. Giải thích chi tiết từng câu sai
3. Đưa ra các lời khuyên cụ thể để ôn tập và cải thiện
4. Liệt kê các chủ đề cần ôn luyện thêm

Hãy phân tích một cách chi tiết, dễ hiểu và có hướng dẫn ôn tập cụ thể.`;

        console.log("✅ analysisPrompt built, length:", analysisPrompt.length);

        // Add user message to chat
        const userMessage = { role: "user", content: analysisPrompt };
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

    // Send analysis after a small delay to ensure UI renders
    console.log("⏱️ Setting timeout for 300ms");
    const timer = setTimeout(() => {
      console.log("🚀 TIMEOUT FIRED - Starting auto-analysis...");
      sendAnalysis();
    }, 300);

    return () => {
      console.log("🧹 Cleanup: clearing timeout");
      clearTimeout(timer);
    };
  }, [quizAnalysis, conversationId]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans">
      <main className="flex-1 w-full max-w-screen-xl mx-auto p-8 flex flex-col gap-8">
        {/* Quiz Analysis Banner */}
        {quizAnalysis && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800 font-medium">
              📊 <strong>Phân tích từ bài kiểm tra:</strong> {quizAnalysis.examName} • 
              Điểm: {quizAnalysis.score} • Tỷ lệ: {quizAnalysis.percentage}%
            </p>
          </div>
        )}

        {/* DEBUG PANEL */}
        {debugMode && (
          <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl font-mono text-xs">
            <div className="font-bold text-yellow-800 mb-2">🔍 DEBUG PANEL</div>
            <div className="space-y-1 text-yellow-700">
              <div>📝 Messages: <span className="font-bold">{messages.length}</span></div>
              <div>📚 Last 3 messages:
                {messages.slice(-3).map((msg, i) => (
                  <div key={i} className="ml-4 text-[10px] truncate">
                    • [{msg.role}] {msg.content.substring(0, 50)}...
                  </div>
                ))}
              </div>
              <div>⏳ Loading: <span className="font-bold">{loading ? '🔄 YES' : '✅ NO'}</span></div>
              <div>❌ Error: <span className="font-bold">{error || '✅ NONE'}</span></div>
              <div>🆔 ConversationId: <span className="font-bold">{conversationId ? '✅' : '❓'} {conversationId?.substring(0, 8)}...</span></div>
              <div>📦 QuizAnalysis: <span className="font-bold">{quizAnalysis ? '✅ YES' : '❌ NO'}</span></div>
              {quizAnalysis && <div>   Wrong Q: <span className="font-bold">{quizAnalysis.wrongQuestions?.length || 0}</span></div>}
              <div>🔗 API URL: <span className="font-bold">{import.meta.env.VITE_AI_API_URL}</span></div>
              <button 
                onClick={() => setDebugMode(!debugMode)}
                className="mt-2 px-2 py-1 bg-yellow-300 hover:bg-yellow-400 rounded font-bold text-black"
              >
                {debugMode ? '🔒 Hide' : '🔓 Show'}
              </button>
            </div>
          </div>
        )}

        {/* 1. Header & Stats */}
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#141b2b] tracking-tight font-manrope">
              AI Assistant
            </h1>
            <p className="text-slate-500 font-medium">
              Get instant help with driving questions
            </p>
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={testAiApi}
                className="mt-2 px-3 py-1 bg-yellow-300 text-black text-xs rounded font-bold hover:bg-yellow-400"
              >
                🧪 Test AI API
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATS.map((stat, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-6 flex items-center gap-5">
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-2xl ${stat.color}`}
                  >
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-[#141b2b]">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 2. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1 flex flex-col gap-6">
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

            {/* Past Conversations */}
            <Card className="border-none shadow-sm rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#141b2b]">
                  Past Conversations
                </h3>
                <div className="flex flex-col gap-3">
                  {PAST_CONVERSATIONS.map((convo, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        convo.active
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold truncate ${convo.active ? "text-[#141b2b]" : "text-slate-600"}`}
                      >
                        {convo.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        {convo.date}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro Tip Card */}
            <div className="mt-auto p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-blue-200" />
                <span className="text-sm font-bold">Pro Tip</span>
              </div>
              <p className="text-xs leading-relaxed text-blue-50/80 font-medium">
                You can ask me to generate a custom practice test focusing on
                your weakest areas!
              </p>
            </div>
          </aside>

          {/* Chat Workspace */}
          <section className="lg:col-span-3 flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <ScrollArea className="flex-1 p-8 h-[600px]">
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
