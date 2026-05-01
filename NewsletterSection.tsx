import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-20 md:py-24 bg-burgundy-deep text-primary-foreground px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-gold/15" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-gold/15" />

      <div className="container mx-auto max-w-2xl text-center relative z-10">
        <p className="font-script text-gold-light text-xl md:text-2xl mb-2">Exclusividade</p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-wider mb-3">Clube AL Intimates</h2>
        <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-primary-foreground/60 mb-8">
          Receba ofertas exclusivas, lançamentos e conteúdos especiais
        </p>

        {submitted ? (
          <div className="space-y-2">
            <p className="font-serif text-xl text-gold-light">Obrigada! ✦</p>
            <p className="font-sans text-xs text-primary-foreground/60">Você receberá nossas novidades em breve</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              className="flex-1 bg-transparent border border-primary-foreground/20 px-5 py-3 text-xs tracking-wider font-sans placeholder:text-primary-foreground/30 focus:outline-none focus:border-gold/50 transition-colors"
              required
            />
            <button
              type="submit"
              className="bg-gold text-accent-foreground text-[10px] tracking-[0.3em] uppercase font-sans font-semibold px-8 py-3 hover:bg-gold-light transition-colors"
            >
              Inscrever
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
