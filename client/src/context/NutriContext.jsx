import { createContext, useState, useContext } from 'react';

const NutriContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    console.warn("⚠️ VITE_API_URL is not defined in your .env file! Frontend will fail to connect to backend.");
}

export function NutriProvider({ children }) {
    // --- STATE ---
    const [viewState, setViewState] = useState('HERO'); // 'HERO', 'INPUT', 'REASONING', 'EXPLANATION'
    const [analysisResult, setAnalysisResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [isChatting, setIsChatting] = useState(false);
    const [capturedImageSrc, setCapturedImageSrc] = useState(null);
    const [chatAbortController, setChatAbortController] = useState(null);

    // --- ACTIONS ---

    const startApp = () => {
        setViewState('INPUT');
    };

    const performAnalysis = async (payload) => {
        setViewState('REASONING');
        setErrorMsg(null);
        // Clear old chat history on new analysis
        setChatHistory([]);

        try {
            const res = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.error) throw new Error(data.details || data.error);

            setAnalysisResult(data);
            setViewState('CHAT'); // Dashboard is now the primary view
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Something went wrong.");
            setViewState('INPUT');
        }
    };


    const sendChatMessage = async (message) => {
        // Abort any previous request just in case
        if (chatAbortController) {
            chatAbortController.abort();
            setChatAbortController(null);
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
        }
        setIsChatting(false);
    };

    const resetFlow = () => {
        setViewState('INPUT');
        setAnalysisResult(null);
        setErrorMsg(null);
        setChatHistory([]);
        setCapturedImageSrc(null);
    };

    const goHome = () => {
        setViewState('HERO');
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
        // For now, use a generic placeholder or fetch the sample image URL if available
        // Since we don't have the image bytes locally for the sample, we can use a placeholder
        // or just not show an image.
        // Let's use a placeholder for the sample.
        setCapturedImageSrc("https://placehold.co/600x400/2e1065/FFF?text=Sample+Product");
        await performAnalysis({ sample_id: id });
    };

    const value = {
        viewState,
        setViewState, // Exposed to allow manual switching to CHAT
        analysisResult,
        errorMsg,
        setErrorMsg,
        startApp,
        goHome,
        uploadImage,
        analyzeText,
        analyzeCameraCapture,
        analyzeSample,
        resetFlow,
        chatHistory,
        sendChatMessage,
        cancelChat,
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
