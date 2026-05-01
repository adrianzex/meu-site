import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Heart, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const { isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navBg = isHome && !scrolled
    ? "bg-transparent border-transparent"
    : "bg-background/95 backdrop-blur-md border-border/50";

  const textColor = isHome && !scrolled ? "text-primary-foreground" : "text-foreground";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${navBg}`}>
      {/* Top announcement bar */}
      <div className={`text-center py-1.5 text-[10px] tracking-[0.35em] uppercase font-sans transition-all duration-500 ${
        isHome && !scrolled ? "bg-primary-foreground/10 text-primary-foreground/70" : "bg-secondary text-secondary-foreground/70"
      }`}>
        ✦ Frete grátis acima de R$ 299 ✦ Parcele em até 2x sem juros ✦
      </div>

      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
        <button className={`md:hidden ${textColor}`} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="hidden md:flex items-center gap-8 font-sans text-[11px] tracking-[0.2em] uppercase">
          <Link to="/" className={`${textColor} hover:text-gold transition-colors duration-300`}>Home</Link>
          <Link to="/catalogo" className={`${textColor} hover:text-gold transition-colors duration-300`}>Coleção</Link>
          <Link to="/catalogo" className={`${textColor} hover:text-gold transition-colors duration-300`}>Novidades</Link>
        </div>

        <Link to="/" className="flex flex-col items-center">
          <span className={`font-serif text-2xl md:text-3xl tracking-[0.3em] uppercase ${textColor} transition-colors duration-300`}>
            AL Intimates
          </span>
          <span className={`font-script text-[10px] md:text-xs ${isHome && !scrolled ? "text-gold-light" : "text-gold"} -mt-1`}>
            Moda Íntima Premium
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" title="Painel Admin" className={`${textColor} hidden md:block hover:text-gold transition-colors duration-300`}>
              <LayoutDashboard className="w-[18px] h-[18px]" />
            </Link>
          )}
          <button className={`${textColor} hidden md:block hover:text-gold transition-colors duration-300`}>
            <Heart className="w-[18px] h-[18px]" />
          </button>
          <button onClick={() => setIsOpen(true)} className={`relative ${textColor} hover:text-gold transition-colors duration-300`}>
            <ShoppingBag className="w-[18px] h-[18px]" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-gold text-accent-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-6 pt-2">
          <div className="flex flex-col gap-1 font-sans text-[11px] tracking-[0.2em] uppercase">
            <Link to="/" onClick={() => setMenuOpen(false)} className="py-3 hover:text-gold transition-colors border-b border-border/30">Home</Link>
            <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="py-3 hover:text-gold transition-colors border-b border-border/30">Coleção</Link>
            <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="py-3 hover:text-gold transition-colors">Novidades</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
