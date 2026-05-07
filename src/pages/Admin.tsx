import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package, AlertTriangle, DollarSign, LogOut, Plus, Pencil, Trash2, Box, ArrowLeft,
  Search, TrendingUp, Sparkles, Filter, ArrowUpDown, Eye, EyeOff, Star, ImageIcon,
  LayoutDashboard, ShoppingBag, X, Upload, Loader2, Shield,
} from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sizes: string[];
  details: string[];
  is_active: boolean;
  is_featured: boolean;
  sold_out: boolean;
}

interface Stock {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
}

const productSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(150),
  price: z.number().min(0, "Preço inválido"),
  description: z.string().max(2000).default(""),
  image: z.string().max(500).default(""),
  category: z.string().trim().min(1, "Categoria obrigatória").max(80),
  sizes: z.string().max(200),
  details: z.string().max(2000),
});

const LOW_STOCK = 5;

type SortKey = "recent" | "name" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc";
type StatusFilter = "all" | "active" | "inactive" | "low" | "out" | "featured";

const Admin = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { upload: uploadImage, uploading } = useImageUpload();

  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockDialog, setStockDialog] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("recent");

  const [form, setForm] = useState({
  name: "",
  price: "",
  description: "",
  image: "",
  category: "",
  sizes: "P,M,G,GG",
  details: "",
  is_active: true,
  is_featured: false,
  sold_out: false,
});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [prodRes, stockRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("product_stock").select("*"),
    ]);
    if (prodRes.data) {
      setProducts(prodRes.data.map((p: any) => ({ ...p, price: Number(p.price) })) as Product[]);
    }
    if (stockRes.data) setStock(stockRes.data as Stock[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const stockByProduct = useCallback(
    (pid: string) => stock.filter((s: Stock) => s.product_id === pid),
    [stock],
  );
  const totalStockFor = useCallback(
    (pid: string) => stockByProduct(pid).reduce((a: number, s: Stock) => a + s.quantity, 0),
    [stockByProduct],
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map((p: Product) => p.category))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "all") list = list.filter((p) => p.category === categoryFilter);
    if (statusFilter !== "all") {
      list = list.filter((p) => {
        const total = totalStockFor(p.id);
        switch (statusFilter) {
          case "active": return p.is_active;
          case "inactive": return !p.is_active;
          case "featured": return p.is_featured;
          case "low": return total > 0 && total <= LOW_STOCK;
          case "out": return total === 0;
        }
      });
    }
    switch (sortBy) {
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "stock-asc": list.sort((a, b) => totalStockFor(a.id) - totalStockFor(b.id)); break;
      case "stock-desc": list.sort((a, b) => totalStockFor(b.id) - totalStockFor(a.id)); break;
      default: break;
    }
    return list;
  }, [products, search, categoryFilter, statusFilter, sortBy, totalStockFor]);

  const totalProducts = products.length;
  const lowStockCount = products.filter((p: Product) => {
    const t = totalStockFor(p.id);
    return t > 0 && t <= LOW_STOCK;
  }).length;
  const outOfStockCount = products.filter((p: Product) => totalStockFor(p.id) === 0).length;
  const inventoryValue = products.reduce((sum: number, p: Product) => sum + p.price * totalStockFor(p.id), 0);
  const featuredCount = products.filter((p: Product) => p.is_featured).length;
  const activeCount = products.filter((p: Product) => p.is_active).length;
  const totalUnits = stock.reduce((a: number, s: Stock) => a + s.quantity, 0);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "", price: "", description: "", image: "", category: "",
      sizes: "P,M,G,GG",
details: "",
is_active: true,
is_featured: false,
sold_out: false,
    });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      description: p.description,
      image: p.image,
      category: p.category,
      sizes: p.sizes.join(","),
      details: p.details.join("\n"),
      is_active: p.is_active,
is_featured: p.is_featured,
sold_out: p.sold_out,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const parsed = productSchema.safeParse({
      name: form.name,
      price: parseFloat(form.price),
      description: form.description,
      image: form.image,
      category: form.category,
      sizes: form.sizes,
      details: form.details,
    });
    if (!parsed.success) {
      toast({ title: "Dados inválidos", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    const sizesArr = form.sizes.split(",").map((s: string) => s.trim()).filter(Boolean);
    const detailsArr = form.details.split("\n").map((d: string) => d.trim()).filter(Boolean);

    const payload = {
      name: parsed.data.name,
      price: parsed.data.price,
      description: parsed.data.description,
      image: parsed.data.image,
      category: parsed.data.category,
      sizes: sizesArr,
      details: detailsArr,
      is_active: form.is_active,
is_featured: form.is_featured,
sold_out: form.sold_out,
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      const existing = stockByProduct(editing.id);
      const toAdd = sizesArr.filter((s: string) => !existing.some((e: Stock) => e.size === s));
      const toRemove = existing.filter((e: Stock) => !sizesArr.includes(e.size));
      if (toAdd.length) {
        await supabase.from("product_stock").insert(toAdd.map((size: string) => ({ product_id: editing.id, size, quantity: 0 })));
      }
      if (toRemove.length) {
        await supabase.from("product_stock").delete().in("id", toRemove.map((r: Stock) => r.id));
      }
      toast({ title: "Produto atualizado" });
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select().single();
      if (error || !data) { toast({ title: "Erro", description: error?.message ?? "Falha", variant: "destructive" }); return; }
      if (sizesArr.length) {
        await supabase.from("product_stock").insert(sizesArr.map((size: string) => ({ product_id: data.id, size, quantity: 0 })));
      }
      toast({ title: "Produto criado" });
    }
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteTarget.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Produto removido" });
    setDeleteTarget(null);
    fetchAll();
  };

  const updateStock = async (stockId: string, qty: number) => {
    const safe = Math.max(0, Math.floor(qty || 0));
    const { error } = await supabase.from("product_stock").update({ quantity: safe }).eq("id", stockId);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setStock((prev: Stock[]) => prev.map((s: Stock) => (s.id === stockId ? { ...s, quantity: safe } : s)));
  };

  const toggleActive = async (p: Product) => {
    const { error } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setProducts((prev: Product[]) => prev.map((x: Product) => x.id === p.id ? { ...x, is_active: !x.is_active } : x));
  };

  const toggleFeatured = async (p: Product) => {
    const { error } = await supabase.from("products").update({ is_featured: !p.is_featured }).eq("id", p.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setProducts((prev: Product[]) => prev.map((x: Product) => x.id === p.id ? { ...x, is_featured: !x.is_featured } : x));
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setSortBy("recent");
  };

  const hasFilters = search || categoryFilter !== "all" || statusFilter !== "all" || sortBy !== "recent";

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 md:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold transition-colors font-sans"
            >
              <ArrowLeft className="w-3 h-3" /> Loja
            </Link>
            <div className="hidden md:block w-px h-8 bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-primary to-burgundy-deep flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-lg md:text-xl tracking-[0.2em] uppercase leading-tight">Painel Admin</h1>
                <p className="font-script text-gold text-xs md:text-sm leading-tight">AL Intimates</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground font-sans">Conectado como</span>
              <span className="text-xs text-foreground font-sans">{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="gap-2 text-[10px] tracking-[0.2em] uppercase border-border/60 hover:border-gold/50 hover:text-gold"
            >
              <LogOut className="w-3 h-3" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-8 bg-secondary/40 p-1">
            <TabsTrigger value="products" className="gap-2 text-[10px] tracking-[0.25em] uppercase data-[state=active]:bg-background">
              <ShoppingBag className="w-3.5 h-3.5" /> Catálogo
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2 text-[10px] tracking-[0.25em] uppercase data-[state=active]:bg-background">
              <Shield className="w-3.5 h-3.5" /> Administradores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-0">
        {/* Welcome strip */}
        <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-sans mb-2">Visão Geral</p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-wider">Olá, bem-vinda de volta</h2>
            <p className="text-sm text-muted-foreground mt-2 font-sans max-w-xl">
              Acompanhe o desempenho do catálogo e gerencie cada peça com a sofisticação que sua marca merece.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="gap-2 bg-gradient-to-r from-primary to-burgundy-deep text-primary-foreground hover:opacity-90 tracking-[0.25em] uppercase text-[10px] px-6 py-5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> Novo produto
          </Button>
        </div>

        {/* Métricas premium */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
          <MetricCard
            icon={<Package className="w-4 h-4" />}
            label="Catálogo"
            value={totalProducts}
            sub={`${activeCount} ativos`}
            tone="default"
          />
          <MetricCard
            icon={<Box className="w-4 h-4" />}
            label="Unidades em estoque"
            value={totalUnits}
            sub={`${featuredCount} em destaque`}
            tone="default"
          />
          <MetricCard
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Atenção"
            value={lowStockCount + outOfStockCount}
            sub={`${outOfStockCount} esgotados • ${lowStockCount} baixos`}
            tone={lowStockCount + outOfStockCount > 0 ? "warning" : "default"}
          />
          <MetricCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Valor em estoque"
            value={`R$ ${inventoryValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            sub="Custo de oportunidade"
            tone="accent"
          />
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <div>
              <h3 className="font-serif text-2xl tracking-wider">Catálogo</h3>
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-sans mt-0.5">
                {filtered.length} {filtered.length === 1 ? "peça" : "peças"} {hasFilters && "encontradas"}
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card border border-border/50 p-4 md:p-5 mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-border/60 bg-background"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] border-border/60 bg-background text-xs tracking-wider uppercase">
              <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[160px] border-border/60 bg-background text-xs tracking-wider uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="featured">Destaque</SelectItem>
              <SelectItem value="low">Estoque baixo</SelectItem>
              <SelectItem value="out">Esgotados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger className="w-[180px] border-border/60 bg-background text-xs tracking-wider uppercase">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="name">Nome (A→Z)</SelectItem>
              <SelectItem value="price-asc">Preço ↑</SelectItem>
              <SelectItem value="price-desc">Preço ↓</SelectItem>
              <SelectItem value="stock-asc">Estoque ↑</SelectItem>
              <SelectItem value="stock-desc">Estoque ↓</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-gold gap-1.5"
            >
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
        </div>

        {/* Tabela */}
        <div className="border border-border/50 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40 border-border/60">
                <TableHead className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Produto</TableHead>
                <TableHead className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Categoria</TableHead>
                <TableHead className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Preço</TableHead>
                <TableHead className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Estoque</TableHead>
                <TableHead className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                      <span className="text-[10px] tracking-[0.25em] uppercase">Carregando catálogo</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Sparkles className="w-8 h-8 text-gold/40" />
                      <p className="font-serif text-lg">
                        {hasFilters ? "Nenhum resultado para os filtros" : "Nenhum produto cadastrado"}
                      </p>
                      <p className="text-xs">
                        {hasFilters ? "Ajuste os filtros e tente novamente" : "Comece criando sua primeira peça"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.map((p) => {
                const total = totalStockFor(p.id);
                const status = total === 0 ? "esgotado" : total <= LOW_STOCK ? "baixo" : "ok";
                return (
                  <TableRow key={p.id} className="border-border/40 hover:bg-secondary/20 transition-colors group">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary/50 border border-border/60 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans font-medium text-sm truncate max-w-[260px]">{p.name}</p>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-0.5">
                            {p.sizes.length} {p.sizes.length === 1 ? "tamanho" : "tamanhos"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground tracking-wider uppercase">{p.category}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-serif text-base">R$ {p.price.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setStockDialog(p)}
                        className={`group/stock inline-flex items-center gap-2 text-xs tracking-wider px-2.5 py-1.5 border rounded-sm transition-all ${
                          status === "esgotado" ? "border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10" :
                          status === "baixo" ? "border-gold/50 text-gold bg-gold/5 hover:bg-gold/10" :
                          "border-border text-foreground/80 hover:border-gold/40 hover:text-gold"
                        }`}
                      >
                        <span className="font-medium">{total}</span>
                        <span className="text-[9px] tracking-[0.2em] uppercase opacity-70">un</span>
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => toggleActive(p)}
                          title={p.is_active ? "Clique para desativar" : "Clique para ativar"}
                          className={`text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm transition-all ${
                            p.is_active
                              ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/70 border border-border"
                          }`}
                        >
                          {p.is_active ? "Ativo" : "Inativo"}
                        </button>
                        {p.is_featured && (
                          <span className="text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm bg-gold/10 text-gold border border-gold/20 inline-flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" /> Destaque
                          </span>
                          
                        )}
                        {p.sold_out && (
  <span className="text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm bg-red-500/10 text-red-500 border border-red-500/20 inline-flex items-center gap-1">
    Esgotado
  </span>
)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleFeatured(p)}
                          title={p.is_featured ? "Remover destaque" : "Marcar como destaque"}
                          className="h-8 w-8 hover:text-gold"
                        >
                          <Star className={`w-3.5 h-3.5 ${p.is_featured ? "fill-gold text-gold" : ""}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleActive(p)}
                          title={p.is_active ? "Desativar" : "Ativar"}
                          className="h-8 w-8"
                          
                        >
                          {p.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(p)}
                          className="h-8 w-8 hover:text-primary"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteTarget(p)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Footer hint */}
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/70 mt-6 text-center font-sans">
          <TrendingUp className="w-3 h-3 inline mr-1.5" />
          Estoque baixo: até {LOW_STOCK} unidades
        </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog produto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-primary to-burgundy-deep flex items-center justify-center">
                {editing ? <Pencil className="w-3.5 h-3.5 text-primary-foreground" /> : <Plus className="w-3.5 h-3.5 text-primary-foreground" />}
              </div>
              <DialogTitle className="font-serif tracking-wider text-xl">
                {editing ? "Editar produto" : "Novo produto"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Preencha os dados do produto. Os tamanhos serão sincronizados com o estoque.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 font-sans">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[10px] tracking-[0.2em] uppercase">Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={150} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] tracking-[0.2em] uppercase">Preço (R$)</Label>
                <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] tracking-[0.2em] uppercase">Categoria</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} maxLength={80} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[10px] tracking-[0.2em] uppercase">Imagem do produto</Label>
                <div className="flex items-center gap-3">
                  {form.image ? (
                    <div className="w-20 h-20 border border-border rounded-sm overflow-hidden bg-secondary/40 flex-shrink-0">
                      <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
                    </div>
                  ) : (
                    <div className="w-20 h-20 border border-dashed border-border rounded-sm flex items-center justify-center text-muted-foreground flex-shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-gold/50 cursor-pointer text-[10px] tracking-[0.2em] uppercase rounded-sm bg-secondary/40 hover:bg-secondary transition-colors">
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploading ? "Enviando..." : form.image ? "Trocar imagem" : "Enviar imagem"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImage(file);
                          if (url) setForm((f) => ({ ...f, image: url }));
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {form.image && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-destructive"
                      >
                        Remover
                      </button>
                    )}
                    <p className="text-[10px] text-muted-foreground/70">JPG, PNG ou WEBP — até 5MB</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[10px] tracking-[0.2em] uppercase">Tamanhos (separados por vírgula)</Label>
                <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="P,M,G,GG" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[10px] tracking-[0.2em] uppercase">Descrição</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[10px] tracking-[0.2em] uppercase">Detalhes (uma linha por item)</Label>
                <Textarea rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} maxLength={2000} />
              </div>
              <div className="flex items-center gap-3 p-3 border border-border/60 rounded-sm bg-secondary/30">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <div>
                  <Label className="text-[10px] tracking-[0.2em] uppercase block">Ativo</Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Visível na loja</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border/60 rounded-sm bg-secondary/30">
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                <div>
                  <Label className="text-[10px] tracking-[0.2em] uppercase block">Destaque</Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Aparece na home</p>
                </div>
                <Label className="text-[10px] tracking-[0.2em] uppercase block">Esgotados</Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Aparece na home</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-burgundy-deep text-primary-foreground hover:opacity-90">
              {editing ? "Salvar alterações" : "Criar produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog estoque */}
      <Dialog open={!!stockDialog} onOpenChange={(o) => !o && setStockDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-sm bg-gold/15 flex items-center justify-center">
                <Box className="w-4 h-4 text-gold" />
              </div>
              <DialogTitle className="font-serif tracking-wider text-xl">Estoque por tamanho</DialogTitle>
            </div>
            <DialogDescription className="text-xs">{stockDialog?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 font-sans">
            {stockDialog && stockByProduct(stockDialog.id).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum tamanho cadastrado.</p>
            )}
            {stockDialog && stockByProduct(stockDialog.id).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 border border-border/40 rounded-sm bg-secondary/20">
                <div className="w-12 h-12 border border-gold/30 bg-card flex items-center justify-center font-serif text-base text-gold rounded-sm">
                  {s.size}
                </div>
                <Input
                  type="number"
                  min="0"
                  defaultValue={s.quantity}
                  onBlur={(e) => updateStock(s.id, parseInt(e.target.value, 10))}
                  className="flex-1"
                />
                <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">un</span>
              </div>
            ))}
            {stockDialog && stockByProduct(stockDialog.id).length > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-3">
                <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Total</span>
                <span className="font-serif text-lg text-gold">{totalStockFor(stockDialog.id)} unidades</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setStockDialog(null)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif tracking-wider">Remover produto?</AlertDialogTitle>
            <AlertDialogDescription>
              "<span className="text-foreground font-medium">{deleteTarget?.name}</span>" e todo o seu estoque serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

const MetricCard = ({
  icon, label, value, sub, tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  tone?: "default" | "warning" | "accent";
}) => {
  const toneStyles = {
    default: "border-border/50 bg-card",
    warning: "border-gold/40 bg-gradient-to-br from-card to-gold/5",
    accent: "border-primary/30 bg-gradient-to-br from-card to-primary/5",
  };
  const iconStyles = {
    default: "bg-secondary/60 text-muted-foreground",
    warning: "bg-gold/15 text-gold",
    accent: "bg-primary/10 text-primary",
  };
  return (
    <div className={`relative border p-5 md:p-6 transition-all hover:shadow-md ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-sm flex items-center justify-center ${iconStyles[tone]}`}>
          {icon}
        </div>
      </div>
      <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-sans mb-2">{label}</p>
      <p className="font-serif text-2xl md:text-3xl tracking-wider leading-none">{value}</p>
      {sub && (
        <p className="text-[10px] tracking-wider text-muted-foreground/80 font-sans mt-2">{sub}</p>
      )}
    </div>
  );
};

export default Admin;
