import { Sparkles, Truck, Shield, Gift } from "lucide-react";

const benefits = [
  {
    icon: Sparkles,
    title: "Qualidade Premium",
    desc: "Peças em renda francesa e tecidos nobres selecionados à mão",
  },
  {
    icon: Truck,
    title: "Entrega Discreta",
    desc: "Embalagem elegante e anônima, com frete grátis acima de R$ 299",
  },
  {
    icon: Shield,
    title: "Compra Segura",
    desc: "Pagamento via Pix ou WhatsApp com total segurança e sigilo",
  },
  {
    icon: Gift,
    title: "Embalagem Presente",
    desc: "Todas as peças acompanham caixa e laço para presentear",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 md:py-24 bg-secondary/50 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="text-center group">
              <div className="w-14 h-14 mx-auto mb-4 border border-gold/30 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/5 transition-all duration-500">
                <b.icon className="w-5 h-5 text-gold" />
              </div>
              <h4 className="font-serif text-base md:text-lg tracking-wider mb-2">{b.title}</h4>
              <p className="font-sans text-[11px] text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
