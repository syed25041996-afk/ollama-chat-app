import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";

interface AppLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
}

export function AppLayout({ sidebar, main }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        {sidebar}
      </Sidebar>
      <SidebarInset>
        {main}
      </SidebarInset>
    </SidebarProvider>
  );
}