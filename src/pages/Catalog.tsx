import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";

const Catalog = () => {
  const { products, loading } = useProducts();
  const [active, setActive] = useState("Todos");

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["Todos", ...Array.from(set)];
  }, [products]);

  const filtered = active === "Todos" ? products : products.filter((p) => p.category === active);

  return (
    <main className="pt-24 md:pt-28">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="text-center mb-14">
          <p className="font-script text-gold text-xl md:text-2xl mb-2">Explore</p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-[0.15em] mb-4">Nossa Coleção</h1>
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <span className="w-1.5 h-1.5 bg-gold rotate-45" />
            <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="font-sans text-[11px] text-muted-foreground tracking-[0.2em] uppercase">
            Peças pensadas para cada momento especial
          </p>
        </div>

        <div className="flex justify-center gap-2 md:gap-6 mb-14 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`font-sans text-[10px] md:text-[11px] tracking-[0.25em] uppercase px-4 py-2.5 transition-all duration-300 border ${
                active === cat
                  ? "border-gold bg-gold/5 text-gold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center font-sans text-sm text-muted-foreground py-20">Carregando produtos...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8 max-w-6xl mx-auto">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center font-sans text-sm text-muted-foreground py-20">
                Nenhum produto encontrado nesta categoria.
              </p>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default Catalog;
