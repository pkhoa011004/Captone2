import React, { useState } from "react";
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
} from "lucide-react";

import { TopHeaderLearner } from "../../components/TopHeaderLearner";
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

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] font-sans">
      <TopHeaderLearner />

      <main className="flex-1 w-full max-w-screen-xl mx-auto p-8 mt-16 flex flex-col gap-8">
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
                {/* AI Message */}
                <div className="flex gap-4 max-w-2xl">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      Hi Thai! I'm your AI driving assistant. I can help explain
                      traffic rules, clarify practice test questions, or give
                      you tips for your upcoming exam. What would you like to
                      learn today?
                    </p>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex gap-4 max-w-2xl ml-auto flex-row-reverse">
                  <Avatar className="w-10 h-10 rounded-full bg-emerald-500 text-white shrink-0">
                    <AvatarFallback className="bg-emerald-500 font-bold">
                      T
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-blue-600 p-5 rounded-2xl rounded-tr-none shadow-md shadow-blue-100">
                    <p className="text-sm text-white font-medium">
                      Can you explain the right-of-way rules at an unmarked
                      intersection?
                    </p>
                  </div>
                </div>

                {/* AI Response with Bullet Points */}
                <div className="flex gap-4 max-w-3xl">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="bg-slate-50 p-6 rounded-2xl rounded-tl-none border border-slate-100">
                      <h4 className="text-blue-700 font-bold mb-3 font-manrope">
                        Unmarked Intersection Rules
                      </h4>
                      <p className="text-sm text-slate-600 mb-4 font-medium">
                        At an unmarked intersection (no signs or signals), the
                        general rules are:
                      </p>
                      <ul className="space-y-3">
                        {[
                          "You must yield to vehicles approaching from your right.",
                          "If you are turning left, you must yield to oncoming traffic going straight or turning right.",
                          "Vehicles already in the intersection have the right of way over vehicles approaching it.",
                        ].map((rule, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-sm text-slate-700 font-medium"
                          >
                            <span className="text-blue-500 font-bold">•</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Feedback Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs font-bold text-slate-500 gap-2 h-9 px-4"
                      >
                        <ThumbsUp size={14} /> Helpful
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs font-bold text-slate-500 gap-2 h-9 px-4"
                      >
                        <ThumbsDown size={14} /> Not quite
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs font-bold text-slate-500 gap-2 h-9 px-4"
                      >
                        <Copy size={14} /> Copy Law Text
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Suggestions Bubbles */}
              <div className="flex flex-wrap justify-center gap-2 mt-12 mb-4">
                {QUICK_SUGGESTIONS.map((s) => (
                  <Button
                    key={s}
                    variant="secondary"
                    className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[11px] h-9 px-4"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* Input Bar */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask a question about driving rules..."
                    className="w-full h-16 pl-6 pr-24 rounded-2xl border-slate-200 shadow-sm focus-visible:ring-blue-400 font-medium placeholder:text-slate-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-blue-600 rounded-xl"
                    >
                      <Mic size={20} />
                    </Button>
                    <Button
                      size="icon"
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl w-10 h-10 shadow-lg shadow-blue-200"
                    >
                      <SendHorizontal size={20} />
                    </Button>
                  </div>
                </div>

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
