import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 pb-16">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-forest rounded-full mb-4 shadow-lg">
            <svg className="w-12 h-12 text-cream" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L8 8H4L8 14H2L12 22L22 14H16L20 8H16L12 2Z" />
            </svg>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-forest mb-2">Canopy</h1>
          <p className="font-serif text-bark/70 text-lg">Forestry Tracking System</p>
        </div>

        {/* Auth card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 organic-border paper-texture animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display text-2xl text-forest mb-6 text-center">
            {flow === "signIn" ? "Welcome Back" : "Join the Forest"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block font-serif text-sm text-bark mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-cream/50 border border-sage/30 rounded-xl font-serif text-forest placeholder-bark/40 transition-all"
                placeholder="forester@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-serif text-sm text-bark mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-cream/50 border border-sage/30 rounded-xl font-serif text-forest placeholder-bark/40 transition-all"
                placeholder="Min. 6 characters"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-serif">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 btn-forest text-cream font-serif text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{flow === "signIn" ? "Sign In" : "Create Account"}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setFlow(flow === "signIn" ? "signUp" : "signIn");
                setError(null);
              }}
              className="font-serif text-moss hover:text-forest transition-colors"
            >
              {flow === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-sage/20">
            <button
              type="button"
              onClick={() => signIn("anonymous")}
              className="w-full py-3 bg-sage/20 hover:bg-sage/30 text-forest font-serif rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              <span>Continue as Guest</span>
            </button>
          </div>
        </div>

        {/* Decorative trees */}
        <div className="flex justify-center gap-4 mt-8 opacity-20">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg
              key={i}
              className={`w-6 h-12 text-forest animate-grow stagger-${i}`}
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              viewBox="0 0 24 48"
              fill="currentColor"
            >
              <path d="M12 0L6 12H8L4 24H8L2 36H10V48H14V36H22L16 24H20L16 12H18L12 0Z" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}
