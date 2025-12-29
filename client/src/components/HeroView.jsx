import { useNutri } from '../context/NutriContext';
import logo from '../assets/naiveui.svg';

export default function HeroView() {
    const { startApp } = useNutri();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full animate-in fade-in duration-700">

            {/* 3D Card Container */}
            <div className="group relative w-full max-w-md perspective-1000">

                {/* The Card - Glassmorphism Violet Dark */}
                <div className="relative bg-indigo-950/40 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500 transform preserve-3d border border-indigo-500/20 ring-1 ring-white/10 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:border-violet-400/50">

                    {/* Content */}
                    <div className="flex flex-col items-center text-center space-y-8">

                        {/* Top Section */}
                        <div className="space-y-4">
                            {/* Logo / Icon */}
                            <div className="flex items-center justify-center gap-4 transform transition-transform group-hover:scale-110 duration-500 mx-auto">
                                <img src={logo} alt="NutriAI Logo" className="w-14 h-14 md:w-16 md:h-16 drop-shadow-md brightness-110 filter" />
                                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-xl gradient-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">NutriAI</span>
                            </div>

                            {/* Main Headline */}
                            <h1 className="text-3xl md:text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
                                Show the ingredients.<br />We’ll explain.
                            </h1>

                            {/* Sub-text */}
                            <p className="text-indigo-200 leading-relaxed text-sm md:text-base max-w-xs mx-auto font-light">
                                NutriAI helps you understand food labels in simple language, right when you need to decide.
                            </p>
                        </div>

                        {/* Primary Button - Gradient */}
                        <div className="w-full space-y-3">
                            <button
                                onClick={startApp}
                                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/50 hover:shadow-xl hover:shadow-indigo-500/50 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer ring-offset-2 ring-offset-indigo-950 hover:ring-2 ring-indigo-400 text-base md:text-lg border border-transparent"
                            >
                                Try it now
                            </button>
                            <p className="text-xs text-indigo-400 font-medium tracking-wide">
                                No sign-up required
                            </p>
                        </div>

                        {/* How it works (Small) */}
                        <div className="w-full text-left space-y-4 pt-4 border-t border-indigo-500/30">
                            <p className="text-xs font-bold text-indigo-300 tracking-widest text-center mb-2 uppercase">
                                How NutriAI works
                            </p>

                            <div className="space-y-3 text-sm">
                                {/* Step 1 Card: Upload (Rose Theme) */}
                                <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 flex gap-3 items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-rose-900/20 cursor-default">
                                    <span className="font-extrabold text-white bg-rose-600 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-sm">1</span>
                                    <div className="text-left">
                                        <span className="font-bold text-rose-200 block">Show the ingredients</span>
                                        <p className="text-xs text-rose-100/70 mt-1 leading-relaxed">
                                            Upload a photo or paste the list.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 Card: AI (Indigo Theme) */}
                                <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 flex gap-3 items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-indigo-900/20 cursor-default">
                                    <span className="font-extrabold text-white bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-sm">2</span>
                                    <div className="text-left">
                                        <span className="font-bold text-indigo-200 block">AI understands</span>
                                        <p className="text-xs text-indigo-100/70 mt-1 leading-relaxed">
                                            We analyze additives & nutrition.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 Card: Explain (Purple Theme) */}
                                <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 flex gap-3 items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-900/20 cursor-default">
                                    <span className="font-extrabold text-white bg-purple-600 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-sm">3</span>
                                    <div className="text-left">
                                        <span className="font-bold text-purple-200 block">Get clear explanation</span>
                                        <p className="text-xs text-purple-100/70 mt-1 leading-relaxed">
                                            Simple facts, no confusion.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 4 Card: Action (Emerald Theme) */}
                                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex gap-3 items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-900/20 cursor-default">
                                    <span className="font-extrabold text-white bg-emerald-600 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-sm">4</span>
                                    <div className="text-left">
                                        <span className="font-bold text-emerald-200 block">Eat with confidence</span>
                                        <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                                            Make choices good for your body.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
