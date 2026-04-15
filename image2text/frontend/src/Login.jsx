import { useState } from "react";
import axios from "axios";

const API_BASE =
    window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : import.meta.env.VITE_API_BASE ||
          "https://image2text-backend.onrender.com";

function Login({ setToken, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLogin ? "/auth/login" : "/auth/register";

        try {
            const res = await axios.post(`${API_BASE}${endpoint}`, {
                email,
                password,
            });

            if (isLogin) {
                localStorage.setItem("token", res.data.token);
                setToken(res.data.token);
                onClose();
            } else {
                // After registration, automatically login
                const loginRes = await axios.post(`${API_BASE}/auth/login`, {
                    email,
                    password,
                });
                localStorage.setItem("token", loginRes.data.token);
                setToken(loginRes.data.token);
                onClose();
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-gray-400 text-sm">
                    {isLogin ? "Sign in to access your extraction history" : "Sign up to save your extractions to the cloud"}
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm text-center flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-300 mb-1.5 block ml-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                        </div>
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 outline-none transition-all duration-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-300 mb-1.5 block ml-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 outline-none transition-all duration-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-semibold mt-4 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 flex justify-center items-center transform hover:-translate-y-0.5 disabled:transform-none"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isLogin ? "Logging in..." : "Creating account..."}
                        </span>
                    ) : (
                        isLogin ? "Sign In" : "Create Account"
                    )}
                </button>
            </form>

            <div className="text-center text-sm text-gray-400 mt-2 border-t border-white/10 pt-6">
                {isLogin ? (
                    <p>
                        Don't have an account?{" "}
                        <button
                            onClick={() => {
                                setIsLogin(false);
                                setError("");
                            }}
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                            Sign up for free
                        </button>
                    </p>
                ) : (
                    <p>
                        Already have an account?{" "}
                        <button
                            onClick={() => {
                                setIsLogin(true);
                                setError("");
                            }}
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                            Log in here
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;
