import TopBar from "@/components/TopBar";
import BottomNav from "@/components/Bottomnav";

export default function OpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <TopBar />
      </div>

      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>

      <div className="flex-shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}
