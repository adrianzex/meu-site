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
  phone: z.string(),
  cpf: z.string(),
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

      // 🔥 CHAMANDO O NOVO CHECKOUT PRO
      const { data, error } = await supabase.functions.invoke(
        "checkout-create",
        {
          body: payload,
        }
      );

      if (error) throw error;

      if (!data?.init_point) {
        throw new Error("Link de pagamento não gerado");
      }

      setOpen(false);

      // 🚀 REDIRECIONA DIRETO PRO MERCADO PAGO
      window.location.href = data.init_point;
    } catch (err) {
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
        <DialogHeader>import { useState } from "react";
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
  phone: z.string(),
  cpf: z.string(),
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

      console.log("RESPOSTA SUPABASE:", res);

      if (res.error) throw res.error;

      // 🔥 pega resposta com segurança (duas formas possíveis)
      const initPoint =
        res.data?.init_point || res.data?.data?.init_point;

      if (!initPoint) {
        throw new Error("init_point não retornado pela função");
      }

      setOpen(false);

      // 🚀 redireciona para Mercado Pago
      window.location.href = initPoint;
    } catch (err) {
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
          <DialogTitle>Checkout Pix</DialogTitle>
          <DialogDescription>
            R$ {amount.toFixed(2)}
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
          <DialogTitle>Checkout Pix</DialogTitle>
          <DialogDescription>
            R$ {amount.toFixed(2)}
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