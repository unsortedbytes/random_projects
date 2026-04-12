import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";

const API_BASE =
    window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : import.meta.env.VITE_API_BASE ||
          "https://image2text-backend.onrender.com";

function App() {
    const [text, setText] = useState(
        localStorage.getItem("extractedText") || "",
    );
    const [history, setHistory] = useState([]);
    const [preview, setPreview] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [showLogin, setShowLogin] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // 📤 Upload Image
    const uploadImage = async (file) => {
        if (!file) return;

        setIsUploading(true);
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        const formData = new FormData();
        formData.append("image", file);

        try {
            console.log("📤 Uploading to:", `${API_BASE}/extract`);
            console.log("🔑 Token:", token ? "✓ Present" : "✗ Not logged in");
            console.log("📁 File:", file.name, file.size, "bytes");

            const res = await axios.post(`${API_BASE}/extract`, formData, {
                headers: token ? { Authorization: token } : {},
            });

            console.log("✅ Upload successful");
            console.log(
                "📖 Text received:",
                res.data.text.substring(0, 100) + "...",
            );

            setText(res.data.text);
            localStorage.setItem("extractedText", res.data.text);

            if (token) fetchHistory();
        } catch (err) {
            console.error("❌ Upload failed");
            console.error("Error:", err.message);
            console.error("Response:", err.response?.data);
            console.error("Status:", err.response?.status);
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
                uploadImage(item.getAsFile());
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [token]);

    // 🧹 cleanup preview
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* 🔹 Sidebar */}
            <div className="w-72 bg-gray-800 p-4 flex flex-col">
                <h2 className="text-xl font-semibold mb-4">History</h2>

                {!token ? (
                    <button
                        onClick={() => setShowLogin(true)}
                        className="bg-blue-600 hover:bg-blue-700 p-2 rounded mb-4"
                    >
                        Login
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
                        className="bg-red-600 hover:bg-red-700 p-2 rounded mb-4"
                    >
                        Logout
                    </button>
                )}

                <div className="flex-1 overflow-y-auto space-y-2">
                    {!token && (
                        <p className="text-gray-400">Login to see history</p>
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
                                className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 text-sm"
                            >
                                {item.extractedText.slice(0, 40)}...
                            </div>
                        ))}
                </div>
            </div>

            {/* 🔹 Main */}
            <div className="flex-1 flex flex-col items-center p-10">
                <h1 className="text-4xl font-semibold mb-6">
                    Upload or Paste Image
                </h1>

                {/* Upload Button */}
                <label className="mb-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadImage(e.target.files[0])}
                        className="hidden"
                        disabled={isUploading}
                    />
                    <button className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded font-semibold flex items-center gap-2">
                        {isUploading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Processing...
                            </>
                        ) : (
                            <>
                                📤 Choose Image
                            </>
                        )}
                    </button>
                </label>

                <div
                    className="w-full max-w-xl border-2 border-dashed border-gray-600 p-10 text-center rounded-lg hover:border-gray-400 transition"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (!isUploading) uploadImage(e.dataTransfer.files[0]);
                    }}
                >
                    Drag & Drop Image Here
                </div>

                {isUploading && (
                    <div className="mt-6 p-4 bg-blue-900 rounded text-center">
                        <div className="flex justify-center mb-2">
                            <span className="text-2xl animate-spin">📸</span>
                        </div>
                        <p>📤 Uploading...</p>
                        <p className="text-sm text-gray-300 mt-2">This may take a minute for OCR processing</p>
                    </div>
                )}

                {preview && (
                    <img
                        src={preview}
                        className="mt-6 w-60 rounded shadow-lg"
                    />
                )}

                <div className="mt-6 w-full max-w-xl bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="mb-2 text-lg font-medium">Extracted Text</h3>
                    {isUploading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400">🔄 Processing with OCR...</p>
                            <p className="text-sm text-gray-500 mt-2">This may take a minute</p>
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap text-gray-300">
                            {text || "Upload an image to see extracted text here"}
                        </pre>
                    )}
                </div>
            </div>

            {/* 🔥 Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded w-80">
                        <Login
                            setToken={setToken}
                            onClose={() => setShowLogin(false)}
                        />
                        <button
                            onClick={() => setShowLogin(false)}
                            className="mt-3 w-full bg-gray-600 p-2 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

// import { useState, useEffect } from "react";
// import axios from "axios";
// import Login from "./Login";

// function App() {
//     const [text, setText] = useState("");
//     const [history, setHistory] = useState([]);
//     const [preview, setPreview] = useState(null);
//     const [token, setToken] = useState(localStorage.getItem("token"));
//     const [showLogin, setShowLogin] = useState(false);

//     // 📤 Upload Image
//     const uploadImage = async (file) => {
//         if (!file) return;

//         setPreview(URL.createObjectURL(file));

//         const formData = new FormData();
//         formData.append("image", file);

//         const res = await axios.post("http://backend:5000/extract", formData, {
//             headers: token ? { Authorization: token } : {},
//         });

//         setText(res.data.text);

//         if (token) fetchHistory();
//     };

//     // 📜 Fetch History
//     const fetchHistory = async () => {
//         if (!token) return;

//         const res = await axios.get("http://backend:5000/history", {
//             headers: { Authorization: token },
//         });

//         setHistory(res.data);
//     };

//     useEffect(() => {
//         fetchHistory();
//     }, [token]);

//     // 📋 Paste support
//     useEffect(() => {
//         const handlePaste = (e) => {
//             const item = e.clipboardData.items[0];

//             if (item && item.type.includes("image")) {
//                 const file = item.getAsFile();
//                 uploadImage(file);
//             }
//         };

//         window.addEventListener("paste", handlePaste);
//         return () => window.removeEventListener("paste", handlePaste);
//     }, [token]);

//     return (
//         <div className="flex h-screen bg-gray-900 text-white">
//             {/* 🔹 Sidebar */}
//             <div className="w-72 bg-gray-800 p-4 flex flex-col">
//                 <h2 className="text-xl font-semibold mb-4">History</h2>

//                 {!token ? (
//                     <button
//                         onClick={() => setShowLogin(true)}
//                         className="bg-blue-600 hover:bg-blue-700 p-2 rounded mb-4"
//                     >
//                         Login
//                     </button>
//                 ) : (
//                     <button
//                         onClick={() => {
//                             localStorage.removeItem("token");
//                             setToken(null);
//                             setHistory([]);
//                         }}
//                         className="bg-red-600 hover:bg-red-700 p-2 rounded mb-4"
//                     >
//                         Logout
//                     </button>
//                 )}

//                 <div className="flex-1 overflow-y-auto space-y-2">
//                     {!token && (
//                         <p className="text-gray-400">Login to see history</p>
//                     )}

//                     {token &&
//                         history.map((item, i) => (
//                             <div
//                                 key={i}
//                                 onClick={() => setText(item.extractedText)}
//                                 className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 text-sm"
//                             >
//                                 {item.extractedText.slice(0, 40)}...
//                             </div>
//                         ))}
//                 </div>
//             </div>

//             {/* 🔹 Main Content */}
//             <div className="flex-1 flex flex-col items-center justify-start p-10">
//                 <h1 className="text-4xl font-semibold mb-6">
//                     Upload or Paste Image
//                 </h1>

//                 {/* Upload */}
//                 <input
//                     type="file"
//                     onChange={(e) => uploadImage(e.target.files[0])}
//                     className="mb-4"
//                 />

//                 {/* Drag & Drop */}
//                 <div
//                     className="w-full max-w-xl border-2 border-dashed border-gray-600 p-10 text-center rounded-lg hover:border-gray-400 transition"
//                     onDragOver={(e) => e.preventDefault()}
//                     onDrop={(e) => {
//                         e.preventDefault();
//                         uploadImage(e.dataTransfer.files[0]);
//                     }}
//                 >
//                     Drag & Drop Image Here
//                 </div>

//                 {/* Preview */}
//                 {preview && (
//                     <img
//                         src={preview}
//                         className="mt-6 w-60 rounded shadow-lg"
//                     />
//                 )}

//                 {/* Output */}
//                 <div className="mt-6 w-full max-w-xl bg-gray-800 p-4 rounded-lg shadow">
//                     <h3 className="mb-2 text-lg font-medium">Extracted Text</h3>
//                     <pre className="whitespace-pre-wrap text-gray-300">
//                         {text}
//                     </pre>
//                 </div>
//             </div>
//         </div>
//     );

//     // return (
//     //     // <div style={{ display: "flex", height: "100vh" }}>
//     //     //     {/* 🔹 Sidebar */}
//     //     //     <div
//     //     //         style={{
//     //     //             width: "300px",
//     //     //             borderRight: "1px solid gray",
//     //     //             padding: "10px",
//     //     //             overflowY: "auto",
//     //     //         }}
//     //     //     >
//     //     //         <h3>History</h3>

//     //     //         {/* 🔐 Login / Logout */}
//     //     //         {!token ? (
//     //     //             <button onClick={() => setShowLogin(true)}>Login</button>
//     //     //         ) : (
//     //     //             <button
//     //     //                 onClick={() => {
//     //     //                     localStorage.removeItem("token");
//     //     //                     setToken(null);
//     //     //                     setHistory([]);
//     //     //                 }}
//     //     //             >
//     //     //                 Logout
//     //     //             </button>
//     //     //         )}

//     //     //         {/* Show history only if logged in */}
//     //     //         {!token && <p>Login to see history</p>}

//     //     //         {token && history.length === 0 && <p>No history</p>}

//     //     //         {token &&
//     //     //             history.map((item, index) => (
//     //     //                 <div
//     //     //                     key={index}
//     //     //                     style={{
//     //     //                         padding: "10px",
//     //     //                         marginBottom: "10px",
//     //     //                         border: "1px solid #ccc",
//     //     //                         cursor: "pointer",
//     //     //                     }}
//     //     //                     onClick={() => setText(item.extractedText)}
//     //     //                 >
//     //     //                     {item.extractedText.slice(0, 50)}...
//     //     //                 </div>
//     //     //             ))}
//     //     //     </div>

//     //     //     {/* 🔹 Main Area */}
//     //     //     <div style={{ flex: 1, padding: "20px" }}>
//     //     //         <h2>Upload or Paste Image</h2>

//     //     //         <input
//     //     //             type="file"
//     //     //             onChange={(e) => uploadImage(e.target.files[0])}
//     //     //         />

//     //     //         <div
//     //     //             style={{
//     //     //                 border: "2px dashed gray",
//     //     //                 padding: "20px",
//     //     //                 marginTop: "20px",
//     //     //             }}
//     //     //             onDragOver={(e) => e.preventDefault()}
//     //     //             onDrop={(e) => {
//     //     //                 e.preventDefault();
//     //     //                 uploadImage(e.dataTransfer.files[0]);
//     //     //             }}
//     //     //         >
//     //     //             Drag & Drop Image Here
//     //     //         </div>

//     //     //         {preview && (
//     //     //             <div style={{ marginTop: "20px" }}>
//     //     //                 <h3>Preview:</h3>
//     //     //                 <img src={preview} width="200" />
//     //     //             </div>
//     //     //         )}

//     //     //         <div style={{ marginTop: "20px" }}>
//     //     //             <h3>Extracted Text:</h3>
//     //     //             <pre>{text}</pre>
//     //     //         </div>
//     //     //     </div>

//     //     //     {/* 🔥 Login Popup */}
//     //     //     {showLogin && (
//     //     //         <div
//     //     //             style={{
//     //     //                 position: "fixed",
//     //     //                 top: 0,
//     //     //                 left: 0,
//     //     //                 width: "100%",
//     //     //                 height: "100%",
//     //     //                 background: "rgba(0,0,0,0.5)",
//     //     //             }}
//     //     //         >
//     //     //             <div
//     //     //                 style={{
//     //     //                     background: "white",
//     //     //                     padding: "20px",
//     //     //                     margin: "100px auto",
//     //     //                     width: "300px",
//     //     //                 }}
//     //     //             >
//     //     //                 <Login setToken={setToken} />
//     //     //                 <button onClick={() => setShowLogin(false)}>
//     //     //                     Close
//     //     //                 </button>
//     //     //             </div>
//     //     //         </div>
//     //     //     )}
//     //     // </div>
//     //     <div className="flex h-screen bg-gray-900 text-white">
//     //         {/* Sidebar */}
//     //         <div className="w-72 bg-gray-800 p-4 overflow-y-auto">
//     //             <h2 className="text-xl font-bold mb-4">History</h2>

//     //             {!token ? (
//     //                 <button
//     //                     onClick={() => setShowLogin(true)}
//     //                     className="bg-blue-500 px-3 py-2 rounded w-full"
//     //                 >
//     //                     Login
//     //                 </button>
//     //             ) : (
//     //                 <button
//     //                     onClick={() => {
//     //                         localStorage.removeItem("token");
//     //                         setToken(null);
//     //                         setHistory([]);
//     //                     }}
//     //                     className="bg-red-500 px-3 py-2 rounded w-full mb-3"
//     //                 >
//     //                     Logout
//     //                 </button>
//     //             )}

//     //             {token &&
//     //                 history.map((item, i) => (
//     //                     <div
//     //                         key={i}
//     //                         onClick={() => setText(item.extractedText)}
//     //                         className="p-2 mb-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
//     //                     >
//     //                         {item.extractedText.slice(0, 40)}...
//     //                     </div>
//     //                 ))}
//     //         </div>

//     //         {/* Main */}
//     //         <div className="flex-1 p-6">
//     //             <h1 className="text-2xl font-bold mb-4">
//     //                 Upload or Paste Image
//     //             </h1>

//     //             <input
//     //                 type="file"
//     //                 onChange={(e) => uploadImage(e.target.files[0])}
//     //                 className="mb-4"
//     //             />

//     //             <div
//     //                 className="border-2 border-dashed border-gray-500 p-10 text-center"
//     //                 onDragOver={(e) => e.preventDefault()}
//     //                 onDrop={(e) => {
//     //                     e.preventDefault();
//     //                     uploadImage(e.dataTransfer.files[0]);
//     //                 }}
//     //             >
//     //                 Drag & Drop Image Here
//     //             </div>

//     //             {preview && <img src={preview} className="mt-4 w-48 rounded" />}

//     //             <div className="mt-6 bg-gray-800 p-4 rounded">
//     //                 <h3 className="mb-2">Extracted Text</h3>
//     //                 <pre className="whitespace-pre-wrap">{text}</pre>
//     //             </div>
//     //         </div>
//     //     </div>
//     // );
// }

// export default App;

// // import { useState, useEffect } from "react";
// // import axios from "axios";
// // import Login from "./Login";

// // function App() {
// //     const [text, setText] = useState("");
// //     const [history, setHistory] = useState([]);
// //     const [preview, setPreview] = useState(null);
// //     const [token, setToken] = useState(localStorage.getItem("token"));
// //     const [showLogin, setShowLogin] = useState(false);

// //     // 📤 Upload Image
// //     const uploadImage = async (file) => {
// //         if (!file) return;

// //         setPreview(URL.createObjectURL(file));

// //         const formData = new FormData();
// //         formData.append("image", file);

// //         const res = await axios.post(
// //             "http://backend:5000/extract",
// //             formData,
// //             {
// //                 headers: token ? { Authorization: token } : {},
// //             },
// //         );

// //         setText(res.data.text);

// //         if (token) fetchHistory();
// //     };

// //     // 📜 Fetch History
// //     const fetchHistory = async () => {
// //         if (!token) return;

// //         const res = await axios.get("http://backend:5000/history", {
// //             headers: { Authorization: token },
// //         });

// //         setHistory(res.data);
// //     };

// //     useEffect(() => {
// //         fetchHistory();
// //     }, [token]);

// //     // 📋 Paste support
// //     useEffect(() => {
// //         const handlePaste = (e) => {
// //             const item = e.clipboardData.items[0];

// //             if (item && item.type.includes("image")) {
// //                 const file = item.getAsFile();
// //                 uploadImage(file);
// //             }
// //         };

// //         window.addEventListener("paste", handlePaste);
// //         return () => window.removeEventListener("paste", handlePaste);
// //     }, [token]);

// //     return (
// //         <div className="flex h-screen bg-gray-900 text-white">
// //             {/* 🔹 Sidebar */}
// //             <div className="w-72 bg-gray-800 p-4 flex flex-col">
// //                 <h2 className="text-xl font-semibold mb-4">History</h2>

// //                 {!token ? (
// //                     <button
// //                         onClick={() => setShowLogin(true)}
// //                         className="bg-blue-600 hover:bg-blue-700 p-2 rounded mb-4"
// //                     >
// //                         Login
// //                     </button>
// //                 ) : (
// //                     <button
// //                         onClick={() => {
// //                             localStorage.removeItem("token");
// //                             setToken(null);
// //                             setHistory([]);
// //                         }}
// //                         className="bg-red-600 hover:bg-red-700 p-2 rounded mb-4"
// //                     >
// //                         Logout
// //                     </button>
// //                 )}

// //                 <div className="flex-1 overflow-y-auto space-y-2">
// //                     {!token && (
// //                         <p className="text-gray-400">Login to see history</p>
// //                     )}

// //                     {token &&
// //                         history.map((item, i) => (
// //                             <div
// //                                 key={i}
// //                                 onClick={() => setText(item.extractedText)}
// //                                 className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 text-sm"
// //                             >
// //                                 {item.extractedText.slice(0, 40)}...
// //                             </div>
// //                         ))}
// //                 </div>
// //             </div>

// //             {/* 🔹 Main Content */}
// //             <div className="flex-1 flex flex-col items-center justify-start p-10">
// //                 <h1 className="text-4xl font-semibold mb-6">
// //                     Upload or Paste Image
// //                 </h1>

// //                 {/* Upload */}
// //                 <input
// //                     type="file"
// //                     onChange={(e) => uploadImage(e.target.files[0])}
// //                     className="mb-4"
// //                 />

// //                 {/* Drag & Drop */}
// //                 <div
// //                     className="w-full max-w-xl border-2 border-dashed border-gray-600 p-10 text-center rounded-lg hover:border-gray-400 transition"
// //                     onDragOver={(e) => e.preventDefault()}
// //                     onDrop={(e) => {
// //                         e.preventDefault();
// //                         uploadImage(e.dataTransfer.files[0]);
// //                     }}
// //                 >
// //                     Drag & Drop Image Here
// //                 </div>

// //                 {/* Preview */}
// //                 {preview && (
// //                     <img
// //                         src={preview}
// //                         className="mt-6 w-60 rounded shadow-lg"
// //                     />
// //                 )}

// //                 {/* Output */}
// //                 <div className="mt-6 w-full max-w-xl bg-gray-800 p-4 rounded-lg shadow">
// //                     <h3 className="mb-2 text-lg font-medium">Extracted Text</h3>
// //                     <pre className="whitespace-pre-wrap text-gray-300">
// //                         {text}
// //                     </pre>
// //                 </div>
// //             </div>
// //         </div>
// //     );

// //     // return (
// //     //     // <div style={{ display: "flex", height: "100vh" }}>
// //     //     //     {/* 🔹 Sidebar */}
// //     //     //     <div
// //     //     //         style={{
// //     //     //             width: "300px",
// //     //     //             borderRight: "1px solid gray",
// //     //     //             padding: "10px",
// //     //     //             overflowY: "auto",
// //     //     //         }}
// //     //     //     >
// //     //     //         <h3>History</h3>

// //     //     //         {/* 🔐 Login / Logout */}
// //     //     //         {!token ? (
// //     //     //             <button onClick={() => setShowLogin(true)}>Login</button>
// //     //     //         ) : (
// //     //     //             <button
// //     //     //                 onClick={() => {
// //     //     //                     localStorage.removeItem("token");
// //     //     //                     setToken(null);
// //     //     //                     setHistory([]);
// //     //     //                 }}
// //     //     //             >
// //     //     //                 Logout
// //     //     //             </button>
// //     //     //         )}

// //     //     //         {/* Show history only if logged in */}
// //     //     //         {!token && <p>Login to see history</p>}

// //     //     //         {token && history.length === 0 && <p>No history</p>}

// //     //     //         {token &&
// //     //     //             history.map((item, index) => (
// //     //     //                 <div
// //     //     //                     key={index}
// //     //     //                     style={{
// //     //     //                         padding: "10px",
// //     //     //                         marginBottom: "10px",
// //     //     //                         border: "1px solid #ccc",
// //     //     //                         cursor: "pointer",
// //     //     //                     }}
// //     //     //                     onClick={() => setText(item.extractedText)}
// //     //     //                 >
// //     //     //                     {item.extractedText.slice(0, 50)}...
// //     //     //                 </div>
// //     //     //             ))}
// //     //     //     </div>

// //     //     //     {/* 🔹 Main Area */}
// //     //     //     <div style={{ flex: 1, padding: "20px" }}>
// //     //     //         <h2>Upload or Paste Image</h2>

// //     //     //         <input
// //     //     //             type="file"
// //     //     //             onChange={(e) => uploadImage(e.target.files[0])}
// //     //     //         />

// //     //     //         <div
// //     //     //             style={{
// //     //     //                 border: "2px dashed gray",
// //     //     //                 padding: "20px",
// //     //     //                 marginTop: "20px",
// //     //     //             }}
// //     //     //             onDragOver={(e) => e.preventDefault()}
// //     //     //             onDrop={(e) => {
// //     //     //                 e.preventDefault();
// //     //     //                 uploadImage(e.dataTransfer.files[0]);
// //     //     //             }}
// //     //     //         >
// //     //     //             Drag & Drop Image Here
// //     //     //         </div>

// //     //     //         {preview && (
// //     //     //             <div style={{ marginTop: "20px" }}>
// //     //     //                 <h3>Preview:</h3>
// //     //     //                 <img src={preview} width="200" />
// //     //     //             </div>
// //     //     //         )}

// //     //     //         <div style={{ marginTop: "20px" }}>
// //     //     //             <h3>Extracted Text:</h3>
// //     //     //             <pre>{text}</pre>
// //     //     //         </div>
// //     //     //     </div>

// //     //     //     {/* 🔥 Login Popup */}
// //     //     //     {showLogin && (
// //     //     //         <div
// //     //     //             style={{
// //     //     //                 position: "fixed",
// //     //     //                 top: 0,
// //     //     //                 left: 0,
// //     //     //                 width: "100%",
// //     //     //                 height: "100%",
// //     //     //                 background: "rgba(0,0,0,0.5)",
// //     //     //             }}
// //     //     //         >
// //     //     //             <div
// //     //     //                 style={{
// //     //     //                     background: "white",
// //     //     //                     padding: "20px",
// //     //     //                     margin: "100px auto",
// //     //     //                     width: "300px",
// //     //     //                 }}
// //     //     //             >
// //     //     //                 <Login setToken={setToken} />
// //     //     //                 <button onClick={() => setShowLogin(false)}>
// //     //     //                     Close
// //     //     //                 </button>
// //     //     //             </div>
// //     //     //         </div>
// //     //     //     )}
// //     //     // </div>
// //     //     <div className="flex h-screen bg-gray-900 text-white">
// //     //         {/* Sidebar */}
// //     //         <div className="w-72 bg-gray-800 p-4 overflow-y-auto">
// //     //             <h2 className="text-xl font-bold mb-4">History</h2>

// //     //             {!token ? (
// //     //                 <button
// //     //                     onClick={() => setShowLogin(true)}
// //     //                     className="bg-blue-500 px-3 py-2 rounded w-full"
// //     //                 >
// //     //                     Login
// //     //                 </button>
// //     //             ) : (
// //     //                 <button
// //     //                     onClick={() => {
// //     //                         localStorage.removeItem("token");
// //     //                         setToken(null);
// //     //                         setHistory([]);
// //     //                     }}
// //     //                     className="bg-red-500 px-3 py-2 rounded w-full mb-3"
// //     //                 >
// //     //                     Logout
// //     //                 </button>
// //     //             )}

// //     //             {token &&
// //     //                 history.map((item, i) => (
// //     //                     <div
// //     //                         key={i}
// //     //                         onClick={() => setText(item.extractedText)}
// //     //                         className="p-2 mb-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
// //     //                     >
// //     //                         {item.extractedText.slice(0, 40)}...
// //     //                     </div>
// //     //                 ))}
// //     //         </div>

// //     //         {/* Main */}
// //     //         <div className="flex-1 p-6">
// //     //             <h1 className="text-2xl font-bold mb-4">
// //     //                 Upload or Paste Image
// //     //             </h1>

// //     //             <input
// //     //                 type="file"
// //     //                 onChange={(e) => uploadImage(e.target.files[0])}
// //     //                 className="mb-4"
// //     //             />

// //     //             <div
// //     //                 className="border-2 border-dashed border-gray-500 p-10 text-center"
// //     //                 onDragOver={(e) => e.preventDefault()}
// //     //                 onDrop={(e) => {
// //     //                     e.preventDefault();
// //     //                     uploadImage(e.dataTransfer.files[0]);
// //     //                 }}
// //     //             >
// //     //                 Drag & Drop Image Here
// //     //             </div>

// //     //             {preview && <img src={preview} className="mt-4 w-48 rounded" />}

// //     //             <div className="mt-6 bg-gray-800 p-4 rounded">
// //     //                 <h3 className="mb-2">Extracted Text</h3>
// //     //                 <pre className="whitespace-pre-wrap">{text}</pre>
// //     //             </div>
// //     //         </div>
// //     //     </div>
// //     // );
// // }

// // export default App;
