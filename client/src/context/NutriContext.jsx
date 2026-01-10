import { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Import Sample Images
import biscuitsImg from '../assets/biscuits.png';
import noodlesImg from '../assets/noodles.png';
import ketchupImg from '../assets/ketchup.png';
import chocolateImg from '../assets/Chco.jpg';
import cocaImg from '../assets/coca.jpg';
import cerealsImg from '../assets/cereals.jpg';


const NutriContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    console.warn("⚠️ VITE_API_URL is not defined in your .env file! Frontend will fail to connect to backend.");
}

export function NutriProvider({ children }) {
    // --- STATE ---
    const [viewState, setViewState] = useState('HERO'); // 'HERO', 'INPUT', 'REASONING', 'CHAT'
    const [analysisResult, setAnalysisResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [isChatting, setIsChatting] = useState(false);
    const [capturedImageSrc, setCapturedImageSrc] = useState(null);
    const [chatAbortController, setChatAbortController] = useState(null);
    const [analysisAbortController, setAnalysisAbortController] = useState(null);

    // Synchronize with history API
    useEffect(() => {
        const handlePopState = (event) => {
            const newView = (event.state && event.state.view) ? event.state.view : 'HERO';
            setViewState(newView);

            // Clear specific data when moving back to selection or home
            if (newView === 'INPUT' || newView === 'HERO') {
                setAnalysisResult(null);
                setChatHistory([]);
                setCapturedImageSrc(null);
                setErrorMsg(null);
            }
        };

        window.addEventListener('popstate', handlePopState);

        // Push initial state
        window.history.replaceState({ view: 'HERO' }, '');

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const changeViewState = useCallback((newView, replace = false) => {
        setViewState(newView);
        if (replace) {
            window.history.replaceState({ view: newView }, '');
        } else {
            window.history.pushState({ view: newView }, '');
        }
    }, []);


    // --- ACTIONS ---

    const startApp = () => {
        changeViewState('INPUT');
    };

    const cancelAll = useCallback(() => {
        if (analysisAbortController) {
            analysisAbortController.abort();
            setAnalysisAbortController(null);
        }
        if (chatAbortController) {
            chatAbortController.abort();
            setChatAbortController(null);
        }
        setIsChatting(false);
    }, [analysisAbortController, chatAbortController]);


    const performAnalysis = async (payload) => {
        // Abort previous if any
        if (analysisAbortController) {
            analysisAbortController.abort();
        }

        const controller = new AbortController();
        setAnalysisAbortController(controller);

        // Use replace for loading state so Back skips it
        changeViewState('REASONING', true);
        setErrorMsg(null);

        // Clear old chat history on new analysis
        setChatHistory([]);

        try {
            const res = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            const data = await res.json();

            if (data.error) throw new Error(data.details || data.error);

            setAnalysisResult(data);
            // Replace loading with results so Back goes to INPUT
            changeViewState('CHAT', true);
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Analysis aborted');
                return;
            }
            console.error(err);
            setErrorMsg(err.message || "Something went wrong.");
            changeViewState('INPUT', true);
        } finally {
            setAnalysisAbortController(null);
        }
    };



    const sendChatMessage = async (message) => {
        // Abort any previous request just in case
        if (chatAbortController) {
            chatAbortController.abort();
        }
        const controller = new AbortController();
        setChatAbortController(controller);
        setIsChatting(true);
        // Update local history immediately for UI
        const newHistory = [...chatHistory, { role: 'user', parts: [message] }];
        setChatHistory(newHistory);

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    // Send previous history as context
                    history: chatHistory,
                    // Send analysis context so the model knows what was scanned
                    context: analysisResult ? JSON.stringify(analysisResult) : null
                }),
                signal: controller.signal
            });

            const data = await res.json();
            if (data.error) throw new Error(data.details || data.error);

            // Add model response
            setChatHistory(prev => [
                ...prev,
                { role: 'model', parts: [data.reply] }
            ]);
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Chat request aborted by user');
                // Do not add any response when aborted
            } else {
                console.error('Chat failed', err);
                setChatHistory(prev => [
                    ...prev,
                    { role: 'model', parts: ["Sorry, I couldn't connect. Please try again."] }
                ]);
            }
        } finally {
            setIsChatting(false);
            setChatAbortController(null);
        }
    };

    const cancelChat = () => {
        if (chatAbortController) {
            chatAbortController.abort();
            setChatAbortController(null);
        }
        setIsChatting(false);
    };

    const resetFlow = () => {
        cancelAll();
        changeViewState('INPUT');
        setAnalysisResult(null);
        setErrorMsg(null);
        setChatHistory([]);
        setCapturedImageSrc(null);
    };

    const goBack = () => {
        cancelAll();
        window.history.back();
    };


    const goHome = () => {
        changeViewState('HERO');
        setAnalysisResult(null);
        setErrorMsg(null);
        setChatHistory([]);
        setCapturedImageSrc(null);
    }


    // --- HELPERS ---
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const uploadImage = async (file) => {
        try {
            const base64 = await toBase64(file);
            setCapturedImageSrc(base64); // Store for display
            await performAnalysis({ image_base64: base64.split(',')[1] });
        } catch (err) {
            setErrorMsg("Failed to read image.");
        }
    };

    const analyzeText = async (text) => {
        setCapturedImageSrc(null); // No image for text analysis
        await performAnalysis({ ingredients: text });
    };

    const analyzeCameraCapture = async (base64DataUrl) => {
        setCapturedImageSrc(base64DataUrl); // Store for display
        await performAnalysis({ image_base64: base64DataUrl.split(',')[1] });
    };

    const analyzeSample = async (id) => {
        // Map sample IDs to imported images
        const sampleImages = {
            'sample_01': biscuitsImg,
            'sample_02': noodlesImg,
            'sample_04': cocaImg,
            'sample_05': ketchupImg,
            'sample_06': cerealsImg,
            'sample_07': chocolateImg
        };

        const imageToUse = sampleImages[id] || "https://placehold.co/600x400/2e1065/FFF?text=Sample+Product";

        setCapturedImageSrc(imageToUse);
        await performAnalysis({ sample_id: id });
    };

    const value = {
        viewState,
        setViewState: changeViewState, // Use the history-aware version
        analysisResult,
        errorMsg,
        setErrorMsg,
        startApp,
        goHome,
        goBack,
        uploadImage,
        analyzeText,
        analyzeCameraCapture,
        analyzeSample,
        resetFlow,
        chatHistory,
        sendChatMessage,
        cancelChat,
        cancelAll,
        capturedImageSrc
    };


    return (
        <NutriContext.Provider value={value}>
            {children}
        </NutriContext.Provider>
    );
}

export function useNutri() {
    return useContext(NutriContext);
}
