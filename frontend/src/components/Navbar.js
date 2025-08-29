import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  Search, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Database,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/search', icon: Search, label: 'Vector Search' },
    { path: '/prompts', icon: MessageSquare, label: 'Prompts' },
    { path: '/similarity', icon: BarChart3, label: 'Similarity' },
    { path: '/structured', icon: Settings, label: 'Structured' },
    { path: '/embeddings', icon: Database, label: 'Embeddings' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Database size={24} />
          Smart Q&A
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <style jsx>{`
        .navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          text-decoration: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .navbar-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          text-decoration: none;
          color: #4a5568;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .navbar-item:hover {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }

        .navbar-item.active {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          font-weight: 600;
        }

        .navbar-item.active::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #667eea;
          border-radius: 50%;
        }

        .navbar-toggle {
          display: none;
          background: none;
          border: none;
          color: #4a5568;
          cursor: pointer;
          padding: 5px;
          border-radius: 5px;
          transition: color 0.3s ease;
        }

        .navbar-toggle:hover {
          color: #667eea;
        }

        @media (max-width: 768px) {
          .navbar-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            padding: 20px;
            gap: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transform: translateY(-10px);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }

          .navbar-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .navbar-item {
            width: 100%;
            justify-content: flex-start;
            padding: 15px 20px;
            border-radius: 10px;
          }

          .navbar-item.active::after {
            display: none;
          }

          .navbar-toggle {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
