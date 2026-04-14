import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FieldWorkerDashboard } from "./FieldWorkerDashboard";
import { SupervisorDashboard } from "./SupervisorDashboard";
import { Doc } from "../../convex/_generated/dataModel";

interface DashboardProps {
  profile: Doc<"profiles">;
}

export function Dashboard({ profile }: DashboardProps) {
  const { signOut } = useAuthActions();
  const stats = useQuery(api.entries.getStats);

  return (
    <div className="min-h-screen bg-cream pb-16">
      {/* Header */}
      <header className="bg-forest text-cream sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cream/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-cream" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L8 8H4L8 14H2L12 22L22 14H16L20 8H16L12 2Z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl">Canopy</h1>
              <p className="text-xs text-cream/60 font-serif hidden sm:block">Forestry Tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-serif text-sm text-cream/90">{profile.name}</p>
              <p className="text-xs text-cream/60 capitalize">{profile.role === "fieldWorker" ? "Field Worker" : "Supervisor"}</p>
            </div>
            <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center">
              <span className="text-forest font-display text-lg">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-cream/10 rounded-lg transition-colors"
              title="Sign out"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      {stats && (
        <div className="bg-moss/10 border-b border-sage/20">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Trees Planted"
                value={stats.totalTrees.toLocaleString()}
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L8 8H4L8 14H2L12 22L22 14H16L20 8H16L12 2Z" />
                  </svg>
                }
              />
              {profile.role === "fieldWorker" ? (
                <>
                  <StatCard
                    label="Pending Trees"
                    value={stats.pendingTrees?.toLocaleString() || "0"}
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="Approved Entries"
                    value={stats.approvedEntries?.toString() || "0"}
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="Total Entries"
                    value={stats.totalEntries?.toString() || "0"}
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                      </svg>
                    }
                  />
                </>
              ) : (
                <>
                  <StatCard
                    label="Pending Reviews"
                    value={stats.pendingReviews?.toString() || "0"}
                    highlight
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="Approved Entries"
                    value={stats.approvedEntries?.toString() || "0"}
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="Total Entries"
                    value={stats.totalEntries?.toString() || "0"}
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                      </svg>
                    }
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {profile.role === "fieldWorker" ? (
          <FieldWorkerDashboard />
        ) : (
          <SupervisorDashboard />
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
  icon
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className={`p-3 md:p-4 rounded-xl ${highlight ? 'bg-gold/20 border border-gold/30' : 'bg-white/60 border border-sage/20'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={highlight ? 'text-gold' : 'text-moss'}>{icon}</span>
        <span className="text-xs font-serif text-bark/60 truncate">{label}</span>
      </div>
      <p className={`font-display text-xl md:text-2xl ${highlight ? 'text-gold' : 'text-forest'}`}>{value}</p>
    </div>
  );
}
