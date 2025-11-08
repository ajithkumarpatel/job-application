import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MenuIcon, XIcon, BriefcaseIcon, DocumentTextIcon, CollectionIcon, LogoutIcon } from './IconComponents';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const baseLinkClass = "flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg";
  const activeLinkClass = 'bg-white/10 text-white';

  const getLinkClassName = ({ isActive }: { isActive: boolean }) => 
    isActive ? `${baseLinkClass} ${activeLinkClass}` : baseLinkClass;

  const navLinks = (
    <>
      <NavLink to="/dashboard" className={getLinkClassName}>
        <BriefcaseIcon className="w-5 h-5 mr-2" />
        Dashboard
      </NavLink>
      <NavLink to="/cover-letter" className={getLinkClassName}>
        <DocumentTextIcon className="w-5 h-5 mr-2" />
        Cover Letter
      </NavLink>
      <NavLink to="/history" className={getLinkClassName}>
        <CollectionIcon className="w-5 h-5 mr-2" />
        History
      </NavLink>
    </>
  );

  return (
    <nav className="bg-black/20 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">Gemini Job Dashboard</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {navLinks}
            <button onClick={onLogout} className={`${baseLinkClass} bg-red-500/80 hover:bg-red-500`}>
              <LogoutIcon className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
              {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks}
          <button onClick={onLogout} className={`${baseLinkClass} bg-red-500/80 hover:bg-red-500 w-full text-left`}>
            <LogoutIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
