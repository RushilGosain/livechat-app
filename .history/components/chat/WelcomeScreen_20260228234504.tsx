"use client";

import { MessageSquareText, Search, Users, Zap } from "lucide-react";

export default function WelcomeScreen({ name }: { name: string }) {
  const firstName = name.split(" ")[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center chat-bg p-8 h-full">
      <div className="max-w-sm text-center space-y-6">
        {/* Animated icon */}
        <div className="relative inline-flex">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
            <MessageSquareText className="w-10 h-10 text-primary/70" />
          </div>
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow">
            <Zap className="w-3.5 h-3.5 text-white" />
          </span>
        </div>

        {/* Text */}
        <div>
          <h2 className="text-2xl font-bold">Hey, {firstName}! 👋</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Pick a conversation from the left or start a new one. Your messages update in real time.
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: <Zap className="h-3.5 w-3.5" />, label: "Real-time" },
            { icon: <Search className="h-3.5 w-3.5" />, label: "Search users" },
            { icon: <Users className="h-3.5 w-3.5" />, label: "Group chats" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border text-xs font-medium text-muted-foreground"
            >
              {f.icon}
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
