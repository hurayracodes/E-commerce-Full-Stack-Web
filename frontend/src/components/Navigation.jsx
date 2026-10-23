import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Search, ShoppingBag, ChevronDown } from "lucide-react";

function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div>
      <header className="sticky top-0 z-50 bg-rose-500 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <nav className="w-[95%] max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-xl font-bold tracking-tight text-white">
              Nogozie<span className="text-indigo-600">Front</span>
            </span>
          </div>

          {/* Nav Links */}
          <ul className="flex items-center gap-4">
            <NavLink
              to="/"
              className="text-slate-50 hover:text-indigo-600 transition-colors"
            >
              <p>Home</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-indigo-600 hidden" />
            </NavLink>
            <NavLink
              to="/collection"
              className="text-slate-50 hover:text-indigo-600 transition-colors"
            >
              <p>Collection</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-indigo-600 hidden" />
            </NavLink>
            <NavLink
              to="/about"
              className="text-slate-50 hover:text-indigo-600 transition-colors"
            >
              <p>About</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-indigo-600 hidden" />
            </NavLink>
            <NavLink
              to="/contact"
              className="text-slate-50 hover:text-indigo-600 transition-colors"
            >
              <p>Contact</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-indigo-600 hidden" />
            </NavLink>
          </ul>

          {/* Right Action Menu */}
          <div className="flex items-center gap-4">
            <span className="text-slate-50 hover:text-indigo-600 transition-colors cursor-pointer">
              <Search />
            </span>

            {/* React Dropdown */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                Options
                <ChevronDown className="-mr-1 size-5 text-gray-200" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 p-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-colors"
                  >
                    Account settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-colors"
                  >
                    Support
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-colors"
                  >
                    License
                  </a>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            <span className="text-slate-50 hover:text-indigo-600 transition-colors cursor-pointer">
              <ShoppingBag />
            </span>
          </div>

        </nav>
      </header>
    </div>
  );
}

export default Navigation;