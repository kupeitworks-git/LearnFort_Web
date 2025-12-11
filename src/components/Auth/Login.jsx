import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LearnFortLogo from "../../images/LearnFort.png";
import { Eye, EyeOff } from "lucide-react";
import {BaseUrl} from '../../components/api/api'


const Login = () => {

  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedMobile = mobile.trim();
    const trimmedPassword = password.trim();

    if (!trimmedMobile) {
      setToast({ message: "Please enter your mobile number", type: "error" });
      return;
    }

    if (!/^\d{10}$/.test(trimmedMobile)) {
      setToast({ message: "Invalid mobile number", type: "error" });
      return;
    }

    if (!trimmedPassword) {
      setToast({ message: "Please enter your password", type: "error" });
      return;
    }

    setIsLoading(true);
    setToast({ message: "", type: "" });

    try {
      const res = await fetch(`${BaseUrl}user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: trimmedMobile,
          password: trimmedPassword,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let message = "Invalid Credentials";
        if (errorText) {
          try {
            const parsed = JSON.parse(errorText);
            message = parsed.message || parsed.error || message;
          } catch {
            message = errorText;
          }
        }
        throw new Error(message);
      }

      const data = await res.json();

      try {
        localStorage.setItem("lf_user", JSON.stringify(data));
        if (data.token) {
          sessionStorage.setItem("token", data.token);
        }
      } catch (storageError) {
        // ignore storage errors but still allow login
      }

      setToast({ message: "Logged in Successfully!", type: "success" });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      const raw = (err.message || "Invalid Credentials").toLowerCase();
      let message = "Invalid Credentials";
      if (raw.includes("password")) {
        message = "Invalid Password";
      } else if (raw.includes("mobile") || raw.includes("phone")) {
        message = "Invalid mobile number";
      }
      setToast({ message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {toast.message && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-md text-white shadow-lg text-sm
            ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-center mb-4">
            <img src={LearnFortLogo} className="w-16 h-16" alt="LearnFort" />
          </div>
          <h1 className="text-2xl font-semibold text-center text-blue-700 mb-1">Welcome Back 👋</h1>
          <p className="text-center text-gray-500 mb-6">Login to continue to SportsPark</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                  setMobile(onlyDigits);
                }}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              {/* Toggle button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-700 text-white rounded-lg py-3 font-medium hover:bg-blue-800 transition
                ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading && (
                <span className="inline-block mr-2 h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin align-middle" />
              )}
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
        <div className="text-center mt-3 text-sm space-y-1">
          <div>
            <span className="text-gray-600 mr-1">Don't have an account?</span>
            {/* <button onClick={() => navigate("/register") } className="text-blue-700 font-medium hover:underline">Register</button> */}
          </div>
          <div className="flex flex-col items-center space-y-2 sm:space-y-0 sm:flex-row sm:justify-center sm:space-x-3">
            <div className="flex space-x-3">
              <button onClick={() => navigate("/register?role=user")} className="text-blue-700 hover:underline">Register as User</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => navigate("/register?role=admin")} className="text-blue-700 hover:underline">Register as Admin</button>
            </div>
            {/* <div className="w-full sm:w-auto text-center sm:text-left">
              <span className="text-gray-300 hidden sm:inline">|</span>
              <button 
                onClick={() => navigate("/register?role=superadmin")} 
                className="text-blue-700 hover:underline sm:ml-3"
              >
                Register as Super Admin
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
