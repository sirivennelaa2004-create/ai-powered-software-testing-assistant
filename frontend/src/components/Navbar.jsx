import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <Link to="/" className="brand-logo">
          <ShieldCheck size={26} className="brand-icon" />
          <span className="brand-title">AI Testing Assistant</span>
          <span className="brand-tag"><Sparkles size={12} /> AI Powered</span>
        </Link>
      </div>

      {user && (
        <div className="navbar-user">
          <div className="user-profile">
            <UserIcon size={18} className="user-avatar-icon" />
            <div className="user-details">
              <span className="user-name">{user.full_name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="btn-logout" title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
