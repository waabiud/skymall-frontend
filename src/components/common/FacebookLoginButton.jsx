import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';

const FACEBOOK_APP_ID = '1915903779124505';

const FacebookLoginButton = ({ label = 'Continue with Facebook' }) => {
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();
  const [loading,  setLoading]  = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (window.FB) { setSdkReady(true); return; }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId:   FACEBOOK_APP_ID,
        cookie:  true,
        xfbml:   true,
        version: 'v19.0',
      });
      setSdkReady(true);
    };

    if (!document.getElementById('facebook-sdk')) {
      const script    = document.createElement('script');
      script.id       = 'facebook-sdk';
      script.src      = 'https://connect.facebook.net/en_US/sdk.js';
      script.async    = true;
      script.defer    = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleLogin = () => {
    if (!sdkReady) { toast.error('Facebook SDK loading, try again'); return; }
    if (loading)   return;

    window.FB.login((response) => {
      if (response.authResponse) {
        const { accessToken } = response.authResponse;
        setLoading(true);

        window.FB.api('/me', { fields: 'name,email' }, (userData) => {
          api.post('/auth/facebook/', {
            token: accessToken,
            email: userData.email || '',
            name:  userData.name  || '',
          })
          .then((res) => {
            setAuth(res.data.user, res.data.access, res.data.refresh);
            toast.success(`Welcome, ${res.data.user.full_name || res.data.user.username}`);
            navigate('/');
          })
          .catch((err) => {
            toast.error(err.response?.data?.error || 'Facebook login failed');
          })
          .finally(() => {
            setLoading(false);
          });
        });
      } else {
        toast.error('Facebook login cancelled');
      }
    }, { scope: 'public_profile,email' });
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4
                 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl
                 transition disabled:opacity-60 disabled:cursor-not-allowed
                 font-semibold text-sm">
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white
                        rounded-full animate-spin" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12
                   12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007
                   1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491
                   0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612
                   23.027 24 18.062 24 12.073z"/>
        </svg>
      )}
      {loading ? 'Signing in...' : label}
    </button>
  );
};

export default FacebookLoginButton;
