import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { ProfileSetup } from "./components/ProfileSetup";
import { Dashboard } from "./components/Dashboard";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import "./styles.css";

function AppContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.profiles.get);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-pulse">
            <svg className="w-16 h-16 text-forest" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L8 8H4L8 14H2L12 22L22 14H16L20 8H16L12 2Z" />
            </svg>
          </div>
          <p className="mt-4 font-serif text-bark text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="inline-block animate-pulse">
          <svg className="w-16 h-16 text-forest" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L8 8H4L8 14H2L12 22L22 14H16L20 8H16L12 2Z" />
          </svg>
        </div>
      </div>
    );
  }

  if (profile === null) {
    return <ProfileSetup />;
  }

  return <Dashboard profile={profile} />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-cream relative">
      {/* Topographic background pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none topo-bg" />

      <AppContent />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center bg-gradient-to-t from-cream via-cream to-transparent">
        <p className="text-xs text-bark/40 font-serif tracking-wide">
          Requested by <span className="text-bark/60">@Salmong</span> · Built by <span className="text-bark/60">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
