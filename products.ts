import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";


export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sizes: string[];
  details: string[];

  is_featured?: boolean;
  soldOut?: boolean;
}


export const products: Product[] = [
  {
    id: "1",
    name: "Sutiã Bordô Rendado",
    price: 149.9,
    description: "Sutiã em renda francesa com acabamento premium. Design delicado que valoriza a silhueta com conforto e elegância.",
    image: product1,
    category: "Sutiãs",
    sizes: ["P", "M", "G", "GG"],
    details: ["Renda francesa importada", "Bojo removível", "Alças ajustáveis", "Fecho traseiro duplo"],
  },
  {
    id: "2",
    name: "Conjunto Noir Clássico",
    price: 259.9,
    description: "Conjunto clássico em renda negra com detalhes sofisticados. Peça atemporal para mulheres que valorizam a elegância.",
    image: product2,
    category: "Conjuntos",
    sizes: ["P", "M", "G", "GG"],
    details: ["Renda premium", "Tecido macio ao toque", "Elasticidade confortável", "Lavagem delicada"],
  },
  {
    id: "3",
    name: "Conjunto Branco Noiva",
    price: 289.9,
    description: "Conjunto especial em renda branca com acabamento artesanal. Ideal para momentos inesquecíveis.",
    image: product4,
    category: "Conjuntos",
    sizes: ["P", "M", "G", "GG"],
    details: ["Renda artesanal", "Detalhes florais", "Acabamento premium", "Embalagem especial"],
  },
  {
    id: "4",
    name: "Espartilho Borgonha",
    price: 349.9,
    description: "Espartilho em cetim com detalhes em renda. Peça statement que combina sensualidade e sofisticação.",
    image: product5,
    category: "Espartilhos",
    sizes: ["P", "M", "G"],
    details: ["Cetim acetinado", "Barbatanas flexíveis", "Fechamento frontal", "Renda nas bordas"],
  },
  {
    id: "5",
    name: "Camisola Azul Noite",
    price: 199.9,
    description: "Camisola em seda sintética com caimento perfeito. Luxo e conforto para suas noites.",
    image: product6,
    category: "Camisolas",
    sizes: ["P", "M", "G", "GG"],
    details: ["Seda sintética premium", "Alças finas ajustáveis", "Caimento fluido", "Comprimento midi"],
  },
  {
    id: "6",
    name: "Sutiã Rendado Bordô II",
    price: 159.9,
    description: "Variação do nosso best-seller com detalhes exclusivos em renda e acabamento dourado.",
    image: product1,
    category: "Sutiãs",
    sizes: ["P", "M", "G"],
    details: ["Renda francesa", "Detalhes dourados", "Bojo estruturado", "Conforto o dia todo"],
  },
];

export const categories = ["Corset", "Sutiãs", "Conjuntos", "Espartilhos", "Cropped"];
