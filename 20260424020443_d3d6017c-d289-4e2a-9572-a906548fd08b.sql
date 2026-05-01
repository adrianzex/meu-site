-- =========================================
-- ENUM de papéis
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================
-- USER ROLES
-- =========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- =========================================
-- PRODUCTS
-- =========================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  sizes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  details TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- =========================================
-- PRODUCT STOCK (per size)
-- =========================================
CREATE TABLE public.product_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, size)
);

ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

-- =========================================
-- TIMESTAMP TRIGGER FN
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_stock_updated_at
  BEFORE UPDATE ON public.product_stock
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- AUTO CREATE PROFILE ON SIGNUP
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- RLS POLICIES
-- =========================================

-- profiles
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- user_roles
CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- products
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update products"
  ON public.products FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete products"
  ON public.products FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- product_stock
CREATE POLICY "Anyone can view stock"
  ON public.product_stock FOR SELECT
  USING (true);

CREATE POLICY "Admins manage stock"
  ON public.product_stock FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- SEED PRODUCTS
-- =========================================
INSERT INTO public.products (name, price, description, image, category, sizes, details, is_featured) VALUES
('Sutiã Bordô Rendado', 149.90, 'Sutiã em renda francesa com acabamento premium. Design delicado que valoriza a silhueta com conforto e elegância.', '/src/assets/product-1.jpg', 'Sutiãs', ARRAY['P','M','G','GG'], ARRAY['Renda francesa importada','Bojo removível','Alças ajustáveis','Fecho traseiro duplo'], true),
('Conjunto Noir Clássico', 259.90, 'Conjunto clássico em renda negra com detalhes sofisticados. Peça atemporal para mulheres que valorizam a elegância.', '/src/assets/product-2.jpg', 'Conjuntos', ARRAY['P','M','G','GG'], ARRAY['Renda premium','Tecido macio ao toque','Elasticidade confortável','Lavagem delicada'], true),
('Conjunto Branco Noiva', 289.90, 'Conjunto especial em renda branca com acabamento artesanal. Ideal para momentos inesquecíveis.', '/src/assets/product-4.jpg', 'Conjuntos', ARRAY['P','M','G','GG'], ARRAY['Renda artesanal','Detalhes florais','Acabamento premium','Embalagem especial'], true),
('Espartilho Borgonha', 349.90, 'Espartilho em cetim com detalhes em renda. Peça statement que combina sensualidade e sofisticação.', '/src/assets/product-5.jpg', 'Espartilhos', ARRAY['P','M','G'], ARRAY['Cetim acetinado','Barbatanas flexíveis','Fechamento frontal','Renda nas bordas'], false),
('Camisola Azul Noite', 199.90, 'Camisola em seda sintética com caimento perfeito. Luxo e conforto para suas noites.', '/src/assets/product-6.jpg', 'Camisolas', ARRAY['P','M','G','GG'], ARRAY['Seda sintética premium','Alças finas ajustáveis','Caimento fluido','Comprimento midi'], false),
('Sutiã Rendado Bordô II', 159.90, 'Variação do nosso best-seller com detalhes exclusivos em renda e acabamento dourado.', '/src/assets/product-1.jpg', 'Sutiãs', ARRAY['P','M','G'], ARRAY['Renda francesa','Detalhes dourados','Bojo estruturado','Conforto o dia todo'], false);

-- Seed initial stock (10 of each size)
INSERT INTO public.product_stock (product_id, size, quantity)
SELECT p.id, s.size, 10
FROM public.products p
CROSS JOIN LATERAL unnest(p.sizes) AS s(size);