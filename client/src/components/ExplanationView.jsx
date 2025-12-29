import { useNutri } from '../context/NutriContext';

export default function ExplanationView() {
    const { analysisResult, resetFlow, setViewState } = useNutri();

    if (!analysisResult) return null;
    const data = analysisResult;
    const points = data.key_points || [];

    return (
        <div className="max-w-md w-full animate-in slide-in-from-bottom-5 duration-700">
            {/* Glassmorphism Card - Violet Dark */}
            <div className="bg-indigo-950/40 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-indigo-500/20 ring-1 ring-white/10 relative overflow-hidden">

                {/* Back Button (Inside Card) */}
                <button
                    onClick={resetFlow}
                    className="absolute top-6 left-6 text-indigo-300 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/10"
                    title="Back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>

                <div className="space-y-8 mt-4">

                    {/* Header: Score + Summary */}
                    <div className="flex gap-6 items-center pt-2">

                        {/* Left: Health Score Circle */}
                        {data.health_score !== undefined && (
                            <div className="shrink-0 relative w-20 h-20 flex items-center justify-center">
                                {/* SVG Circle Progress */}
                                <svg className="transform -rotate-90 w-20 h-20">
                                    <circle
                                        cx="40" cy="40" r="36"
                                        stroke="currentColor" strokeWidth="8" fill="transparent"
                                        className="text-indigo-950/50" // Track color
                                    />
                                    <circle
                                        cx="40" cy="40" r="36"
                                        stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={36 * 2 * Math.PI}
                                        strokeDashoffset={36 * 2 * Math.PI - (data.health_score / 100) * (36 * 2 * Math.PI)}
                                        strokeLinecap="round"
                                        className={`${data.health_score >= 70 ? "text-emerald-500" :
                                            data.health_score >= 40 ? "text-amber-400" :
                                                "text-rose-500"
                                            } drop-shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-2xl font-extrabold ${data.health_score >= 70 ? "text-emerald-400" :
                                        data.health_score >= 40 ? "text-amber-300" :
                                            "text-rose-400"
                                        }`}>
                                        {data.health_score}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Right: Rich Text Summary */}
                        <div className="text-left space-y-2 flex-1">
                            <div className="inline-flex items-center justify-center bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider text-indigo-200 uppercase shadow-sm backdrop-blur-sm">
                                Assessment
                            </div>
                            <h2 className="text-lg md:text-xl font-bold leading-snug text-white drop-shadow-md">
                                {(() => {
                                    // Parse tags: {neg}...{/neg}, {pos}...{/pos}, {med}...{/med}
                                    const text = data.summary || "";
                                    const parts = text.split(/(\{.*?\}.*?\{\/.*?\})/g);

                                    return parts.map((part, i) => {
                                        if (part.startsWith("{neg}")) {
                                            return <span key={i} className="text-rose-400 font-extrabold drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">{part.replace(/\{.*?\}/g, "")}</span>;
                                        }
                                        if (part.startsWith("{pos}")) {
                                            return <span key={i} className="text-emerald-400 font-extrabold drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">{part.replace(/\{.*?\}/g, "")}</span>;
                                        }
                                        if (part.startsWith("{med}")) {
                                            return <span key={i} className="text-amber-400 font-extrabold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">{part.replace(/\{.*?\}/g, "")}</span>;
                                        }
                                        return part;
                                    });
                                })()}
                            </h2>
                        </div>
                    </div>

                    {/* Reasoning Points */}
                    <div className="space-y-3">
                        {points.map((point, idx) => {
                            // Determine color based on impact
                            let textColor = "text-amber-400"; // Default to Yellow (Caution/Neutral)
                            let dotColor = "bg-amber-500 shadow-amber-500/50";

                            if (point.impact === 'positive') {
                                textColor = "text-emerald-400"; // Green for Healthy
                                dotColor = "bg-emerald-500 shadow-emerald-500/50";
                            } else if (point.impact === 'negative') {
                                textColor = "text-rose-400"; // Red for Dangerous
                                dotColor = "bg-rose-500 shadow-rose-500/50";
                            } else {
                                // Explicitly handle 'neutral' or fallback as Yellow/Amber per user request
                                // "if healthy then green if not then yellow"
                                textColor = "text-amber-400";
                                dotColor = "bg-amber-400 shadow-amber-500/50";
                            }

                            return (
                                <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 flex gap-4 items-start transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-900/20 hover:bg-white/10 hover:border-indigo-400/30 cursor-default">
                                    <div className={`mt-1.5 min-w-[10px] h-[10px] rounded-full shrink-0 shadow-sm ${dotColor}`} />
                                    <div>
                                        <h3 className={`font-bold text-base ${textColor} drop-shadow-sm`}>{point.ingredient}</h3>
                                        <p className="text-sm text-indigo-100/80 leading-relaxed mt-0.5 font-light">{point.why_it_matters}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Decision Guidance */}
                    {data.decision_guidance && (
                        <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 p-5 rounded-xl border border-rose-500/20 backdrop-blur-sm">
                            <h4 className="text-xs font-extrabold text-rose-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"></span>
                                Suggestion
                            </h4>
                            <ul className="space-y-2">
                                {data.decision_guidance.map((dg, i) => (
                                    <li key={i} className="flex gap-2 text-rose-100 text-sm font-light">
                                        <span className="text-rose-400 font-bold">↳</span> {dg}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action */}
                    <div className="pt-2">
                        <button
                            onClick={resetFlow}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-900/50 hover:shadow-xl hover:shadow-indigo-500/50 transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-offset-2 ring-offset-indigo-950 hover:ring-2 ring-indigo-400 border border-transparent"
                        >
                            Analyze Another Product
                        </button>

                        <button
                            onClick={() => setViewState('CHAT')} // Correct way to switch views from context
                            className="w-full mt-3 py-4 rounded-xl bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all flex items-center justify-center gap-2 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            Ask Follow-up Question
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
