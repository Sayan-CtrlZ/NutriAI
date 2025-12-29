import { useState, useRef, useCallback, useEffect } from 'react';

import Webcam from 'react-webcam';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useNutri } from '../context/NutriContext';
import getCroppedImg from '../utils/cropImage';
import logo from '../assets/naiveui.svg';
import cameraIcon from '../assets/camera.svg';
import uploadIcon from '../assets/upload.svg';
import pasteIcon from '../assets/paste.svg';
import sampleIcon from '../assets/sample.svg';
import switchIcon from '../assets/switch.svg';

export default function InputView() {
    const { uploadImage, analyzeText, analyzeCameraCapture, analyzeSample } = useNutri();

    const fileInputRef = useRef(null);
    const uploadInputRef = useRef(null);
    const webcamRef = useRef(null);
    const imgRef = useRef(null);

    const [activeMode, setActiveMode] = useState(null); // 'paste' | 'sample' | null
    const [scanning, setScanning] = useState(false);
    const [facingMode, setFacingMode] = useState("environment");
    const [capturedImage, setCapturedImage] = useState(null);
    const [textVal, setTextVal] = useState("");
    const [flashOn, setFlashOn] = useState(false);


    // ReactCrop state
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);

    const toggleCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
        setFlashOn(false); // Reset flash when switching cameras
    };

    const turnOffFlash = async (wasOn, webcam) => {
        if (wasOn && webcam?.current) {
            const videoTrack = webcam.current.video.srcObject?.getVideoTracks()[0];
            if (videoTrack) {
                try {
                    await videoTrack.applyConstraints({ advanced: [{ torch: false }] });
                } catch (e) {
                    console.error("Could not turn off torch:", e);
                }
            }
        }
    };

    const stopScanning = async () => {
        // Explicitly turn off torch hardware
        await turnOffFlash(flashOn, webcamRef);
        setScanning(false);
        setFlashOn(false);
    };

    // Sub-mode navigation sync
    useEffect(() => {
        const handlePop = () => {
            // Hardware back triggers a full stop
            setScanning(prev => {
                if (prev) {
                    // We can't easily wait for turnOffFlash here since setScanning is sync,
                    // but we can at least trigger the reset.
                    // The ref-based cleanup on unmount will handle the hardware.
                    return false;
                }
                return prev;
            });
            setFlashOn(false);
            setActiveMode(null);
            setCapturedImage(null);
        };

        window.addEventListener('popstate', handlePop);
        return () => {
            window.removeEventListener('popstate', handlePop);
        };
    }, []);

    // Dedicated Component Unmount Hardware Cleanup
    useEffect(() => {
        return () => {
            // Unconditionally try to stop torch on unmount
            if (webcamRef.current) {
                const videoTrack = webcamRef.current.video.srcObject?.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.applyConstraints({ advanced: [{ torch: false }] }).catch(() => { });
                }
            }
        };
    }, []);

    const enterMode = (mode) => {
        window.history.pushState({ mode }, '');
        if (mode === 'scan') {
            setScanning(true);
        } else {
            setActiveMode(mode);
        }
    };


    const toggleFlash = async () => {
        if (!webcamRef.current) return;
        const videoTrack = webcamRef.current.video.srcObject?.getVideoTracks()[0];
        if (videoTrack) {
            try {
                const capabilities = videoTrack.getCapabilities();
                if (capabilities.torch) {
                    await videoTrack.applyConstraints({
                        advanced: [{ torch: !flashOn }]
                    });
                    setFlashOn(!flashOn);
                } else {
                    console.warn("Torch not supported on this track");
                    alert("Flashlight not supported on this device/camera.");
                }
            } catch (err) {
                console.error("Flash error:", err);
            }
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setScanning(true);
        setCompletedCrop(null);
        setFlashOn(false);
    };

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        imgRef.current = e.currentTarget;

        // Default to a centered 80% crop
        const crawl = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 80,
                },
                3 / 4, // Initial aspect suggestion, but allowed to be free
                width,
                height
            ),
            width,
            height
        );
        setCrop(crawl);
    }

    const confirmAnalysis = async () => {
        if (capturedImage && completedCrop && imgRef.current) {
            try {
                // Scale the crop to the natural image size
                const image = imgRef.current;
                const scaleX = image.naturalWidth / image.width;
                const scaleY = image.naturalHeight / image.height;

                const pixelCrop = {
                    x: completedCrop.x * scaleX,
                    y: completedCrop.y * scaleY,
                    width: completedCrop.width * scaleX,
                    height: completedCrop.height * scaleY,
                };

                const croppedImage = await getCroppedImg(capturedImage, pixelCrop);
                analyzeCameraCapture(croppedImage);
            } catch (e) {
                console.error("Crop error:", e);
                analyzeCameraCapture(capturedImage);
            }
        } else if (capturedImage) {
            // Fallback if no crop is made (full image)
            analyzeCameraCapture(capturedImage);
        }
    };

    const handleUpload = (e) => {
        if (e.target.files[0]) uploadImage(e.target.files[0]);
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setScanning(false);
        }
    }, [webcamRef]);

    return (
        <div className="max-w-xl w-full animate-in fade-in zoom-in duration-500">
            {/* Glassmorphism Card - Violet Dark Theme */}
            <div className="bg-indigo-950/40 backdrop-blur-2xl rounded-3xl p-6 md:p-10 shadow-2xl border border-indigo-500/20 ring-1 ring-white/10 relative overflow-hidden">
                <div className="text-center space-y-8 relative z-10">
                    <div className="space-y-3">
                        {/* Header with Logo */}
                        <div className="flex items-center justify-center gap-3">
                            <img src={logo} alt="NutriAI Logo" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-sm brightness-110 filter" />
                            <h1 className="text-3xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">NutriAI</h1>
                        </div>
                        <p className="text-indigo-200 text-base md:text-lg font-light">Show me the ingredients.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Webcam Scanning & Preview Mode */}
                        {(scanning || capturedImage) && (
                            <div className="space-y-4 animate-in zoom-in duration-300">
                                <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl ring-2 ring-indigo-500/50 aspect-[2/3] md:aspect-video group">

                                    {scanning ? (
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            videoConstraints={{
                                                facingMode: facingMode,
                                                width: { ideal: 4096 },
                                                height: { ideal: 2160 }
                                            }}
                                            className="w-full h-full object-cover"
                                            onUserMediaError={() => setScanning(false)}
                                        />
                                    ) : (
                                        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                                            {/* ReactCrop Container */}
                                            <div className="max-h-full max-w-full">
                                                <ReactCrop
                                                    crop={crop}
                                                    onChange={(c) => setCrop(c)}
                                                    onComplete={(c) => setCompletedCrop(c)}
                                                    className="max-h-[50vh] md:max-h-[40vh]"
                                                >
                                                    <img
                                                        src={capturedImage}
                                                        onLoad={onImageLoad}
                                                        alt="Crop preview"
                                                        className="max-w-full max-h-[50vh] md:max-h-[40vh] object-contain"
                                                    />
                                                </ReactCrop>

                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay UI - Pointer events none ensures clicks pass through to Cropper */}
                                    <div className="absolute inset-0 pointer-events-none z-20">
                                        {/* Thin Vibrant Gradient Border - Fixed */}
                                        <div className="absolute inset-0 border-[3px] border-transparent rounded-xl"
                                            style={{
                                                background: 'linear-gradient(to right, #8b5cf6, #d946ef, #6366f1) border-box',
                                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                                WebkitMaskComposite: 'xor',
                                                maskComposite: 'exclude'
                                            }}
                                        ></div>

                                        {/* Scanning Animation (Only when scanning) */}
                                        {scanning && (
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.8)] animate-scan opacity-80"></div>
                                        )}

                                        {/* Flash Toggle Control */}
                                        {scanning && facingMode === "environment" && (
                                            <button
                                                onClick={toggleFlash}
                                                className={`absolute top-4 right-4 z-40 p-3 rounded-full backdrop-blur-md transition-all active:scale-90 border pointer-events-auto ${flashOn ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-black/40 text-white border-white/20 hover:bg-black/60'}`}
                                            >
                                                {flashOn ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                                )}
                                            </button>
                                        )}

                                        {/* Guide Text */}
                                        <div className="absolute bottom-28 w-full text-center">
                                            <p className="text-white/90 text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full inline-block backdrop-blur-md border border-white/10 shadow-lg">
                                                {scanning ? "Align ingredients within frame" : "Drag corners to crop"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="absolute bottom-0 left-0 w-full px-6 py-6 flex justify-between items-center bg-gradient-to-t from-black/90 via-black/60 to-transparent z-30">
                                        {scanning ? (
                                            <>
                                                <button
                                                    onClick={stopScanning}
                                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all active:scale-95"
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                </button>

                                                <button
                                                    onClick={capture}
                                                    className="w-20 h-20 rounded-full border-[3px] border-white/80 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 bg-white/5 backdrop-blur-sm group-hover:border-white"
                                                >
                                                    <div className="w-16 h-16 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                                                </button>

                                                <button
                                                    onClick={toggleCamera}
                                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
                                                >
                                                    <img src={switchIcon} alt="Switch" className="w-6 h-6 opacity-90" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleRetake}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-medium transition-all active:scale-95 pointer-events-auto"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                                    Retake
                                                </button>

                                                <button
                                                    onClick={confirmAnalysis}
                                                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 active:scale-95 pointer-events-auto"
                                                >
                                                    <span>Analyze</span>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400">Position the ingredients list within the frame.</p>
                            </div>
                        )}

                        {/* Main Actions */}
                        {!activeMode && !scanning && !capturedImage && (
                            <div className="grid grid-cols-1 gap-4">
                                {/* Scan & Upload Split Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => enterMode('scan')}
                                        className="relative bg-gradient-to-br from-indigo-200/20 to-violet-200/10 border border-white/20 text-white py-5 rounded-2xl shadow-lg shadow-indigo-900/50 hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] flex flex-col items-center justify-center gap-2 backdrop-blur-md group overflow-hidden"

                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                        <div className="relative z-10 flex flex-col items-center gap-2">
                                            <img src={cameraIcon} alt="Scan" className="w-8 h-8 shrink-0 group-hover:scale-110 transition-transform duration-300 brightness-0 invert opacity-80" />
                                            <span className="font-bold text-lg text-white drop-shadow-sm">Scan</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => uploadInputRef.current.click()}
                                        className="relative bg-gradient-to-br from-indigo-200/20 to-violet-200/10 border border-white/20 text-white py-5 rounded-2xl shadow-lg shadow-indigo-900/50 hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] flex flex-col items-center justify-center gap-2 backdrop-blur-md group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                        <div className="relative z-10 flex flex-col items-center gap-2">
                                            <img src={uploadIcon} alt="Upload" className="w-8 h-8 shrink-0 group-hover:scale-110 transition-transform duration-300 brightness-0 invert opacity-80" />
                                            <span className="font-bold text-lg text-white drop-shadow-sm">Upload</span>
                                        </div>
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleUpload}
                                />
                                <input
                                    type="file"
                                    ref={uploadInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleUpload}
                                />

                                <button
                                    onClick={() => enterMode('paste')}
                                    className="relative bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-100 py-5 rounded-2xl shadow-lg shadow-purple-900/50 hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] flex justify-center backdrop-blur-md group overflow-hidden"

                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                    <div className="w-64 flex items-center gap-4 pl-6 relative z-10 transition-opacity">
                                        <img src={pasteIcon} alt="Paste" className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform duration-300 brightness-0 invert opacity-80" />
                                        <span className="font-bold text-lg text-purple-100 drop-shadow-sm">Paste Ingredients</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => enterMode('sample')}
                                    className="relative bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-100 py-4 rounded-2xl shadow-md shadow-pink-900/50 hover:shadow-pink-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] flex justify-center backdrop-blur-md group overflow-hidden"

                                >
                                    <div className="w-64 flex items-center gap-4 pl-6 relative z-10">
                                        <img src={sampleIcon} alt="Sample" className="w-7 h-7 shrink-0 group-hover:scale-110 transition-transform duration-300 brightness-0 invert opacity-80" />
                                        <span className="font-semibold text-pink-100 drop-shadow-sm">Try a Sample Product</span>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Text Input Mode */}
                        {activeMode === 'paste' && (
                            <div className="space-y-4">
                                <textarea
                                    className="w-full bg-white/10 text-white p-4 rounded-xl outline-none resize-none h-32 text-base border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-300 backdrop-blur-md"
                                    placeholder="Paste ingredients here..."
                                    value={textVal}
                                    onChange={(e) => setTextVal(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveMode(null)}
                                        className="flex-1 py-3 text-indigo-200 hover:text-white font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => analyzeText(textVal)}
                                        className="flex-[2] bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/50 hover:shadow-xl hover:shadow-indigo-500/50 transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-offset-2 ring-offset-indigo-950 hover:ring-2 ring-indigo-400 border border-transparent"
                                    >
                                        Analyze
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Sample Mode */}
                        {activeMode === 'sample' && (
                            <div className="space-y-3">
                                <p className="text-sm text-indigo-200 mb-2">Select a product to test:</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <SampleBtn name="Biscuits" onClick={() => analyzeSample('sample_01')} />
                                    <SampleBtn name="Noodles" onClick={() => analyzeSample('sample_02')} />
                                    <SampleBtn name="Yogurt" onClick={() => analyzeSample('sample_03')} />
                                    <SampleBtn name="Soda" onClick={() => analyzeSample('sample_04')} />
                                    <SampleBtn name="Ketchup" onClick={() => analyzeSample('sample_05')} />
                                    <SampleBtn name="Chocolate" onClick={() => analyzeSample('sample_07')} />
                                </div>
                                <button
                                    onClick={() => setActiveMode(null)}
                                    className="text-indigo-300 text-sm mt-4 hover:text-white hover:underline transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

function SampleBtn({ name, onClick }) {
    return (
        <button onClick={onClick} className="bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 py-3 rounded-lg text-white text-sm transition-all backdrop-blur-sm shadow-sm font-medium">
            {name}
        </button>
    );
}
