import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

const SignUp = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
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
      // Change the API URL to point to your backend server
      const res = await fetch('http://localhost:5050/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Signup failed');
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

  const strength = getPasswordStrength(form.password);

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side: Image Panel (Hidden on Mobile) */}
      <div className="hidden md:flex w-1/2 relative bg-surface-container-highest overflow-hidden">
        <img
          alt="Fresh ingredients on marble countertop"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBk6XIfIEYZohfp18elRKbw3aBWq1SYWRguZ20Ovik9RHWpEOANRC_uHooHWLKcdSJGQpwOrZoHMzvg589q-2ynuvc4MipDQets4L-t2LZM6valDD83BSHEqeEAeOJiRpod2_4vrkXU4oc_x2Fph3vbgDBXXmDZQkl8CkJMmvt0Xkjpzmqndm4MsRftNBn6GAMhPNuNsACUJs8TDkJijdqgeRkFx3-Lkxwv2z7_tBBYs91lHteWo1UlQ"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/40 to-transparent pointer-events-none" />
        <div className="absolute top-gutter left-gutter flex items-center gap-stack-sm text-surface-container-lowest drop-shadow-md">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            restaurant_menu
          </span>
          <span className="font-headline-md tracking-tight">CookIQ</span>
        </div>
        <div className="absolute bottom-gutter left-gutter right-gutter text-surface-container-lowest">
          <h2 className="font-headline-lg mb-stack-sm drop-shadow-md">Elevate Your Home Cooking.</h2>
          <p className="font-body-lg opacity-90 drop-shadow-sm max-w-md">
            Join thousands of home chefs transforming everyday ingredients into extraordinary meals with AI
            precision.
          </p>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-gutter sm:p-section-gap bg-surface">
        <div className="w-full max-w-[420px] space-y-stack-lg">
          <div className="md:hidden flex items-center justify-center gap-stack-sm text-primary mb-stack-lg">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              restaurant_menu
            </span>
            <span className="font-headline-md font-bold tracking-tight">CookIQ</span>
          </div>

          <div className="text-center md:text-left space-y-stack-sm">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface">Join CookIQ</h1>
            <p className="font-body-md text-on-surface-variant">
              Create your account to start cooking smarter, not harder.
            </p>
          </div>

          {submitted ? (
            <div className="text-center font-body-lg text-tertiary-container font-semibold py-8">
              Thank you for signing up! Redirecting to home...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-stack-md">
              <div className="space-y-stack-sm">
                <label className="block font-label-lg text-on-surface" htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant pointer-events-none">
                    person
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    id="fullName"
                    name="name"
                    placeholder="e.g., Gordon Ramsay"
                    required
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-stack-sm">
                <label className="block font-label-lg text-on-surface" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant pointer-events-none">
                    mail
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    id="email"
                    name="email"
                    placeholder="chef@example.com"
                    required
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-stack-sm">
                <label className="block font-label-lg text-on-surface" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant pointer-events-none">
                    lock
                  </span>
                  <input
                    className="w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    id="password"
                    name="password"
                    placeholder="Create a strong password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                    onClick={() => setShowPassword(s => !s)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
                <div className="pt-2">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          i < strength ? 'bg-tertiary' : 'bg-surface-container-high'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="font-label-sm text-on-surface-variant">
                      Password strength: {form.password ? STRENGTH_LABELS[strength] : 'None'}
                    </p>
                    <p className="font-label-sm text-on-surface-variant">Must be at least 8 characters.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 py-2">
                <div className="flex items-center h-5">
                  <input
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface bg-surface-container-lowest cursor-pointer transition-colors"
                    id="terms"
                    name="terms"
                    required
                    type="checkbox"
                  />
                </div>
                <label className="font-body-md text-sm text-on-surface-variant cursor-pointer" htmlFor="terms">
                  I agree to the <a className="text-primary hover:underline font-medium" href="#">Terms of Service</a>{' '}
                  and <a className="text-primary hover:underline font-medium" href="#">Privacy Policy</a>.
                </label>
              </div>

              {error && (
                <div className="text-error text-center font-body-md text-body-md">{error}</div>
              )}

              <button
                className="w-full bg-primary text-on-primary font-label-lg py-3 rounded-2xl shadow-sm hover:shadow-md hover:scale-[0.99] active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-4"
                type="submit"
              >
                Create Account
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          )}

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-outline-variant/50" />
            <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-sm uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t border-outline-variant/50" />
          </div>

          <div className="grid grid-cols-2 gap-stack-md">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors shadow-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="font-label-lg text-on-surface">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors shadow-sm"
            >
              <svg className="h-5 w-5 text-on-surface" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.365 14.717c0-2.895 2.37-4.048 2.479-4.11-1.343-1.96-3.418-2.234-4.148-2.268-1.758-.178-3.435 1.037-4.336 1.037-.902 0-2.29-1.002-3.743-.974-1.895.027-3.642 1.103-4.619 2.8-1.996 3.46-.51 8.585 1.432 11.394.95 1.372 2.083 2.91 3.568 2.854 1.432-.055 1.983-.925 3.712-.925 1.728 0 2.222.925 3.742.898 1.575-.027 2.544-1.399 3.486-2.772 1.092-1.594 1.543-3.136 1.567-3.218-.035-.015-3.04-1.168-3.04-4.582l-.1-1.134zM14.654 4.887c.792-.958 1.325-2.29 1.18-3.626-1.144.046-2.534.764-3.35 1.745-.733.878-1.345 2.24-1.173 3.541 1.28.099 2.551-.699 3.343-1.66z" />
              </svg>
              <span className="font-label-lg text-on-surface">Apple</span>
            </button>
          </div>

          <p className="text-center font-body-md text-on-surface-variant pt-stack-sm">
            Already have an account?{' '}
            <Link className="text-primary font-bold hover:underline transition-all" to="/signin">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
