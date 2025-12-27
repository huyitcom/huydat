
import React, { useState } from 'react';

interface WelcomeScreenProps {
  onSuccess: () => void;
}

const PASSWORD = "341341";

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === PASSWORD) {
      // Save session to localStorage
      try {
        localStorage.setItem('ai-photo-studio-auth', 'true');
      } catch (e) {
        console.error("Failed to set item in localStorage", e);
      }
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <center><img src="https://chupanhthe.vn/img/logo2.png" alt="Logo" className="mx-auto mb-4"/></center>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
                AI Photo Studio
            </h1>
            <p className="mt-2 text-lg text-slate-400">
                Please enter the password to continue.
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-slate-800/50 p-8 rounded-2xl shadow-lg border border-slate-700 space-y-6">
          <div>
            <label htmlFor="password-input" className="sr-only">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter security password"
              className="block w-full rounded-md border-0 bg-slate-700/50 py-3 px-4 text-slate-200 shadow-sm ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 transition text-center"
              aria-describedby="password-error"
              autoFocus
            />
          </div>
          
          {error && (
            <p id="password-error" className="text-red-400 text-sm text-center -mt-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full justify-center items-center rounded-md bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};