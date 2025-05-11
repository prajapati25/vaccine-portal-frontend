import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import illustration from "../assets/data.svg";
import { BookOpen, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const result = await login(form.username, form.password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Custom sidebar background color to match dashboard (116, 120, 117)
  const sidebarColor = 'rgb(116, 120, 117)';
  const sidebarHoverColor = 'rgb(96, 100, 97)';

  return (
    <div className="fixed inset-0 flex bg-gray-100">
      <div className="w-full flex h-full">
        {/* Left Panel - Login form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <div className="flex items-center mb-8">
              <BookOpen className="text-gray-800" size={28} />
              <span className="font-bold text-2xl ml-2">School Vaccination Portal</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Login</h2>
            <p className="text-sm text-gray-600 mb-8">Enter your credentials to access the dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="text-gray-600 hover:text-gray-800">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                style={{ backgroundColor: sidebarColor }}
                className="w-full text-white py-3 rounded-lg font-medium shadow transition-colors duration-200"
                disabled={isLoading}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = sidebarHoverColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = sidebarColor}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-8 text-sm text-center text-gray-600">
              <span>Don't have an account? </span>
              <a 
                href="#" 
                className="font-medium hover:underline"
                style={{ color: sidebarColor }}
              >
                Contact administrator
              </a>
            </div>
          </div>
        </div>

        {/* Right Panel - Banner */}
        <div 
          className="hidden md:block md:w-1/2 h-full"
          style={{ backgroundColor: sidebarColor }}
        >
          <div className="flex flex-col items-center justify-center h-full text-white text-center p-8">
            <h2 className="text-4xl font-bold leading-snug">
              Welcome to 
              <span className="block mt-2">School Vaccination Portal</span>
            </h2>
            <p className="text-lg mt-4">Manage student vaccination records efficiently</p>
            <img
              src={illustration}
              alt="Vaccination Portal Illustration"
              className="max-w-sm w-full mx-auto my-12"
            />
            <div className="bg-white bg-opacity-10 p-4 rounded-lg max-w-md w-full">
              <p className="ttext-sm text-center text-black">
                Ensuring health and safety through proper vaccination tracking and management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;