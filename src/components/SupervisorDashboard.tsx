import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface EntryWithWorker {
  _id: Id<"entries">;
  _creationTime: number;
  userId: Id<"users">;
  treeCount: number;
  species: string;
  location: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  verifiedAt?: number;
  verifiedBy?: Id<"users">;
  rejectionReason?: string;
  workerName: string;
}

type Tab = "pending" | "all";

export function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const pendingEntries = useQuery(api.entries.listPending);
  const allEntries = useQuery(api.entries.listAll);
  const approveEntry = useMutation(api.entries.approve);
  const rejectEntry = useMutation(api.entries.reject);

  const [rejectingId, setRejectingId] = useState<Id<"entries"> | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<Id<"entries"> | null>(null);

  const handleApprove = async (id: Id<"entries">) => {
    setProcessing(id);
    try {
      await approveEntry({ id });
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: Id<"entries">) => {
    if (!rejectReason.trim()) return;

    setProcessing(id);
    try {
      await rejectEntry({ id, reason: rejectReason.trim() });
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const entries = activeTab === "pending" ? pendingEntries : allEntries;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-sage/30 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-serif rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "pending"
              ? "bg-forest text-cream"
              : "text-bark hover:bg-sage/20"
          }`}
        >
          Pending Review
          {pendingEntries && pendingEntries.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-gold text-forest rounded-full">
              {pendingEntries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-serif rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === "all"
              ? "bg-forest text-cream"
              : "text-bark hover:bg-sage/20"
          }`}
        >
          All Entries
        </button>
      </div>

      {/* Entries list */}
      <div className="space-y-4">
        {entries === undefined ? (
          <div className="flex justify-center py-12">
            <svg className="w-8 h-8 text-moss animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-sage/20">
            <svg className="w-16 h-16 text-sage mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <p className="font-serif text-bark/60 text-lg">
              {activeTab === "pending" ? "No pending entries" : "No entries yet"}
            </p>
            <p className="font-serif text-bark/40 text-sm mt-1">
              {activeTab === "pending" ? "All caught up!" : "Entries will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry: EntryWithWorker, index: number) => (
              <div
                key={entry._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-sage/20 card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-display text-lg md:text-xl text-forest">
                        {entry.treeCount.toLocaleString()} {entry.species}
                      </span>
                      <StatusBadge status={entry.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                      <p className="font-serif text-bark/70 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                        </svg>
                        <span className="truncate">{entry.workerName}</span>
                      </p>
                      <p className="font-serif text-bark/70 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="truncate">{entry.location}</span>
                      </p>
                    </div>

                    {entry.notes && (
                      <p className="font-serif text-bark/50 text-sm mt-2 italic line-clamp-2">"{entry.notes}"</p>
                    )}

                    {entry.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm font-serif">
                          <span className="font-semibold">Rejection reason:</span> {entry.rejectionReason}
                        </p>
                      </div>
                    )}

                    <p className="font-serif text-bark/40 text-xs mt-2">
                      Submitted {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {entry.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      {rejectingId === entry._id ? (
                        <div className="p-3 bg-cream/50 rounded-lg border border-sage/30 space-y-2 min-w-[200px] md:min-w-[250px]">
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-sage/30 rounded-lg text-sm font-serif resize-none"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(entry._id)}
                              disabled={!rejectReason.trim() || processing === entry._id}
                              className="flex-1 px-3 py-1.5 bg-red-500 text-white text-sm font-serif rounded-lg disabled:opacity-50 hover:bg-red-600 transition-colors"
                            >
                              {processing === entry._id ? "..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason("");
                              }}
                              className="px-3 py-1.5 bg-sage/20 text-bark text-sm font-serif rounded-lg hover:bg-sage/30 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(entry._id)}
                            disabled={processing === entry._id}
                            className="px-4 py-2 bg-fern text-cream font-serif text-sm rounded-lg hover:bg-moss transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {processing === entry._id ? (
                              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4" />
                              </svg>
                            )}
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setRejectingId(entry._id)}
                            className="px-4 py-2 bg-red-100 text-red-600 font-serif text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = {
    pending: "bg-gold/20 text-gold border-gold/30",
    approved: "bg-fern/20 text-fern border-fern/30",
    rejected: "bg-red-100 text-red-600 border-red-200"
  };

  const icons = {
    pending: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    approved: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    rejected: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-serif capitalize rounded-full border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
}
