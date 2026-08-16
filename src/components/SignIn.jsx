import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignIn = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5050/api/users/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Sign in failed');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // <-- Add this line
      setSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row antialiased">
      {/* Left Side: Image Panel (Hidden on Mobile) */}
      <div className="hidden md:flex w-1/2 relative bg-surface-variant overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img
          className="absolute inset-0 w-full h-full object-cover z-0"
          alt="Professional kitchen"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWhpue-0XJzJ5rdMpKPwpOJgtY0HKUKSolNGhZy5Kc2ArhhV4XF6rmcJmFhHisi4ttyOlS6G2xV_YoGFhGVtRcJ2S2q0DoSElrSTZcg5o_jhycrejOc5dVwHnNpOTTPrZoK9iuYrkv3NH9Hz9Oy_qGy_Hohlh7bYI_WFKUvJf4Q9qEXxrGVpPYJdjnSrVB1uiuZhGSnDl_hIQXbUjsKtSIKkOrfns4NTFEb4MC1tgjuYS-nWotuExWxw"
        />
        <div className="relative z-20 flex flex-col justify-end p-12 h-full text-white">
          <h1 className="font-headline-xl text-headline-xl mb-stack-md text-white drop-shadow-md">
            Precision in every plate.
          </h1>
          <p className="font-body-lg text-body-lg text-white/90 max-w-md drop-shadow">
            Elevate your culinary journey with AI-powered insights and professional-grade recipe generation.
          </p>
        </div>
      </div>

      {/* Right Side: Sign In Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-surface">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-2 mb-stack-lg">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              restaurant_menu
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">CookIQ</span>
          </div>

          <div className="mb-8">
            <h2 className="font-headline-lg text-headline-lg mb-2">Welcome back</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Please enter your details to sign in.
            </p>
          </div>

          {submitted ? (
            <div className="text-center font-body-lg text-tertiary-container font-semibold py-8">
              Signed in successfully! Redirecting to home...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-label-lg text-label-lg text-on-surface mb-stack-sm" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">mail</span>
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    id="email"
                    name="email"
                    placeholder="chef@example.com"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-lg text-label-lg text-on-surface mb-stack-sm" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">lock</span>
                  </div>
                  <input
                    className="block w-full pl-10 pr-10 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
                    onClick={() => setShowPassword(s => !s)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded cursor-pointer"
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                  />
                  <label className="ml-2 block font-body-md text-body-md text-on-surface-variant cursor-pointer" htmlFor="remember-me">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a className="font-label-lg text-label-lg text-primary hover:text-primary-fixed-variant transition-colors" href="#">
                    Forgot password?
                  </a>
                </div>
              </div>

              {error && (
                <div className="text-error text-center font-body-md text-body-md">{error}</div>
              )}

              <div>
                <button
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-lg text-label-lg text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 hover:scale-[0.98]"
                  type="submit"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-on-surface-variant font-label-sm text-label-sm">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex justify-center items-center py-2.5 px-4 border border-outline-variant rounded-lg shadow-sm bg-surface-container-lowest font-label-lg text-label-lg text-on-surface hover:bg-surface-container-low transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex justify-center items-center py-2.5 px-4 border border-outline-variant rounded-lg shadow-sm bg-surface-container-lowest font-label-lg text-label-lg text-on-surface hover:bg-surface-container-low transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-2 text-on-surface" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.365 14.717c0-2.895 2.37-4.048 2.479-4.11-1.343-1.96-3.418-2.234-4.148-2.268-1.758-.178-3.435 1.037-4.336 1.037-.902 0-2.29-1.002-3.743-.974-1.895.027-3.642 1.103-4.619 2.8-1.996 3.46-.51 8.585 1.432 11.394.95 1.372 2.083 2.91 3.568 2.854 1.432-.055 1.983-.925 3.712-.925 1.728 0 2.222.925 3.742.898 1.575-.027 2.544-1.399 3.486-2.772 1.092-1.594 1.543-3.136 1.567-3.218-.035-.015-3.04-1.168-3.04-4.582l-.1-1.134zM14.654 4.887c.792-.958 1.325-2.29 1.18-3.626-1.144.046-2.534.764-3.35 1.745-.733.878-1.345 2.24-1.173 3.541 1.28.099 2.551-.699 3.343-1.66z" />
                </svg>
                Apple
              </button>
            </div>
          </div>

          <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <Link className="font-label-lg text-label-lg text-primary hover:text-primary-fixed-variant transition-colors" to="/signup">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
