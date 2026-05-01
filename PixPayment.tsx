import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PixPaymentProps {
  amount: number;
  productName: string;
  items?: Array<{ id: string; name: string; price: number; quantity: number; size?: string }>;
}

const Schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().email("E-mail inválido").max(160),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  cpf: z.string().trim().min(11, "CPF inválido").max(14),
});

const PixPayment = ({ amount, productName, items }: PixPaymentProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", cpf: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Verifique seus dados",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: items ?? [{ id: "single", name: productName, price: amount, quantity: 1 }],
        customer: parsed.data,
      };
      const { data, error } = await supabase.functions.invoke("pix-create", { body: payload });
      if (error) throw error;
      if (!data?.paymentId) throw new Error("Resposta inválida do servidor");
      setOpen(false);
      navigate(`/checkout?id=${data.paymentId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar Pix";
      toast({ title: "Não foi possível gerar o Pix", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full tracking-wider uppercase text-xs font-sans border-foreground/20 hover:bg-foreground/5 py-5">
          Pagar com Pix
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wider text-center">Gerar Pix</DialogTitle>
          <DialogDescription className="text-center text-xs">
            R$ {amount.toFixed(2).replace(".", ",")} — preencha seus dados para receber o QR code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label className="text-[10px] tracking-[0.2em] uppercase">Nome completo</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label className="text-[10px] tracking-[0.2em] uppercase">E-mail</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] tracking-[0.2em] uppercase">CPF</Label>
              <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
            </div>
            <div>
              <Label className="text-[10px] tracking-[0.2em] uppercase">WhatsApp</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 tracking-[0.2em] uppercase text-[10px] py-6 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Gerando QR Code..." : "Gerar QR Code Pix"}
          </Button>
          <p className="text-[10px] text-muted-foreground/70 text-center">
            Pagamento processado pelo Mercado Pago.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixPayment;
