import { Instagram, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Gold top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-serif text-2xl tracking-[0.2em] uppercase">AL Intimates</h3>
            <p className="font-script text-gold-light text-sm">Moda Íntima Premium</p>
            <p className="font-sans text-[11px] text-background/50 leading-relaxed">
              Peças exclusivas para mulheres que valorizam elegância, conforto e sofisticação em cada detalhe.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-8 h-8 border border-background/15 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 border border-background/15 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">Navegação</h4>
            <div className="flex flex-col gap-2 font-sans text-[11px] text-background/50">
              <Link to="/" className="hover:text-gold transition-colors">Home</Link>
              <Link to="/catalogo" className="hover:text-gold transition-colors">Coleção Completa</Link>
              <Link to="/catalogo" className="hover:text-gold transition-colors">Novidades</Link>
              <Link to="/catalogo" className="hover:text-gold transition-colors">Best Sellers</Link>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h4 className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">Informações</h4>
            <div className="flex flex-col gap-2 font-sans text-[11px] text-background/50">
              <span>Guia de Tamanhos</span>
              <span>Cuidados com as Peças</span>
              <span>Política de Privacidade</span>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">Contato</h4>
            <div className="space-y-3 font-sans text-[11px] text-background/50">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-gold/60" />
                <span>Monte Carlo, SC - Brasil</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 mt-0.5 text-gold/60" />
                <span>adriellileodoro28@gmail.com</span>
              </div>
            <div className="pt-2">
              <p className="text-[10px] text-background/30 tracking-wider">Aceitamos</p>
              <p className="text-[11px] text-background/50 mt-1">Pix • WhatsApp Pay</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
            © {new Date().getFullYear()} AL Intimates. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-3">
            <span className="w-1 h-1 bg-gold/40 rotate-45" />
            <p className="font-script text-gold/40 text-xs">feito com amor</p>
            <span className="w-1 h-1 bg-gold/40 rotate-45" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
