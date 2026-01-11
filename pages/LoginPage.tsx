import React, { useState } from "react";

const LoginPage = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    onLogin({ email });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h2 className="text-3xl font-bold mb-6">Welcome Back</h2>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-sm p-3 mb-4 rounded bg-gray-800 text-white border border-gray-600"
      />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full max-w-sm p-3 mb-4 rounded bg-gray-800 text-white border border-gray-600"
      />

      <button
        onClick={handleLogin}
        className="w-full max-w-sm bg-cyan-400 text-black p-3 font-bold rounded hover:bg-cyan-500 transition"
      >
        Login / Continue
      </button>
    </div>
  );
};

export default LoginPage;
