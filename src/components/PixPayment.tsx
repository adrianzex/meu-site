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

  // 🔥 NOVOS ESTADOS
  const [qrCode, setQrCode] = useState("");
  const [qrImage, setQrImage] = useState("");

  const { toast } = useToast();

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
        items: items ?? [
          { id: "single", name: productName, price: amount, quantity: 1 },
        ],
        customer: parsed.data,
      };

      const { data, error } = await supabase.functions.invoke("pix-create", {
        body: payload,
      });

      if (error) throw error;

      if (!data?.qr_code) throw new Error("Erro ao gerar QR Code");

      // ✅ AQUI MUDA TUDO
      setQrCode(data.qr_code);
      setQrImage(data.qr_code_base64);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar Pix";
      toast({
        title: "Não foi possível gerar o Pix",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          Pagar com Pix
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Pix</DialogTitle>
          <DialogDescription>
            R$ {amount.toFixed(2).replace(".", ",")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Input
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            placeholder="CPF"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
          />

          <Input
            placeholder="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar QR Code Pix"
            )}
          </Button>

          {/* 🔥 QR CODE AQUI */}
          {qrImage && (
            <div className="mt-4 text-center">
              <h2>Pague com Pix</h2>

              <img
                src={`data:image/png;base64,${qrImage}`}
                alt="QR Code Pix"
                className="mx-auto my-2 w-40"
              />

              <textarea
                value={qrCode}
                readOnly
                className="w-full text-xs p-2 border rounded"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixPayment;