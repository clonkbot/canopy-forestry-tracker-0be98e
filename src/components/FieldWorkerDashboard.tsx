import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Entry {
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
}

const TREE_SPECIES = [
  "Oak",
  "Pine",
  "Maple",
  "Birch",
  "Spruce",
  "Cedar",
  "Willow",
  "Ash",
  "Elm",
  "Redwood",
  "Eucalyptus",
  "Fir",
  "Other"
];

export function FieldWorkerDashboard() {
  const entries = useQuery(api.entries.listMine);
  const createEntry = useMutation(api.entries.create);
  const deleteEntry = useMutation(api.entries.remove);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    treeCount: "",
    species: "",
    location: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.treeCount || !formData.species || !formData.location) return;

    setLoading(true);
    try {
      await createEntry({
        treeCount: parseInt(formData.treeCount),
        species: formData.species,
        location: formData.location,
        notes: formData.notes || undefined
      });
      setFormData({ treeCount: "", species: "", location: "", notes: "" });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: Id<"entries">) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteEntry({ id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add entry button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto px-6 py-4 btn-forest text-cream font-serif rounded-xl flex items-center justify-center gap-3 animate-fade-in"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="text-lg">Log Tree Planting</span>
        </button>
      )}

      {/* Entry form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 organic-border paper-texture animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl md:text-2xl text-forest">New Entry</h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-sage/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-bark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="block font-serif text-sm text-bark mb-2">
                  Number of Trees *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.treeCount}
                  onChange={(e) => setFormData({ ...formData, treeCount: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/50 border border-sage/30 rounded-xl font-serif text-forest placeholder-bark/40"
                  placeholder="e.g., 50"
                />
              </div>

              <div>
                <label className="block font-serif text-sm text-bark mb-2">
                  Tree Species *
                </label>
                <select
                  required
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/50 border border-sage/30 rounded-xl font-serif text-forest"
                >
                  <option value="">Select species</option>
                  {TREE_SPECIES.map((species) => (
                    <option key={species} value={species}>{species}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-serif text-sm text-bark mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-cream/50 border border-sage/30 rounded-xl font-serif text-forest placeholder-bark/40"
                placeholder="e.g., North Ridge, Section B"
              />
            </div>

            <div>
              <label className="block font-serif text-sm text-bark mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-cream/50 border border-sage/30 rounded-xl font-serif text-forest placeholder-bark/40 resize-none"
                placeholder="Any additional details..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 btn-forest text-cream font-serif rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Entry</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-sage/20 text-forest font-serif rounded-xl hover:bg-sage/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries list */}
      <div className="space-y-4">
        <h2 className="font-display text-xl md:text-2xl text-forest">Your Entries</h2>

        {entries === undefined ? (
          <div className="flex justify-center py-12">
            <svg className="w-8 h-8 text-moss animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-sage/20">
            <svg className="w-16 h-16 text-sage mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L8 8H4L8 14H2L12 22L22 14H16L20 8H16L12 2Z" opacity="0.3" />
            </svg>
            <p className="font-serif text-bark/60 text-lg">No entries yet</p>
            <p className="font-serif text-bark/40 text-sm mt-1">Start logging your tree plantings!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry: Entry, index: number) => (
              <div
                key={entry._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-sage/20 card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-display text-lg md:text-xl text-forest">
                        {entry.treeCount.toLocaleString()} {entry.species}
                      </span>
                      <StatusBadge status={entry.status} />
                    </div>
                    <p className="font-serif text-bark/70 text-sm flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="truncate">{entry.location}</span>
                    </p>
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
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {entry.status === "pending" && (
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="p-2 text-bark/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
                      title="Delete entry"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
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
