import { useNutri } from '../context/NutriContext';
import InputView from '../components/InputView';
import ReasoningView from '../components/ReasoningView';
import HeroView from '../components/HeroView';
import ChatView from '../components/ChatView';

export default function Home() {
    const { viewState, errorMsg, setErrorMsg } = useNutri();

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-violet-950 via-purple-950 to-indigo-950 overflow-hidden text-white flex flex-col items-center justify-center p-6 transition-all duration-500 selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
            {/* BACK BUTTON */}
            {viewState !== 'HERO' && (
                <button
                    onClick={() => window.history.back()}
                    className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all active:scale-95 shadow-lg group pointer-events-auto"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
                </button>
            )}

            {/* Animated Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* ERROR TOAST */}
            {errorMsg && (
                <div className="fixed top-5 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm shadow animate-bounce">
                    {errorMsg}
                    <button onClick={() => setErrorMsg(null)} className="ml-2 font-bold">&times;</button>
                </div>
            )}

            {/* STATE 0: HERO */}
            {viewState === 'HERO' && <HeroView />}

            {/* STATE 1: INPUT */}
            {viewState === 'INPUT' && <InputView />}

            {/* STATE 2: REASONING */}
            {viewState === 'REASONING' && <ReasoningView />}

            {/* STATE 4: CHAT (Now the Dashboard) */}
            {viewState === 'CHAT' && <ChatView />}
        </div>
    );
}
