"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft, Send, Trash2, Smile, ChevronDown, Users, Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatMessageTime, formatDateDivider } from "@/lib/formatTime";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

type Me = {
  _id: Id<"users">;
  name: string;
  imageUrl?: string;
};

type Props = {
  conversationId: Id<"conversations">;
  me: Me;
  onBack: () => void;
};

export default function ChatWindow({ conversationId, me, onBack }: Props) {
  const [content, setContent] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState<Id<"messages"> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversation = useQuery(api.conversations.getConversation, { conversationId });
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const typingUsers = useQuery(api.typing.getTypingUsers, {
    conversationId,
    myUserId: me._id,
  });

  const sendMessage = useMutation(api.messages.sendMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const setTyping = useMutation(api.typing.setTyping);
  const markRead = useMutation(api.readReceipts.markRead);

  // Mark as read when conversation opens
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      markRead({
        conversationId,
        userId: me._id,
        lastReadMessageId: lastMsg._id,
      });
    }
  }, [conversationId, messages?.length, me._id]);

  // Auto-scroll logic
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowScrollBtn(true);
    }
  }, [messages?.length]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollBtn(!isNearBottom);
    if (isNearBottom && messages?.length) {
      const lastMsg = messages[messages.length - 1];
      markRead({ conversationId, userId: me._id, lastReadMessageId: lastMsg._id });
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBtn(false);
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    const text = content.trim();
    setContent("");
    setTyping({ conversationId, userId: me._id, isTyping: false });
    await sendMessage({ conversationId, senderId: me._id, content: text });
    scrollToBottom();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (val: string) => {
    setContent(val);
    if (val.trim()) {
      setTyping({ conversationId, userId: me._id, isTyping: true });
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        setTyping({ conversationId, userId: me._id, isTyping: false });
      }, 2000);
    } else {
      setTyping({ conversationId, userId: me._id, isTyping: false });
    }
  };

  // Close reaction picker on outside click
  useEffect(() => {
    const handler = () => setReactionPickerFor(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const other = conversation?.participants?.find((p: any) => p._id !== me._id);
  const chatName = conversation?.isGroup ? conversation.groupName : other?.name;

  // Group messages by date
  const groupedByDate: { date: string; msgs: typeof messages }[] = [];
  messages?.forEach((msg) => {
    const date = formatDateDivider(msg._creationTime);
    const last = groupedByDate[groupedByDate.length - 1];
    if (!last || last.date !== date) {
      groupedByDate.push({ date, msgs: [msg] });
    } else {
      last.msgs!.push(msg);
    }
  });

  return (
    <div className="flex flex-col h-full chat-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/90 backdrop-blur-sm shrink-0">
        {/* Back button (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={conversation?.isGroup ? undefined : other?.imageUrl} />
            <AvatarFallback className="text-sm bg-primary/20 text-primary font-semibold">
              {conversation?.isGroup
                ? <Users className="h-4 w-4" />
                : chatName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!conversation?.isGroup && other && (
            <span className={cn(
              "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
              other.isOnline ? "bg-green-500" : "bg-muted-foreground"
            )} />
          )}
        </div>

        {/* Name & status */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold truncate">{chatName}</h3>
          <p className="text-xs text-muted-foreground">
            {conversation?.isGroup
              ? `${conversation.participants?.length} members`
              : other?.isOnline
                ? "Online"
                : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-1 relative"
      >
        {messages === undefined && (
          <div className="flex flex-col gap-4 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cn("flex gap-2", i % 2 === 0 ? "" : "flex-row-reverse")}>
                <div className="w-8 h-8 rounded-full skeleton shrink-0" />
                <div className={cn("space-y-1.5", i % 2 === 0 ? "" : "items-end flex flex-col")}>
                  <div className="h-3 skeleton rounded-full w-20" />
                  <div className={cn("h-9 skeleton rounded-2xl", i % 2 === 0 ? "w-48" : "w-36")} />
                </div>
              </div>
            ))}
          </div>
        )}

        {messages !== undefined && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Send className="w-7 h-7 text-primary/60" />
            </div>
            <div>
              <h3 className="font-bold text-base">Start the conversation</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Send your first message to {chatName}
              </p>
            </div>
          </div>
        )}

        {groupedByDate.map((group) => (
          <div key={group.date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground font-medium px-2 py-1 rounded-full bg-background border border-border whitespace-nowrap">
                {group.date}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {group.msgs!.map((msg, idx) => {
              const isMe = msg.senderId === me._id;
              const prev = group.msgs![idx - 1];
              const isSameSender = prev?.senderId === msg.senderId;
              const showHeader = !isSameSender;

              return (
                <MessageRow
                  key={msg._id}
                  msg={msg}
                  isMe={isMe}
                  showHeader={showHeader}
                  myUserId={me._id}
                  reactionPickerFor={reactionPickerFor}
                  setReactionPickerFor={setReactionPickerFor}
                  onDelete={() => deleteMessage({ messageId: msg._id, userId: me._id })}
                  onReact={(emoji) =>
                    toggleReaction({ messageId: msg._id, userId: me._id, emoji })
                  }
                />
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers && typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-2 pb-1 msg-animate">
            <Avatar className="h-6 w-6">
              <AvatarImage src={typingUsers[0]?.imageUrl} />
              <AvatarFallback className="text-[10px]">
                {typingUsers[0]?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 bg-[hsl(var(--msg-in-bg))] border border-border rounded-2xl px-3 py-2">
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block" />
            </div>
            <span className="text-xs text-muted-foreground">
              {typingUsers[0]?.name?.split(" ")[0]} is typing...
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* New messages scroll button */}
      {showScrollBtn && (
        <div className="absolute bottom-24 right-6">
          <Button
            size="sm"
            className="rounded-full gap-1.5 shadow-lg"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
            New messages
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 shrink-0">
        <div className="flex items-end gap-2 bg-background rounded-2xl border border-border p-2 shadow-sm focus-within:border-primary/50 transition-colors">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${chatName || "..."}` }
            className="flex-1 min-h-[40px] max-h-36 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm p-1 scrollbar-hide"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!content.trim()}
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl shrink-0 transition-all",
              content.trim() ? "bg-primary hover:bg-primary/90 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          <kbd className="px-1 py-0.5 rounded bg-muted border text-[9px]">Enter</kbd> send ·{" "}
          <kbd className="px-1 py-0.5 rounded bg-muted border text-[9px]">Shift+Enter</kbd> newline
        </p>
      </div>
    </div>
  );
}

/* ─── Message Row ──────────────────────────────────────────────── */
function MessageRow({
  msg,
  isMe,
  showHeader,
  myUserId,
  reactionPickerFor,
  setReactionPickerFor,
  onDelete,
  onReact,
}: {
  msg: any;
  isMe: boolean;
  showHeader: boolean;
  myUserId: Id<"users">;
  reactionPickerFor: Id<"messages"> | null;
  setReactionPickerFor: (id: Id<"messages"> | null) => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "flex gap-2 group msg-animate",
        isMe ? "flex-row-reverse" : "flex-row",
        showHeader ? "mt-4" : "mt-0.5"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div className={cn("w-8 shrink-0 mt-0.5", !showHeader && "invisible")}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={msg.sender?.imageUrl} />
          <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
            {msg.sender?.name?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className={cn("max-w-[75%] md:max-w-[60%] flex flex-col", isMe && "items-end")}>
        {/* Sender name + time */}
        {showHeader && (
          <div className={cn("flex items-baseline gap-2 mb-1", isMe && "flex-row-reverse")}>
            <span className="text-xs font-bold">{msg.sender?.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatMessageTime(msg._creationTime)}
            </span>
          </div>
        )}

        <div className="relative">
          {/* Bubble */}
          {msg.isDeleted ? (
            <div className={cn(
              "px-4 py-2.5 text-sm italic text-muted-foreground",
              isMe ? "msg-bubble-out opacity-50" : "msg-bubble-in"
            )}>
              This message was deleted
            </div>
          ) : (
            <div className={cn(
              "px-4 py-2.5 text-sm leading-relaxed break-words",
              isMe ? "msg-bubble-out" : "msg-bubble-in"
            )}>
              {msg.content}
            </div>
          )}

          {/* Hover actions */}
          {!msg.isDeleted && hovered && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 z-10",
              isMe ? "-left-24" : "-right-24"
            )}>
              {/* Reaction picker trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setReactionPickerFor(reactionPickerFor === msg._id ? null : msg._id);
                }}
                className="p-1.5 rounded-lg bg-background border border-border shadow-sm hover:bg-accent transition-colors"
              >
                <Smile className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {/* Delete (own messages only) */}
              {isMe && (
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded-lg bg-background border border-border shadow-sm hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              )}
            </div>
          )}

          {/* Reaction picker */}
          {reactionPickerFor === msg._id && (
            <div
              className={cn(
                "absolute bottom-full mb-2 flex items-center gap-1 bg-background border border-border rounded-2xl px-2 py-1.5 shadow-lg z-20",
                isMe ? "right-0" : "left-0"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(emoji);
                    setReactionPickerFor(null);
                  }}
                  className="text-lg hover:scale-125 transition-transform leading-none"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {msg.reactions && msg.reactions.length > 0 && (
          <div className={cn("flex flex-wrap gap-1 mt-1", isMe && "justify-end")}>
            {msg.reactions.map((r: any) => (
              <button
                key={r.emoji}
                onClick={() => onReact(r.emoji)}
                className={cn(
                  "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs border transition-colors",
                  r.userIds.includes(myUserId)
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-background border-border hover:bg-accent"
                )}
              >
                <span>{r.emoji}</span>
                <span className="font-medium">{r.userIds.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Time for grouped messages (no header) */}
        {!showHeader && hovered && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {formatMessageTime(msg._creationTime)}
          </span>
        )}
      </div>
    </div>
  );
}
