import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import LoadingGate from "@/components/LoadingGate";
import { StoreProvider } from "@/lib/store";

export default function AppLayout({ children }) {
  return (
    <StoreProvider>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 min-h-screen flex flex-col">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
            <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8">
              <LoadingGate>{children}</LoadingGate>
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    </StoreProvider>
  );
}
