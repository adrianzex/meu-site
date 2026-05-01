import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingBag, ArrowLeft, Heart, Shield, Truck, RotateCcw } from "lucide-react";
import PixPayment from "@/components/PixPayment";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProduct, useProducts } from "@/hooks/useProducts";

const ProductDetail = () => {
  const { id } = useParams();
  const { product, loading } = useProduct(id);
  const { products: all } = useProducts();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");

  if (loading) {
    return <div className="pt-32 text-center font-sans min-h-screen text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!product) {
    return (
      <div className="pt-32 text-center font-sans min-h-screen">
        <p className="text-lg">Produto não encontrado</p>
        <Link to="/catalogo" className="text-gold underline mt-4 inline-block text-sm">Voltar ao catálogo</Link>
      </div>
    );
  }

  const relatedProducts = all.filter((p) => p.id !== product.id).slice(0, 4);

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Tenho interesse no produto:\n\n✦ ${product.name}\n✦ Tamanho: ${selectedSize || "A definir"}\n✦ Valor: R$ ${product.price.toFixed(2)}\n\nPoderia me ajudar?`
    );
    window.open(`https://wa.me/5549991127702?text=${text}`, "_blank");
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(
      { id: product.id, name: product.name, price: product.price, image: product.image, category: product.category },
      selectedSize
    );
  };

  return (
    <main className="pt-24 md:pt-28">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center gap-2 font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-10">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <span>✦</span>
          <Link to="/catalogo" className="hover:text-gold transition-colors">Coleção</Link>
          <span>✦</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-20 max-w-6xl mx-auto">
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" width={800} height={1024} />
            </div>
            <div className="absolute -top-3 -left-3 w-12 h-12 border-l border-t border-gold/25" />
            <div className="absolute -bottom-3 -right-3 w-12 h-12 border-r border-b border-gold/25" />
          </div>

          <div className="flex flex-col justify-center space-y-7 font-sans">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{product.category}</p>
              <h1 className="font-serif text-3xl md:text-4xl tracking-wider mb-4 font-normal">{product.name}</h1>
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-semibold text-primary">R$ {product.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">ou 3x de R$ {(product.price / 3).toFixed(2)} sem juros</p>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-gold/20 via-gold/10 to-transparent" />

            <p className="text-sm text-muted-foreground leading-[1.9]">{product.description}</p>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] tracking-[0.3em] uppercase">Tamanho</p>
                <button className="text-[10px] tracking-wider text-gold hover:underline">Guia de Tamanhos</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 border text-sm tracking-wider transition-all duration-300 ${
                      selectedSize === size
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border hover:border-gold/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 tracking-[0.25em] uppercase text-[10px] py-7 font-sans disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4" />
                Adicionar ao Carrinho
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleWhatsApp}
                  variant="outline"
                  className="gap-2 tracking-[0.15em] uppercase text-[10px] py-5 border-foreground/15 hover:border-gold hover:text-gold font-sans"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </Button>
                <PixPayment amount={product.price} productName={product.name} />
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-gold transition-colors">
                <Heart className="w-3.5 h-3.5" />
                Adicionar aos Favoritos
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <Shield className="w-4 h-4 mx-auto mb-1.5 text-gold/60" />
                <p className="text-[9px] tracking-wider uppercase text-muted-foreground">Compra Segura</p>
              </div>
              <div className="text-center">
                <Truck className="w-4 h-4 mx-auto mb-1.5 text-gold/60" />
                <p className="text-[9px] tracking-wider uppercase text-muted-foreground">Entrega Discreta</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-4 h-4 mx-auto mb-1.5 text-gold/60" />
                <p className="text-[9px] tracking-wider uppercase text-muted-foreground">Troca Fácil</p>
              </div>
            </div>

            {product.details.length > 0 && (
              <div className="border-t border-border pt-6 space-y-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Detalhes da Peça</p>
                <ul className="space-y-3">
                  {product.details.map((detail) => (
                    <li key={detail} className="text-sm text-muted-foreground flex items-center gap-3">
                      <span className="w-1 h-1 bg-gold rotate-45" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-24 md:mt-32 mb-12">
            <div className="text-center mb-12">
              <p className="font-script text-gold text-lg mb-2">Você também vai amar</p>
              <h2 className="font-serif text-2xl md:text-3xl tracking-wider">Peças Relacionadas</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 max-w-6xl mx-auto">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default ProductDetail;
