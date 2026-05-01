import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <img
        src={heroBanner}
        alt="AL Intimates - Moda Íntima Premium"
        className="absolute inset-0 w-full h-full object-cover scale-105"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-foreground/10" />

      {/* Decorative corner frames */}
      <div className="absolute top-32 left-8 md:left-16 w-20 h-20 border-l border-t border-gold-light/30" />
      <div className="absolute top-32 right-8 md:right-16 w-20 h-20 border-r border-t border-gold-light/30" />
      <div className="absolute bottom-8 left-8 md:left-16 w-20 h-20 border-l border-b border-gold-light/30" />
      <div className="absolute bottom-8 right-8 md:right-16 w-20 h-20 border-r border-b border-gold-light/30" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="animate-fade-in">
          <p className="font-script text-gold-light text-2xl md:text-4xl mb-2">Descubra</p>
        </div>

        <h1
          className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-[0.2em] uppercase text-primary-foreground mb-4 animate-fade-in font-light"
          style={{ animationDelay: "0.15s" }}
        >
          AL Intimates
        </h1>

        <div
          className="flex items-center gap-4 mb-8 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <span className="w-12 md:w-20 h-px bg-gradient-to-r from-transparent to-gold-light/60" />
          <p className="font-sans text-[10px] md:text-xs tracking-[0.5em] uppercase text-primary-foreground/70">
            Elegância que abraça você
          </p>
          <span className="w-12 md:w-20 h-px bg-gradient-to-l from-transparent to-gold-light/60" />
        </div>

        <Link
          to="/catalogo"
          className="animate-fade-in group"
          style={{ animationDelay: "0.5s" }}
        >
          <span className="inline-block border border-gold-light/40 text-primary-foreground tracking-[0.4em] uppercase text-[10px] md:text-xs px-12 py-4 font-sans font-light hover:bg-gold-light/10 hover:border-gold-light/70 transition-all duration-500 relative overflow-hidden">
            <span className="relative z-10">Ver Coleção</span>
          </span>
        </Link>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <span className="text-primary-foreground/40 text-[9px] tracking-[0.3em] uppercase font-sans">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold-light/50 to-transparent animate-float" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
