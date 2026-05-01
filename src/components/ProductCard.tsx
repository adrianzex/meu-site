import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    is_featured?: boolean;
  };
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  return (
    <Link
      to={`/produto/${product.id}`}
      className="group block animate-reveal"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative overflow-hidden aspect-[3/4] mb-5 bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={1024}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {product.is_featured && (
          <span className="absolute top-3 left-3 bg-gold text-accent-foreground text-[9px] tracking-[0.2em] uppercase font-sans font-semibold px-3 py-1">
            Destaque
          </span>
        )}

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="bg-background/90 backdrop-blur-sm w-9 h-9 flex items-center justify-center hover:bg-gold hover:text-accent-foreground transition-colors">
            <Heart className="w-4 h-4" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <span className="block text-center bg-background/90 backdrop-blur-sm text-foreground text-[10px] tracking-[0.3em] uppercase font-sans py-3">
            Ver Detalhes
          </span>
        </div>
      </div>

      <div className="font-sans text-center space-y-2 px-2">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{product.category}</p>
        <h3 className="font-serif text-base md:text-lg tracking-wider font-normal">{product.name}</h3>
        <div className="flex items-center justify-center gap-2">
          <p className="text-primary font-semibold text-sm">R$ {product.price.toFixed(2)}</p>
          <span className="text-[10px] text-muted-foreground">ou 3x de R$ {(product.price / 3).toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
