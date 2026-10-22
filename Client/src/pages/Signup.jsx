import { Button } from "@/components/ui/button";
function Signup() {
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

                <form className="space-y-5">
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
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={false}>
                        Signup
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default Signup;
