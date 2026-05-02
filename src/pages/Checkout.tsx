import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2, MessageCircle, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";

interface PaymentRow {
  id: string;
  amount: number;
  status: string;
  qr_code: string | null;
  qr_code_base64: string | null;
  ticket_url: string | null;
  expires_at: string | null;
}

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Aguardando pagamento", tone: "text-amber-700" },
  in_process: { label: "Processando", tone: "text-amber-700" },
  approved: { label: "Pagamento confirmado", tone: "text-emerald-700" },
  rejected: { label: "Pagamento recusado", tone: "text-destructive" },
  cancelled: { label: "Pagamento cancelado", tone: "text-destructive" },
  refunded: { label: "Reembolsado", tone: "text-muted-foreground" },
  failed: { label: "Falha ao gerar Pix", tone: "text-destructive" },
};

const Checkout = () => {
  const [params] = useSearchParams();
  const id = params.get("id");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [payment, setPayment] = useState<PaymentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/", { replace: true });
      return;
    }

    let active = true;
    const fetchPayment = async () => {
      const { data } = await supabase
        .from("payments")
        .select("id, amount, status, qr_code, qr_code_base64, ticket_url, expires_at")
        .eq("id", id)
        .maybeSingle();
      if (active && data) setPayment(data as PaymentRow);
      if (active) setLoading(false);
    };
    fetchPayment();

    // Realtime updates when webhook confirms
    const channel = supabase
      .channel(`payment-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "payments", filter: `id=eq.${id}` },
        (payload) => {
          setPayment(payload.new as PaymentRow);
          if ((payload.new as PaymentRow).status === "approved") {
            clearCart();
            toast({ title: "Pagamento confirmado!", description: "Em breve entraremos em contato." });
          }
        },
      )
      .subscribe();

    // Polling fallback every 6s
    const interval = setInterval(fetchPayment, 6000);

    return () => {
      active = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const copyCode = () => {
    if (!payment?.qr_code) return;
    navigator.clipboard.writeText(payment.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="min-h-screen pt-32 text-center font-sans">
        <p>Pedido não encontrado.</p>
        <Link to="/" className="text-gold underline text-sm mt-4 inline-block">Voltar para a loja</Link>
      </main>
    );
  }

  const statusInfo = STATUS_LABELS[payment.status] ?? { label: payment.status, tone: "text-muted-foreground" };
  const isApproved = payment.status === "approved";

  return (
    <main className="min-h-screen pt-24 md:pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold transition-colors font-sans mb-8"
        >
          <ArrowLeft className="w-3 h-3" /> Continuar comprando
        </Link>

        <div className="bg-card border border-border/60 p-6 md:p-10 shadow-sm">
          <div className="text-center mb-8">
            <p className="font-script text-gold text-xl mb-1">Pagamento</p>
            <h1 className="font-serif text-3xl md:text-4xl tracking-[0.15em] uppercase">Pix</h1>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="w-12 h-px bg-gold/40" />
              <Sparkles className="w-3 h-3 text-gold" />
              <span className="w-12 h-px bg-gold/40" />
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-sans">Total</p>
            <p className="font-serif text-4xl md:text-5xl text-primary mt-1">
              R$ {Number(payment.amount).toFixed(2).replace(".", ",")}
            </p>
            <p className={`mt-3 text-[11px] tracking-[0.3em] uppercase font-sans ${statusInfo.tone}`}>
              {statusInfo.label}
            </p>
          </div>

          {isApproved ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-700" />
              </div>
              <p className="font-serif text-xl">Recebemos seu pagamento</p>
              <p className="text-sm text-muted-foreground font-sans max-w-sm mx-auto">
                Em breve entraremos em contato pelo WhatsApp para confirmar a entrega.
              </p>
              <Button
                onClick={() =>
                  window.open(
                    `https://wa.me/5549991127702?text=${encodeURIComponent(
                      `Olá! Acabei de pagar o pedido ${payment.id.slice(0, 8)}.`,
                    )}`,
                    "_blank",
                  )
                }
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 tracking-[0.2em] uppercase text-[10px] py-6 px-8"
              >
                <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
              </Button>
            </div>
          ) : payment.qr_code ? (
            <>
              {payment.qr_code_base64 && (
                <div className="bg-white p-6 border border-border flex items-center justify-center mb-6">
                  <img
                    src={`data:image/png;base64,${payment.qr_code_base64}`}
                    alt="QR Code Pix"
                    className="w-56 h-56"
                  />
                </div>
              )}

              <p className="text-center text-[11px] tracking-[0.25em] uppercase text-muted-foreground font-sans mb-3">
                Ou copie o código Pix
              </p>
              <div className="bg-muted p-3 text-xs break-all text-muted-foreground font-mono mb-4 max-h-24 overflow-y-auto">
                {payment.qr_code}
              </div>

              <Button
                onClick={copyCode}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 tracking-[0.2em] uppercase text-[10px] py-6"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Código copiado" : "Copiar código Pix"}
              </Button>

              <p className="text-center text-[10px] text-muted-foreground/70 font-sans mt-6">
                Esta página atualiza automaticamente após o pagamento.
              </p>
            </>
          ) : (
            <p className="text-center py-8 text-sm text-muted-foreground">
              Não foi possível carregar o QR code. Tente novamente em instantes.
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Checkout;
