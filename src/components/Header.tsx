
import { useState } from "react";
import { Menu, X } from "lucide-react";
import LoginButton from "./LoginButton";

type HeaderProps = {
  activeTab: "stocks" | "forex";
  setActiveTab: (tab: "stocks" | "forex") => void;
};

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="font-bold text-xl text-teal">Painel de Investimentos</h1>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="text-gray-500 hover:text-teal focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-4">
            <button
              className={`px-4 py-2 rounded-md hover:bg-gray transition-colors ${
                activeTab === "stocks" ? "bg-teal text-white" : "text-teal"
              }`}
              onClick={() => setActiveTab("stocks")}
            >
              📈 Ações
            </button>
            <button
              className={`px-4 py-2 rounded-md hover:bg-gray transition-colors ${
                activeTab === "forex" ? "bg-teal text-white" : "text-teal"
              }`}
              onClick={() => setActiveTab("forex")}
            >
              💱 Forex
            </button>
            <LoginButton />
          </nav>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              className={`block w-full text-left px-4 py-2 rounded-md ${
                activeTab === "stocks" ? "bg-teal text-white" : "text-teal hover:bg-gray"
              }`}
              onClick={() => {
                setActiveTab("stocks");
                setMobileMenuOpen(false);
              }}
            >
              📈 Ações
            </button>
            <button
              className={`block w-full text-left px-4 py-2 rounded-md ${
                activeTab === "forex" ? "bg-teal text-white" : "text-teal hover:bg-gray"
              }`}
              onClick={() => {
                setActiveTab("forex");
                setMobileMenuOpen(false);
              }}
            >
              💱 Forex
            </button>
            <div className="mt-2 px-4 py-2">
              <LoginButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
