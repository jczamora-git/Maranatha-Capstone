import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { CompactLanguageSelector } from "./LanguageSelector";
import { useFCMNotificationListener } from "@/hooks/useNotifications";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // Single persistent FCM foreground listener for the whole app.
  // Instantly refreshes the notification badge/list whenever a push arrives
  // while the user has the tab open, without relying on short polling intervals.
  useFCMNotificationListener();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {/* Fixed notification bell and language selector for desktop (hidden on mobile - Sidebar handles it there) */}
      <div className="hidden md:flex fixed top-4 right-4 z-50 gap-2 items-center">
        <CompactLanguageSelector />
        <NotificationBell />
      </div>
      <main className="flex-1 px-2 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 overflow-y-auto pt-16">
        {children}
      </main>
    </div>
  );
};