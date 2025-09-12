
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Huy Dat AI Photo Studio
      </h1>
      <p className="mt-2 text-lg text-slate-400">
        powered by LOFWI
      </p>
    </header>
  );
};
