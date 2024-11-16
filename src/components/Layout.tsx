import React from 'react';
import { Footer } from './Footer';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <motion.div 
            className="flex justify-end mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              Çıkış Yap
            </motion.button>
          </motion.div>
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
};