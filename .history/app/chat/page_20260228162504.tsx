"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import Sidebar from "../../components/chat/Sidebar";
import ChatWindow from "../../components/chat/ChatWindow";
import WelcomeScreen from "../../components/chat/WelcomeScreen";

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const [activeConvId, setActiveConvId] = useState<Id<"conversations"> | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [userReady, setUserReady] = useState(false);

  const upsertUser = useMutation(api.users.upsertUser);
  const setOffline = useMutation(api.users.setOffline);

  // Step 1: Register user in Convex, then mark ready
  useEffect(() => {
    if (!user) return;

    const register = async () => {
      try {
        await upsertUser({
          clerkId: user.id,
          name:
            user.fullName ||
            user.username ||
            user.emailAddresses[0]?.emailAddress ||
            "User",
          email: user.emailAddresses[0]?.emailAddress || "",
          imageUrl: user.imageUrl,
        });
        setUserReady(true);
      } catch (e) {
        console.error("Failed to upsert user:", e);
      }
    };

    register();

    const handleUnload = () => {
      setOffline({ clerkId: user.id });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [user?.id]);

  // Step 2: Only fetch user from Convex after upsert completes
  const me = useQuery(
    api.users.getMe,
    userReady && user ? { clerkId: user.id } : "skip"
  );

  // Loading state covers: Clerk loading, upsert pending, Convex query pending
  if (!isLoaded || !user || !userReady || me === undefined || me === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-32 skeleton rounded-full" />
            <div className="h-3 w-24 skeleton rounded-full mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  const handleSelectConversation = (id: Id<"conversations">) => {
    setActiveConvId(id);
    setShowSidebar(false);
  };

  const handleBack = () => {
    setShowSidebar(true);
    setActiveConvId(null);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — always visible on desktop, toggleable on mobile */}
      <div
        className={`
          ${showSidebar ? "flex" : "hidden"} lg:flex
          w-full lg:w-80 xl:w-96
          flex-col shrink-0
          border-r border-border
          h-full
        `}
      >
        <Sidebar
          me={me}
          activeConvId={activeConvId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Main chat area */}
      <div
        className={`
          ${!showSidebar ? "flex" : "hidden"} lg:flex
          flex-1 flex-col min-w-0 h-full
        `}
      >
        {activeConvId ? (
          <ChatWindow
            conversationId={activeConvId}
            me={me}
            onBack={handleBack}
          />
        ) : (
          <WelcomeScreen name={me.name} />
        )}
      </div>
    </div>
  );
}