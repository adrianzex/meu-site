import { Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import PixPayment from "@/components/PixPayment";

const CartDrawer = () => {
  const { items, removeItem, totalPrice, isOpen, setIsOpen } = useCart();

  const handleWhatsApp = () => {
    const msg = items
      .map((i) => `✦ ${i.product.name} (Tam: ${i.size}) - R$ ${i.product.price.toFixed(2)} x${i.quantity}`)
      .join("\n");
    const total = `\n\n✦ Total: R$ ${totalPrice.toFixed(2)}`;
    const text = encodeURIComponent(`Olá! Gostaria de finalizar meu pedido:\n\n${msg}${total}`);
    window.open(`https://wa.me/55991127702?text=${text}`, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-border/50">
        <SheetHeader className="pb-6 border-b border-border/50">
          <SheetTitle className="font-serif text-xl tracking-[0.15em]">Seu Carrinho</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-16 h-16 border border-border/50 flex items-center justify-center">
              <span className="font-serif text-2xl text-muted-foreground/30">✦</span>
            </div>
            <p className="text-muted-foreground font-sans text-xs tracking-wider">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100%-5rem)] mt-6">
            <div className="flex-1 overflow-auto space-y-5">
              {items.map((item) => (
                <div key={item.product.id + item.size} className="flex gap-4 pb-5 border-b border-border/30">
                  <div className="w-20 h-24 overflow-hidden bg-muted">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 font-sans">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">{item.product.category}</p>
                    <p className="text-sm font-medium tracking-wider">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Tam: {item.size} · Qtd: {item.quantity}</p>
                    <p className="text-sm font-semibold text-primary mt-2">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-primary transition-colors self-start mt-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-auto pb-6 space-y-5 pt-6 border-t border-border/50">
              <div className="flex justify-between font-sans items-baseline">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Total</span>
                <span className="text-xl font-serif">R$ {totalPrice.toFixed(2)}</span>
              </div>
              <Button onClick={handleWhatsApp} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 tracking-[0.2em] uppercase text-[10px] py-6 font-sans">
                <MessageCircle className="w-4 h-4" />
                Finalizar via WhatsApp
              </Button>
              <PixPayment
                amount={totalPrice}
                productName={`Pedido com ${items.length} ${items.length === 1 ? "item" : "itens"}`}
                items={items.map((i) => ({
                  id: i.product.id,
                  name: i.product.name,
                  price: i.product.price,
                  quantity: i.quantity,
                  size: i.size,
                }))}
              />
              <p className="text-center font-sans text-[9px] text-muted-foreground/60 tracking-wider">
                Pagamento seguro via Pix ou WhatsApp
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
