import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 34, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <Link to="/" className="flex items-center gap-2 select-none">
      <svg width={s.icon} height={s.icon} viewBox="0 0 512 512"
           xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="100" fill="#0070F3"/>
        <path d="M160 200 C160 200 150 180 180 160 L332 160 C362 180 352 200 352 200
                 L380 380 C380 400 360 420 340 420 L172 420 C152 420 132 400 132 380 Z"
              fill="white" opacity="0.95"/>
        <path d="M210 160 C210 120 230 100 256 100 C282 100 302 120 302 160"
              fill="none" stroke="white" strokeWidth="24" strokeLinecap="round"/>
        <text x="256" y="330"
              fontFamily="Arial Black, sans-serif"
              fontSize="120"
              fontWeight="900"
              fill="#0070F3"
              textAnchor="middle">S</text>
      </svg>
      <span className={`font-heading font-bold ${s.text} dark:text-white`}>
        Sky<span className="text-primary">Mall</span>
      </span>
    </Link>
  );
};

export default Logo;
