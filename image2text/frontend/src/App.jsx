import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";

const API_BASE =
    window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : import.meta.env.VITE_API_BASE ||
          "https://image2text-backend.onrender.com";

// --- Icons ---
const HistoryIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

const LogoutIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
    </svg>
);

const UploadIcon = () => (
    <svg className="w-8 h-8 mb-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
    </svg>
);

const DocumentTextIcon = () => (
    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
);

const SparklesIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
    </svg>
);

const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    </svg>
);

function App() {
    const [text, setText] = useState(
        localStorage.getItem("extractedText") || "",
    );
    const [history, setHistory] = useState([]);
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [showLogin, setShowLogin] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    //  Handle file selection
    const handleFileSelect = (file) => {
        if (!file) return;
        setSelectedFile(file);
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        console.log("📁 File selected:", file.name, file.size, "bytes");
    };

    // 📤 Upload Image
    const uploadImage = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            const res = await axios.post(`${API_BASE}/extract`, formData, {
                headers: token ? { Authorization: token } : {},
            });

            setText(res.data.text);
            localStorage.setItem("extractedText", res.data.text);

            if (token) fetchHistory();
        } catch (err) {
            console.error(err);
            alert(
                "Upload failed: " + (err.response?.data?.error || err.message),
            );
        } finally {
            setIsUploading(false);
        }
    };

    // 📜 Fetch History
    const fetchHistory = async () => {
        if (!token) return;

        try {
            const res = await axios.get(`${API_BASE}/history`, {
                headers: { Authorization: token },
            });

            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [token]);

    // 📋 Paste support
    useEffect(() => {
        const handlePaste = (e) => {
            const item = e.clipboardData.items[0];

            if (item && item.type.includes("image")) {
                handleFileSelect(item.getAsFile());
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, []);

    // 🧹 cleanup preview
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0] && !isUploading) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-slate-900 text-white overflow-hidden font-sans">
            {/* 🔹 Sidebar (Glassmorphism) */}
            <div className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col shadow-2xl z-10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                        <DocumentTextIcon />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
                        Image2Text
                    </h2>
                </div>

                <div className="flex items-center gap-2 mb-6 text-gray-300 font-medium px-1">
                    <HistoryIcon />
                    <span className="tracking-wide">Recent Extractions</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {!token && (
                        <div className="flex flex-col items-center justify-center h-40 text-center bg-white/5 rounded-2xl border border-white/5 p-6">
                            <p className="text-gray-400 text-sm mb-4">Log in to sync and save your extraction history across devices.</p>
                        </div>
                    )}

                    {token && history.length === 0 && (
                        <p className="text-gray-500 text-sm text-center mt-10">No history found.</p>
                    )}

                    {token &&
                        history.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => {
                                    setText(item.extractedText);
                                    localStorage.setItem(
                                        "extractedText",
                                        item.extractedText,
                                    );
                                }}
                                className="group p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                                    {item.extractedText}
                                </p>
                            </div>
                        ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                    {!token ? (
                        <button
                            onClick={() => setShowLogin(true)}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                        >
                            Sign In
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("extractedText");
                                setToken(null);
                                setHistory([]);
                                setText("");
                            }}
                            className="w-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-gray-300 p-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <LogoutIcon />
                            Sign Out
                        </button>
                    )}
                </div>
            </div>

            {/* 🔹 Main Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto">
                {/* Decorative background blurs */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 z-10">
                    
                    {/* Left Column: Upload / Action */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="text-center lg:text-left mb-2">
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                                Extract text from <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                    any image.
                                </span>
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Upload, drag & drop, or paste an image from your clipboard.
                            </p>
                        </div>

                        {/* Drag & Drop Zone */}
                        <label
                            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden group
                                ${dragActive ? "border-indigo-400 bg-indigo-500/10 scale-[1.02]" : "border-gray-600 bg-white/5 hover:bg-white/10 hover:border-gray-400"}
                                ${isUploading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
                            `}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                                className="hidden"
                                disabled={isUploading}
                            />
                            
                            {!preview && (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <UploadIcon />
                                    <p className="mb-2 text-lg text-gray-300 font-medium group-hover:text-indigo-300 transition-colors">
                                        <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500">PNG, JPG or WEBP (Max. 10MB)</p>
                                </div>
                            )}

                            {preview && (
                                <div className="absolute inset-0 p-2">
                                    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-inner bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/20 transition-all">
                                        <img src={preview} className="max-w-full max-h-full object-contain drop-shadow-2xl" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium">Click to change image</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </label>

                        {/* Actions */}
                        {preview && (
                            <div className="flex gap-4 animate-[fadeIn_0.3s_ease-out]">
                                <button
                                    onClick={uploadImage}
                                    disabled={isUploading}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-400 text-white px-6 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none disabled:shadow-none"
                                >
                                    {isUploading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing Image...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon />
                                            Extract Text
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview(null);
                                        setText("");
                                    }}
                                    disabled={isUploading}
                                    className="px-6 py-4 bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center"
                                    title="Clear"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Result */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden group transition-all duration-500 hover:border-white/20">
                            {/* Decorative top gradient border */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                            
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                                    <DocumentTextIcon />
                                    Extracted Text
                                </h3>
                                {text && !isUploading && (
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(text);
                                            // Optional: add a tiny visual feedback here if needed
                                        }}
                                        className="text-xs font-medium bg-white/10 hover:bg-white/20 text-indigo-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                        Copy
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 bg-black/20 rounded-2xl p-4 border border-white/5 overflow-y-auto min-h-[300px] max-h-[500px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {isUploading ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                                        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                                            <svg className="w-8 h-8 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-indigo-300 font-medium text-lg">Running OCR Processing...</p>
                                            <p className="text-gray-500 text-sm mt-1">This takes a few seconds to extract all text.</p>
                                        </div>
                                    </div>
                                ) : text ? (
                                    <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed">
                                        {text}
                                    </pre>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                        <DocumentTextIcon />
                                        <p className="mt-3 text-sm">Your extracted text will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔥 Login Modal (Glassmorphism) */}
            {showLogin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                        <button 
                            onClick={() => setShowLogin(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        
                        <Login
                            setToken={(token) => {
                                setToken(token);
                                fetchHistory(); // Trigger history fetch explicitly if needed, though useEffect should catch token change
                            }}
                            onClose={() => setShowLogin(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
