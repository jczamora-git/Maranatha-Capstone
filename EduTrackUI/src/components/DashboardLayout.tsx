import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
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
      {/* Fixed notification bell for desktop (hidden on mobile  Sidebar handles it there) */}
      <div className="hidden md:flex fixed top-4 right-4 z-50">
        <NotificationBell />
      </div>
      <main className="flex-1 p-8 overflow-y-auto pt-16">
        {children}
      </main>
    </div>
  );
};