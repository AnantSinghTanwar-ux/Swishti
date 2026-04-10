"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/lib/auth";
import { Mail, Lock, Loader2, Leaf } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleAuth = async (isLogin: boolean) => {
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    const { error: authError } = isLogin
      ? await login(email, password)
      : await signup(email, password);

    if (authError) {
      setError(authError);
      setLoading(false);
    } else {
      setSuccess(isLogin ? "Logged in successfully!" : "Account created successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md mt-[-5%]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brutal-cyan border-[3px] border-black shadow-[3px_3px_0px_#000] mb-4">
            <Leaf className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-black text-black uppercase mb-1">Swishti</h1>
          <p className="text-black font-bold text-xs uppercase bg-brutal-yellow inline-block px-2 py-1 border-[3px] border-black text-center max-w-[250px] sm:max-w-none shadow-[2px_2px_0px_#000]">Collaborating for a cleaner community</p>
        </div>

        <div className="p-6 border-[3px] border-black bg-white shadow-[6px_6px_0px_#000]">
          <div className="space-y-5">
            {error && (
              <div className="p-3 border-[3px] border-black bg-brutal-red text-black font-bold uppercase text-xs shadow-[3px_3px_0px_#000]">
                WARN: {error}
              </div>
            )}
            {success && (
              <div className="p-3 border-[3px] border-black bg-brutal-green text-black font-bold uppercase text-xs shadow-[3px_3px_0px_#000]">
                SUCCESS: {success}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-black text-black uppercase ml-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-white border-[3px] border-black py-3 pl-10 pr-4 text-black font-bold placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-black text-black uppercase ml-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white border-[3px] border-black py-3 pl-10 pr-4 text-black font-bold placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => handleAuth(true)}
              disabled={loading}
              className="w-full bg-brutal-green text-black brutal-button py-3 text-base shadow-[3px_3px_0px_#000]"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : "SIGN IN"}
              </div>
            </button>

            <div className="relative my-6 border-t-[3px] border-black">
              <div className="absolute left-1/2 -top-3.5 -translate-x-1/2 bg-white px-3 border-[3px] border-black">
                <span className="text-[10px] uppercase font-black text-black">OR</span>
              </div>
            </div>

            <button
              onClick={() => handleAuth(false)}
              disabled={loading}
              className="w-full bg-white text-black brutal-button py-3 border-[3px] text-base shadow-[3px_3px_0px_#000]"
            >
              CREATE NEW ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
