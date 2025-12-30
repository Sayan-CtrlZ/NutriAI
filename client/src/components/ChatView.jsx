import { useState, useRef, useEffect } from 'react';
import { useNutri } from '../context/NutriContext';

export default function ChatView() {
    const { chatHistory, sendChatMessage, isChatting, cancelChat, analysisResult, setViewState, capturedImageSrc, resetFlow } = useNutri();
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    // Scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = () => {
        if (!input.trim() || isChatting) return;
        sendChatMessage(input);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    // Helper to format rich text in summary
    const renderSummary = (text) => {
        if (!text) return null;
        const cleanText = text.replace(/\{.*?\}/g, ""); // Clean raw tags
        return cleanText;
    };

    // Helper to render colored tags
    const renderRichSummary = (text) => {
        if (!text) return null;
        const parts = text.split(/(\{.*?\}.*?\{\/.*?\})/g);
        return parts.map((part, i) => {
            if (part.startsWith("{neg}")) {
                return <span key={i} className="text-rose-400 font-bold">{part.replace(/\{.*?\}/g, "")}</span>;
            }
            if (part.startsWith("{pos}")) {
                return <span key={i} className="text-emerald-400 font-bold">{part.replace(/\{.*?\}/g, "")}</span>;
            }
            if (part.startsWith("{med}")) {
                return <span key={i} className="text-amber-400 font-bold">{part.replace(/\{.*?\}/g, "")}</span>;
            }
            return part;
        });
    }

    return (
        <div className="w-full max-w-full md:max-w-[95%] mx-auto flex flex-col md:flex-row items-stretch gap-4 px-1 md:px-12 p-0 md:p-10 animate-in slide-in-from-bottom-5 duration-700 h-auto md:h-[90vh] md:max-h-[1000px] rounded-none md:rounded-xl chat-view-wrapper">

            {/* LEFT PANEL: Image & Assessment */}
            <div className="flex flex-col w-full md:w-[62%] h-auto md:h-full gap-4 pr-0 md:pr-2 flex-none md:flex-1 min-h-0 overflow-visible md:px-0 md:pt-0">

                {/* Unified Dashboard Card (Desktop) / Transparent Container (Mobile) */}
                {/* Unified Dashboard Card (Desktop) / Transparent Container (Mobile) */}
                <div className="contents md:flex md:flex-col md:gap-4 md:flex-1 md:bg-indigo-950/40 md:backdrop-blur-xl md:p-6 md:shadow-xl md:overflow-hidden md:min-h-0 md:rounded-3xl md:h-full md:border md:border-indigo-500/20">

                    {/* MOBILE CARD 1: Image & Verdict */}
                    <div className="w-full bg-slate-900/40 backdrop-blur-md p-4 md:p-0 rounded-2xl md:bg-transparent md:rounded-none flex flex-col md:flex-row gap-4 h-auto md:h-48 shrink-0 border border-white/20 md:border-none">
                        {/* Image */}
                        {capturedImageSrc && (
                            <div className="w-full md:w-1/3 h-48 md:h-full rounded-2xl overflow-hidden relative border border-white/5 shadow-inner group shrink-0">
                                <img
                                    src={capturedImageSrc}
                                    alt="Analyzed Product"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                    <span className="text-white/90 text-[10px] font-bold uppercase tracking-widest">Scan</span>
                                </div>
                            </div>
                        )}

                        {/* Verdict Summary */}
                        <div className="flex-none md:flex-1 w-full flex flex-col justify-center gap-3">
                            <div className="flex items-center gap-3">
                                {analysisResult?.health_score !== undefined && (
                                    <div className="shrink-0 relative w-14 h-14 flex items-center justify-center">
                                        <svg className="transform -rotate-90 w-14 h-14">
                                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-900/50" />
                                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="5" fill="transparent"
                                                strokeDasharray={24 * 2 * Math.PI}
                                                strokeDashoffset={24 * 2 * Math.PI - (analysisResult.health_score / 100) * (24 * 2 * Math.PI)}
                                                strokeLinecap="round"
                                                className={`${analysisResult.health_score >= 85 ? "text-emerald-500" :
                                                    analysisResult.health_score >= 65 ? "text-lime-500" :
                                                        analysisResult.health_score >= 40 ? "text-amber-400" :
                                                            "text-rose-500"
                                                    }`}
                                            />
                                        </svg>
                                        <span className="absolute text-sm font-bold text-white">{analysisResult.health_score}</span>
                                    </div>
                                )}
                                <div>
                                    <div className="text-xs text-white/60 uppercase tracking-wider font-bold">Health Score</div>
                                    <h3 className="font-bold text-white text-lg leading-tight break-words pl-2">
                                        {analysisResult?.health_score >= 85 ? "Excellent Choice" :
                                            analysisResult?.health_score >= 65 ? "Good Choice" :
                                                analysisResult?.health_score >= 40 ? "Moderate" : "Changes Recommended"}
                                    </h3>
                                </div>
                            </div>
                            <div className="text-xs text-white leading-relaxed break-words px-1 pl-4">
                                {renderRichSummary(analysisResult?.summary)}
                            </div>
                        </div>
                    </div>

                    {/* Divider (Desktop Only) */}
                    <div className="hidden md:block h-px bg-slate-500/20 w-full shrink-0" />

                    {/* MOBILE CARD 2: Ingredients */}
                    {analysisResult?.key_points?.length > 0 && (
                        <div className="w-full bg-slate-900/40 backdrop-blur-md p-4 md:p-0 rounded-2xl md:bg-transparent md:rounded-none flex flex-col space-y-3 flex-none md:flex-1 overflow-visible md:overflow-y-auto pr-0 md:pr-2 scrollbar-track-transparent h-auto md:min-h-0 border border-white/20 md:border-none">
                            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 sticky top-0 md:bg-slate-900/90 bg-transparent backdrop-blur-md py-1 z-10 pl-7">Key Ingredients</h4>
                            {analysisResult.key_points.map((point, idx) => {
                                let textColor = "text-amber-400";
                                let dotColor = "bg-amber-500";

                                if (point.impact === 'positive') {
                                    textColor = "text-emerald-400";
                                    dotColor = "bg-emerald-500";
                                } else if (point.impact === 'negative') {
                                    textColor = "text-rose-400";
                                    dotColor = "bg-rose-500";
                                }

                                return (
                                    <div key={idx} className="bg-white/5 py-3 pr-3 pl-5 mx-2 rounded-lg border border-white/10 flex gap-3 items-start hover:bg-white/10 transition-colors">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor} mt-1.5`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className={`text-lg font-bold ${textColor}`}>{point.ingredient}</h4>
                                            </div>
                                            <p className="text-sm text-white leading-relaxed mt-1 opacity-90 break-words pl-1">{renderRichSummary(point.why_it_matters)}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Analyze Another Button - Moved to Bottom (Before Chat on Mobile) */}
                    <div className="px-2 pb-2 md:pt-2">
                        <button
                            onClick={resetFlow}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/50 hover:shadow-xl hover:shadow-indigo-500/50 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer ring-offset-2 ring-offset-indigo-950 hover:ring-2 ring-indigo-400 text-sm uppercase tracking-widest border border-transparent shrink-0"
                        >
                            Analyze Another Product
                        </button>
                    </div>

                </div>
            </div>

            {/* RIGHT PANEL: Chat Interface */}
            <div className="w-full md:w-[38%] flex flex-col bg-indigo-950/40 backdrop-blur-xl rounded-3xl md:rounded-3xl relative overflow-hidden flex-1 min-h-[450px] border border-white/5">
                {/* Header */}
                <div className="p-5 border-b border-white/10 bg-white/5 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-violet-500 to-indigo-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-lg">AI Nutrition Assistant</h2>
                        <p className="text-white/60 text-xs">Ask anything about your analysis</p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-600/20 scrollbar-track-transparent">
                    {/* Welcome / Context Bubble */}
                    {/* Initial AI summary message */}
                    {(!chatHistory.length && analysisResult?.summary) && (
                        <div className="flex justify-start mb-4">
                            <div className={`max-w-[90%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words
                          bg-white/10 text-slate-50 rounded-tl-none border border-white/10 shadow-slate-900/20 backdrop-blur-md`}
                            >
                                {renderSummary(analysisResult?.summary)}
                            </div>
                        </div>
                    )}

                    {chatHistory.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div
                                    className={`
                                        max-w-[90%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words
                                        ${isUser
                                            ? 'bg-slate-700 text-white rounded-tr-none shadow-slate-900/20'
                                            : 'bg-white/10 text-white rounded-tl-none border border-white/10 shadow-slate-900/20 backdrop-blur-md'
                                        }
                                    `}
                                >
                                    {msg.parts[0]}
                                </div>
                            </div>
                        );
                    })}

                    {isChatting && (
                        <div className="flex items-center space-x-2">
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                            <button onClick={cancelChat} className="text-sm text-indigo-300 hover:text-indigo-100 transition-colors">Cancel</button>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-5 border-t border-white/10 bg-slate-900/30">
                    <div className="flex gap-3 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your question..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white/10 transition-all font-light"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isChatting}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:grayscale-[0.5] text-white rounded-xl transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center group hover:scale-105 active:scale-95 cursor-pointer ring-offset-2 ring-offset-indigo-950 hover:ring-2 ring-indigo-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
