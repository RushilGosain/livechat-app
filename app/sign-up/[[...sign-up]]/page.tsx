import { SignUp } from "@clerk/nextjs";
import { MessageSquareText } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-col justify-between w-[480px] sidebar-bg p-12 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <MessageSquareText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold sidebar-text tracking-tight">LiveChat</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold sidebar-text leading-tight">
            Join thousands of<br />live conversations.
          </h1>
          <p className="sidebar-muted text-base leading-relaxed">
            Create your free account and start messaging anyone in seconds.
          </p>
        </div>
        <p className="sidebar-muted text-sm">© 2026 LiveChat. Built with Next.js & Convex.</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="flex lg:hidden items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <MessageSquareText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">LiveChat</span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Create your account</h2>
          <p className="text-muted-foreground mt-1 text-sm">Free forever. No credit card needed.</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
