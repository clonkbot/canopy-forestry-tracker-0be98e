import { useState } from "react";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

export function ProfileSetup() {
  const createProfile = useMutation(api.profiles.create);
  const { signOut } = useAuthActions();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"fieldWorker" | "supervisor">("fieldWorker");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await createProfile({ name: name.trim(), role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 pb-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-moss rounded-full mb-4 shadow-lg">
            <svg className="w-10 h-10 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-forest mb-2">Complete Your Profile</h1>
          <p className="font-serif text-bark/70">Tell us a bit about yourself</p>
        </div>

        {/* Form card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 organic-border paper-texture animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block font-serif text-sm text-bark mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-cream/50 border border-sage/30 rounded-xl font-serif text-forest placeholder-bark/40 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block font-serif text-sm text-bark mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("fieldWorker")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    role === "fieldWorker"
                      ? "border-forest bg-forest/5"
                      : "border-sage/30 hover:border-sage/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      role === "fieldWorker" ? "bg-forest text-cream" : "bg-sage/20 text-moss"
                    }`}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L8 8H4L8 14H2L12 22L22 14H16L20 8H16L12 2Z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-display text-base ${role === "fieldWorker" ? "text-forest" : "text-bark"}`}>
                        Field Worker
                      </p>
                      <p className="text-xs text-bark/60 font-serif">Log tree plantings</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("supervisor")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    role === "supervisor"
                      ? "border-forest bg-forest/5"
                      : "border-sage/30 hover:border-sage/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      role === "supervisor" ? "bg-forest text-cream" : "bg-sage/20 text-moss"
                    }`}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-display text-base ${role === "supervisor" ? "text-forest" : "text-bark"}`}>
                        Supervisor
                      </p>
                      <p className="text-xs text-bark/60 font-serif">Review & approve</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-serif">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3.5 btn-forest text-cream font-serif text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Creating Profile...</span>
                </>
              ) : (
                <span>Get Started</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-sage/20 text-center">
            <button
              onClick={() => signOut()}
              className="font-serif text-sm text-bark/60 hover:text-forest transition-colors"
            >
              Sign out and use different account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
