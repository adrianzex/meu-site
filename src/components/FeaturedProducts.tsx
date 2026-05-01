import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

const FeaturedProducts = () => {
  const { products } = useProducts({ featured: true });
  const featured = products.slice(0, 4);

  return (
    <section className="py-24 md:py-32 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="font-script text-gold text-xl md:text-2xl mb-2">Seleção Especial</p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-[0.15em] mb-4">Destaques da Coleção</h2>
          <div className="flex items-center justify-center gap-4">
            <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <span className="w-1.5 h-1.5 bg-gold rotate-45" />
            <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/catalogo"
            className="inline-block border border-foreground/15 tracking-[0.4em] uppercase text-[10px] px-14 py-4 font-sans font-light hover:border-gold hover:text-gold transition-all duration-500"
          >
            Ver Toda a Coleção
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
