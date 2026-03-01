"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import {
  Search, Plus, MessageSquareText, Moon, Sun, Users, X, Check,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/formatTime";

type Me = {
  _id: Id<"users">;
  name: string;
  imageUrl?: string;
  clerkId: string;
  isOnline: boolean;
};

type Props = {
  me: Me;
  activeConvId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
};

export default function Sidebar({ me, activeConvId, onSelectConversation }: Props) {
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [dmOpen, setDmOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedForGroup, setSelectedForGroup] = useState<Id<"users">[]>([]);

  const conversations = useQuery(api.conversations.getMyConversations, { userId: me._id });
  const searchedUsers = useQuery(api.users.searchUsers, { clerkId: me.clerkId, search: userSearch });
  const getOrCreateDM = useMutation(api.conversations.getOrCreateDM);
  const createGroup = useMutation(api.conversations.createGroup);

  const handleStartDM = async (userId: Id<"users">) => {
    const convId = await getOrCreateDM({ myId: me._id, otherId: userId });
    setDmOpen(false);
    setUserSearch("");
    onSelectConversation(convId);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedForGroup.length < 1) return;
    const convId = await createGroup({
      groupName: groupName.trim(),
      participantIds: [me._id, ...selectedForGroup],
      createdBy: me._id,
    });
    setGroupOpen(false);
    setGroupName("");
    setSelectedForGroup([]);
    onSelectConversation(convId);
  };

  const toggleGroupMember = (userId: Id<"users">) => {
    setSelectedForGroup((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Filter sidebar conversations by search
  const filtered = conversations?.filter((c) => {
    if (!search.trim()) return true;
    const name = c.isGroup
      ? c.groupName
      : c.participants?.find((p: any) => p._id !== me._id)?.name;
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <aside className="flex flex-col h-full sidebar-bg sidebar-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b sidebar-border-color">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <MessageSquareText className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">LiveChat</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-hover))]"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark"
            ? <Sun className="h-4 w-4" />
            : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sidebar-muted" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm bg-[hsl(var(--sidebar-hover))] border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-fg))] placeholder:text-[hsl(var(--sidebar-muted))] focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* New conversation buttons */}
      <div className="flex gap-2 px-3 py-2">
        {/* New DM */}
        <Dialog open={dmOpen} onOpenChange={setDmOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8 gap-1.5 text-xs sidebar-muted hover:sidebar-text hover:bg-[hsl(var(--sidebar-hover))] justify-start"
            >
              <Plus className="h-3.5 w-3.5" /> New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Direct Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8"
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-1">
                {searchedUsers?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {userSearch ? "No users found" : "No other users yet"}
                  </p>
                )}
                {searchedUsers?.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleStartDM(u._id)}
                    className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.imageUrl} />
                        <AvatarFallback className="text-xs bg-primary/20 text-primary">
                          {u.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                        u.isOnline ? "bg-green-500" : "bg-muted-foreground"
                      )} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.isOnline ? "Online" : "Offline"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Group */}
        <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8 gap-1.5 text-xs sidebar-muted hover:sidebar-text hover:bg-[hsl(var(--sidebar-hover))] justify-start"
            >
              <Users className="h-3.5 w-3.5" /> New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Group Chat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <Input
                placeholder="Group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
              />
              <p className="text-sm font-medium text-muted-foreground">Select members:</p>
              <div className="max-h-52 overflow-y-auto scrollbar-thin space-y-1">
                {searchedUsers?.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => toggleGroupMember(u._id)}
                    className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.imageUrl} />
                        <AvatarFallback className="text-xs">{u.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-sm flex-1 text-left">{u.name}</p>
                    {selectedForGroup.includes(u._id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedForGroup.length < 1}
                className="w-full"
              >
                Create Group ({selectedForGroup.length + 1} members)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-0.5 py-1">
        {conversations === undefined && (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-3 rounded-xl">
              <div className="w-10 h-10 rounded-full skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 skeleton rounded-full w-3/4" />
                <div className="h-2.5 skeleton rounded-full w-1/2" />
              </div>
            </div>
          ))
        )}

        {conversations !== undefined && filtered?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 px-4 text-center">
            <MessageSquareText className="h-8 w-8 sidebar-muted opacity-50" />
            <p className="text-sm sidebar-muted">
              {search ? "No conversations match your search" : "No conversations yet. Start one!"}
            </p>
          </div>
        )}

        {filtered?.map((conv) => {
          const other = !conv.isGroup
            ? conv.participants?.find((p: any) => p._id !== me._id)
            : null;
          const name = conv.isGroup ? conv.groupName : other?.name;
          const isActive = activeConvId === conv._id;

          return (
            <button
              key={conv._id}
              onClick={() => onSelectConversation(conv._id)}
              className={cn(
                "flex items-center gap-3 w-full px-2 py-2.5 rounded-xl transition-all duration-150 text-left",
                isActive
                  ? "bg-primary/20 text-white"
                  : "hover:bg-[hsl(var(--sidebar-hover))] sidebar-text"
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conv.isGroup ? undefined : other?.imageUrl} />
                  <AvatarFallback className={cn(
                    "text-sm font-semibold",
                    conv.isGroup ? "bg-primary/30 text-primary-foreground" : "bg-primary/20 text-primary"
                  )}>
                    {conv.isGroup ? <Users className="h-4 w-4" /> : name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator for DMs */}
                {!conv.isGroup && other && (
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2",
                    isActive ? "border-primary/20" : "border-[hsl(var(--sidebar-bg))]",
                    other.isOnline ? "bg-green-500" : "bg-[hsl(var(--sidebar-muted))]"
                  )} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold truncate">{name}</span>
                  {conv.lastMessageTime && (
                    <span className="text-[10px] sidebar-muted shrink-0">
                      {formatTimestamp(conv.lastMessageTime)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <p className="text-xs sidebar-muted truncate">
                    {conv.lastMessage
                      ? conv.lastMessage.isDeleted
                        ? "Message deleted"
                        : conv.lastMessage.content
                      : conv.isGroup
                        ? `${conv.participants?.length} members`
                        : "Say hello!"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <Badge className="h-5 min-w-5 text-[10px] px-1.5 bg-primary text-white shrink-0">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* User footer */}
      <div className="border-t sidebar-border-color px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserButton afterSignOutUrl="/sign-in" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[hsl(var(--sidebar-bg))]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{me.name}</p>
            <p className="text-xs sidebar-muted">Active now</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
