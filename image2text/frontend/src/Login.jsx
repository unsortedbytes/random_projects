import { useState } from "react";
import axios from "axios";

const API_BASE =
    window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "http://backend:5000";

function Login({ setToken, onClose }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        try {
            const res = await axios.post(`${API_BASE}/auth/login`, {
                email,
                password,
            });

            localStorage.setItem("token", res.data.token);
            setToken(res.data.token);
            onClose();
        } catch (err) {
            console.log(err);
            alert("Login failed");
        }
    };

    const register = async () => {
        try {
            await axios.post(`${API_BASE}/auth/register`, {
                email,
                password,
            });

            // Auto-login after registration
            await login();
        } catch (err) {
            console.log(err);
            alert("Register failed");
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <input
                placeholder="Email"
                className="p-2 bg-gray-700 rounded"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                className="p-2 bg-gray-700 rounded"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={login} className="bg-blue-600 p-2 rounded">
                Login
            </button>

            <button onClick={register} className="bg-green-600 p-2 rounded">
                Register
            </button>
        </div>
    );
}

export default Login;
