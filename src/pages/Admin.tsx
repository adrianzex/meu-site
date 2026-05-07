import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Plus,
  LogOut,
  Download,
} from "lucide-react";

/* ================= TYPES ================= */
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  is_active: boolean;
  is_featured: boolean;
  sold_out: boolean;
};

type Category = {
  id: string;
  name: string;
  image: string;
};

/* ================= ADMIN ================= */
export default function Admin() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { upload: uploadImage } = useImageUpload();

  const [tab, setTab] = useState("products");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [openProduct, setOpenProduct] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const [form, setForm] = useState<any>({
    name: "",
    price: "",
    image: "",
    category: "",
    description: "",
    is_active: true,
    is_featured: false,
    sold_out: false,
  });

  const [catForm, setCatForm] = useState({
    name: "",
    image: "",
  });

  /* ================= LOAD ================= */
  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("categories").select("*"),
    ]);

    setProducts((p.data as any) || []);
    setCategories((c.data as any) || []);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("realtime-admin")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  /* ================= PRODUCT ================= */
  const saveProduct = async () => {
    const payload = {
      name: form.name,
      price: Number(form.price),
      image: form.image,
      category: form.category,
      description: form.description,
      is_active: form.is_active,
      is_featured: form.is_featured,
      sold_out: form.sold_out,
    };

    if (editProduct) {
      await supabase.from("products").update(payload).eq("id", editProduct.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    setOpenProduct(false);
    setEditProduct(null);
  };

  const toggle = async (id: string, field: keyof Product, value: boolean) => {
    await supabase.from("products").update({ [field]: value }).eq("id", id);
  };

  const remove = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
  };

  /* ================= CATEGORY ================= */
  const saveCategory = async () => {
    const payload = {
      name: catForm.name,
      image: catForm.image,
    };

    if (editCategory) {
      await supabase.from("categories").update(payload).eq("id", editCategory.id);
    } else {
      await supabase.from("categories").insert(payload);
    }

    setOpenCategory(false);
  };

  /* ================= UI ================= */
  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">🔥 ADMIN PRO</h1>

        <Button onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* TABS */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        {/* ================= PRODUCTS ================= */}
        <TabsContent value="products">

          <Button className="my-4" onClick={() => {
            setEditProduct(null);
            setForm({
              name: "",
              price: "",
              image: "",
              category: "",
              description: "",
              is_active: true,
              is_featured: false,
              sold_out: false,
            });
            setOpenProduct(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img src={p.image} className="w-10 h-10 rounded" />
                      {p.name}
                    </div>
                  </TableCell>

                  <TableCell>R$ {p.price}</TableCell>

                  <TableCell className="flex gap-2">
                    <Button size="icon" onClick={() => toggle(p.id, "is_featured", !p.is_featured)}>
                      <Star className={p.is_featured ? "text-yellow-500 fill-yellow-500" : ""} />
                    </Button>

                    <Button size="icon" onClick={() => toggle(p.id, "is_active", !p.is_active)}>
                      {p.is_active ? <Eye /> : <EyeOff />}
                    </Button>

                    <Button size="icon" onClick={() => toggle(p.id, "sold_out", !p.sold_out)}>
                      ❌
                    </Button>
                  </TableCell>

                  <TableCell className="flex gap-2">
                    <Button size="icon" onClick={() => {
                      setEditProduct(p);
                      setForm(p);
                      setOpenProduct(true);
                    }}>
                      <Pencil />
                    </Button>

                    <Button size="icon" onClick={() => remove(p.id)}>
                      <Trash2 />
                    </Button>

                    <a href={p.image} download>
                      <Button size="icon">
                        <Download />
                      </Button>
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </TabsContent>

        {/* ================= CATEGORIES ================= */}
        <TabsContent value="categories">

          <Button onClick={() => {
            setEditCategory(null);
            setCatForm({ name: "", image: "" });
            setOpenCategory(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {categories.map((c) => (
              <div key={c.id} className="border p-3 rounded">
                <img src={c.image} className="h-20 w-full object-cover" />
                <p>{c.name}</p>
              </div>
            ))}
          </div>

        </TabsContent>
      </Tabs>

      {/* ================= PRODUCT MODAL ================= */}
      <Dialog open={openProduct} onOpenChange={setOpenProduct}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Produto</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input placeholder="Nome" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />

            <Input placeholder="Preço" value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })} />

            <Input placeholder="Categoria" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })} />

            <Input type="file" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = await uploadImage(file);
              setForm({ ...form, image: url });
            }} />

            <Textarea placeholder="Descrição"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <DialogFooter>
            <Button onClick={saveProduct}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CATEGORY MODAL */}
      <Dialog open={openCategory} onOpenChange={setOpenCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categoria</DialogTitle>
          </DialogHeader>

          <Input placeholder="Nome"
            value={catForm.name}
            onChange={e => setCatForm({ ...catForm, name: e.target.value })} />

          <Input type="file" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = await uploadImage(file);
            setCatForm({ ...catForm, image: url });
          }} />

          <DialogFooter>
            <Button onClick={saveCategory}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}