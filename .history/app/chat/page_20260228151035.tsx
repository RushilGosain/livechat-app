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
  const [showSidebar, setShowSidebar] = useState(true); // mobile: toggle

  const upsertUser = useMutation(api.users.upsertUser);
  const setOffline = useMutation(api.users.setOffline);

  // Register / update user in Convex
  useEffect(() => {
    if (!user) return;
    upsertUser({
      clerkId: user.id,
      name: user.fullName || user.username || user.emailAddresses[0]?.emailAddress || "User",
      email: user.emailAddresses[0]?.emailAddress || "",
      imageUrl: user.imageUrl,
    });

    // Mark offline on unload
    const handleUnload = () => {
      setOffline({ clerkId: user.id });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [user, upsertUser, setOffline]);

  const me = useQuery(api.users.getMe, user ? { clerkId: user.id } : "skip");

  if (!isLoaded || !user) {
  return <LoadingScreen />;
}

if (me === undefined) {
  return <LoadingScreen />;
}

  const handleSelectConversation = (id: Id<"conversations">) => {
    setActiveConvId(id);
    setShowSidebar(false); // on mobile, hide sidebar and show chat
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
      <div className={`
        ${!showSidebar ? "flex" : "hidden"} lg:flex
        flex-1 flex-col min-w-0 h-full
      `}>
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
