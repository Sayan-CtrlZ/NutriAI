import { useState, useEffect } from 'react';
import { useNutri } from '../context/NutriContext';

export default function ReasoningView() {
    const { resetFlow } = useNutri();
    const [text, setText] = useState("Reading ingredients...");

    useEffect(() => {
        const timers = [
            setTimeout(() => setText("Identifying additives..."), 1500),
            setTimeout(() => setText("Checking health impact..."), 3000),
            setTimeout(() => setText("Forming opinion..."), 4500),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
            <div className="bg-indigo-950/40 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-indigo-500/20 ring-1 ring-white/10 text-center space-y-8 flex flex-col items-center">

                {/* Spinner */}
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin shadow-lg shadow-indigo-500/20"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-b-fuchsia-400 rounded-full animate-spin direction-reverse duration-1000"></div>
                </div>

                <p className="text-xl font-light text-white animate-pulse drop-shadow-md">{text}</p>

                <button
                    onClick={resetFlow}
                    className="text-sm text-indigo-300 hover:text-white underline hover:cursor-pointer transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
