import { BottomNavigation } from "@/components/shell/bottom-navigation";
import { FloatingAiButton } from "@/components/shell/floating-ai-button";
import { NativeHeader } from "@/components/shell/native-header";
import { PageTransition } from "@/components/shell/page-transition";

interface AppShellProps {
  title: string;
  children: React.ReactNode;
  back?: boolean;
  right?:
    "notifications" | "messages" | "search" | "filters" | "profile" | "safety";
  onRightClick?: () => void;
  subtitle?: string;
  hideNav?: boolean;
  hideAi?: boolean;
}

export function AppShell({
  title,
  children,
  back,
  right,
  onRightClick,
  subtitle,
  hideNav,
  hideAi,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-white">
      <NativeHeader
        title={title}
        back={back}
        right={right}
        onRightClick={onRightClick}
        subtitle={subtitle}
      />
      <PageTransition>
        <div className={hideNav ? "pb-8" : "pb-nav"}>{children}</div>
      </PageTransition>
      {!hideAi && !hideNav && <FloatingAiButton />}
      {!hideNav && <BottomNavigation />}
    </div>
  );
}
