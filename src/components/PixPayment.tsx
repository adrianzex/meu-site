import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PixPaymentProps {
  amount: number;
  productName: string;
  items?: Array<{ id: string; name: string; price: number; quantity: number }>;
}

const Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  cpf: z.string().min(11),
});

const PixPayment = ({ amount, productName, items }: PixPaymentProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  });

  const { toast } = useToast();

  const handleGenerate = async () => {
    const parsed = Schema.safeParse(form);

    if (!parsed.success) {
      toast({
        title: "Erro nos dados",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items:
          items ??
          [
            {
              name: productName,
              price: amount,
            },
          ],
      };

      // 🔥 chama Supabase
      const res = await supabase.functions.invoke("checkout-create", {
        body: payload,
      });

      console.log("SUPABASE RESPONSE:", res);

      if (res.error) throw res.error;

      const initPoint = res.data?.init_point;

      if (!initPoint) {
        throw new Error("init_point não retornado");
      }

      setOpen(false);

      // 🚀 redireciona para Mercado Pago
      window.location.href = initPoint;
    } catch (err) {
      console.error(err);

      toast({
        title: "Erro ao gerar pagamento",
        description:
          err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full uppercase text-xs tracking-widest">
          Pagar com Pix
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagamento Pix</DialogTitle>
          <DialogDescription>
            Valor: R$ {amount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div>
            <Label>CPF</Label>
            <Input
              value={form.cpf}
              onChange={(e) =>
                setForm({ ...form, cpf: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Telefone</Label>
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            )}
            {loading ? "Gerando..." : "Ir para pagamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixPayment;