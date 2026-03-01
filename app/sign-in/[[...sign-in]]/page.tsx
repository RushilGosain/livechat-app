import { SignIn } from "@clerk/nextjs";
import { MessageSquareText } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] sidebar-bg p-12 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <MessageSquareText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold sidebar-text tracking-tight">LiveChat</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold sidebar-text leading-tight">
            Real conversations,<br />in real time.
          </h1>
          <p className="sidebar-muted text-base leading-relaxed">
            Connect instantly with anyone. Send messages, see who's online, and never miss a reply.
          </p>
        </div>
        <p className="sidebar-muted text-sm">© 2026 LiveChat. Built with Next.js & Convex.</p>
      </div>

      {/* Right sign-in panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <MessageSquareText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">LiveChat</span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground mt-1 text-sm">Sign in to continue to LiveChat</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
