
import { Instagram, Youtube, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">© {new Date().getFullYear()} Painel de Investimentos. Todos os direitos reservados.</p>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="#" 
              className="text-teal hover:text-green transition-colors hover-effect"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="#" 
              className="text-teal hover:text-green transition-colors hover-effect"
              aria-label="Youtube"
            >
              <Youtube size={20} />
            </a>
            <a 
              href="#" 
              className="text-teal hover:text-green transition-colors hover-effect"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
