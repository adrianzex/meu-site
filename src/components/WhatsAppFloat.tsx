import { MessageCircle } from "lucide-react";

const WhatsAppFloat = () => {
  return (
    <a
      href="https://wa.me/5549991127702?text=Olá! Gostaria de saber mais sobre os produtos da AL Intimates."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Contato via WhatsApp"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full animate-float" />
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background text-foreground font-sans text-[10px] tracking-wider px-4 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Fale Conosco ✦
        </span>
      </div>
    </a>
  );
};

export default WhatsAppFloat;
