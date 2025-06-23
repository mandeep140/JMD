"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/admin/dashboard");
        }
    }, [status]);

    // Clear error when user types in email or password
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (error) setError(null);
    };
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        setError(null);
        e.preventDefault();
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res.ok) {
            router.push("/admin/dashboard");
        } else {
            setError("Invalid email or password");
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#E9E9E9] flex flex-col md:flex-row">
            {/* Left Side */}
            <div className="h-[18vh] md:h-[100vh] w-full md:w-1/5 bg-gradient-to-r from-[#43777A] to-[#3B4078] flex justify-center items-end md:items-end">
                <span className="mt-auto mb-6 text-center text-white font-extrabold text-xl tracking-wide">
                    <h1>JMD</h1>
                    <h1 className="-mt-1">ADVERTISEMENT</h1>
                    <a href="https://www.showa.online" target="_blank" className="text-sm font-medium hover:text-white/70">Showa.online</a>
                </span>
            </div>
            {/* Right Side */}
            <div className="h-[80vh] md:h-[100vh] w-full md:w-4/5 flex justify-center items-center">
                <div className="bg-white w-[95vw] pb-7 md:pb-0 md:w-[50vw] h-fit md:h-[80vh] rounded-2xl flex flex-col justify-center">
                    <div className="w-full flex flex-col justify-center items-center">
                        <div className="h-[30%] w-[60%] md:w-[50%] ms-7 mt-8 md:mt-0">
                            <img src="/admin/img/jmd.png" alt="" className="mx-auto max-w-[120px] md:max-w-[180px]" />
                            <h2 className="text-gray-600 max-w-[90%] text-center md:max-w-[100%] mt-7 mx-auto text-sm md:text-base">Enter your email address and password to login</h2>
                        </div>
                    </div>
                    <div className="w-full flex justify-center items-center text-black gap-4">
                        <form onSubmit={handleSubmit} className="w-full max-w-xs md:max-w-md mx-auto mt-6">
                            <h2 className="text-xl font-bold mb-4 mt-2 text-center">Admin Login</h2>
                            <span className="block mb-3">
                                <label htmlFor="email" className="text-gray-600">Your E-mail</label>
                                <input
                                    type="text"
                                    id="email"
                                    autoFocus
                                    autoComplete="off"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className="border-gray-600 border-1 rounded-xl p-2 mb-2 w-full"
                                />
                            </span>
                            <span className="relative block mb-3">
                                <label htmlFor="password" className="text-gray-600">Your Password</label>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    autoComplete="off"
                                    onChange={handlePasswordChange}
                                    className="border-gray-600 border-1 rounded-xl p-2 mb-2 w-full pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-9 text-gray-800 focus:outline-none flex flex-row items-center justify-center gap-2 cursor-pointer"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    {/* {!showPassword ? "Show" : "Hide"} */}
                                </button>
                            </span>
                            <span className="flex flex-col justify-center items-center mt-4">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 duration-150 cursor-pointer text-white px-4 py-2 rounded w-full">
                                    {loading ? "Loading..." : "Login"}
                                </button>
                                <p className="text-red-500 font-bold">{error}</p>
                            </span>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
