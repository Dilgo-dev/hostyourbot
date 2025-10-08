import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-900/95 backdrop-blur-lg border-b border-white/10'
            : 'bg-slate-900/80 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <FaRocket className="text-purple-400 text-2xl" />
              <span className="text-white text-xl font-bold">HostYourBot</span>
            </Link>

            {/* Navigation centrale */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#fonctionnalites"
                className="text-slate-300 hover:text-purple-400 transition-colors duration-200 font-medium"
              >
                Fonctionnalités
              </a>
              <a
                href="#tarifs"
                className="text-slate-300 hover:text-purple-400 transition-colors duration-200 font-medium"
              >
                Tarifs
              </a>
              <a
                href="#documentation"
                className="text-slate-300 hover:text-purple-400 transition-colors duration-200 font-medium"
              >
                Documentation
              </a>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50"
                >
                  Aller au Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:block text-slate-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50"
                  >
                    Démarrer
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
      <Outlet />
    </>
  );
}
