import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

function Signup() {
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/user/register", {
                userName,
                email,
                password,
            });

            if (response.data.success) {
                navigate("/home");
            } else{
                setError(response.data.message || "Signup failed");
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "An error occured during Signup",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Boardly
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Create an account to get started with Boardly
                    </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                        <label
                            htmlFor="userName"
                            className="text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>

                        <input
                            id="userName"
                            type="text"
                            placeholder="Enter Your Username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter The password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Sign Up"}
                    </Button>
                </form>

                {error && (
                    <p className="mt-3 text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="font font-semibold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;