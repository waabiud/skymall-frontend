import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <h1 className="font-heading text-6xl font-bold text-primary">404</h1>
    <p className="text-gray-500 dark:text-gray-400">Page not found</p>
    <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-600 transition">
      <FiHome size={16} /> Go Home
    </Link>
  </div>
);

export default NotFoundPage;
