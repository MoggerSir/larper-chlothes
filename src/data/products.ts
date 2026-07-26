import type { ImageMetadata } from "astro";

import chamarraGothicaFlat from "../assets/products/chamarra_Gothica.webp";
import chamarraGothicaModel from "../assets/products/chamarra_Gothica_modelo_pose2.webp";
import sudaderaGothicaFlat from "../assets/products/sudadera_gothica.webp";
import sudaderaGothicaModel from "../assets/products/sudadera_gothica_modelo.webp";
import sudaderaPatrioticaFlat from "../assets/products/sudadera_patriotica.webp";
import sudaderaPatrioticaModel from "../assets/products/sudadera_patriotica_modelo.webp";
import playeraLinuxFlat from "../assets/products/Playera_de_linux.webp";
import playeraLinuxModel from "../assets/products/Playera_de_linux_modelo.webp";
import pantalonSwagFlat from "../assets/products/pantalon_mezclilla_swag.webp";
import chamarraCueroCafeFlat from "../assets/products/chamarra_cuero_cafe.webp";
import chamarraCueroCafeModel from "../assets/products/chamarra_cuero_cafe_modelo.webp";
import pantalonCargoFlat from "../assets/products/pantalon_cargo.webp";
import pantalonCargoModel from "../assets/products/pantalon_cargo_modelo.webp";
import playeraEverlastFlat from "../assets/products/Playera_Everlast.webp";
import playeraEverlastModel from "../assets/products/Playera_Everlast_modelo.webp";

export type ProductTag = "NUEVO" | "LIMITADA" | "MAS VENDIDA" | "RESTOCK";

export interface Product {
  id: string;
  slug: string;
  index: string;
  name: string;
  label: string;
  category: string;
  price: number;
  currency: string;
  tag: ProductTag;
  colorway: string;
  description: string;
  images: {
    flat: ImageMetadata;
    model: ImageMetadata;
  };
}

interface ProductInput {
  name: string;
  label: string;
  category: string;
  price: number;
  tag: ProductTag;
  colorway: string;
  description: string;
  images: {
    flat: ImageMetadata;
    model: ImageMetadata;
  };
}

/**
 * Factory: turns bare product input into a fully-formed catalog entry —
 * derives slug/id/index and applies shared defaults (currency, etc.) so
 * every call site only supplies what's actually distinct about the piece.
 */
function createProduct(input: ProductInput, position: number): Product {
  const slug = input.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return {
    id: slug,
    slug,
    index: String(position).padStart(2, "0"),
    currency: "MXN",
    ...input,
  };
}

const catalogInput: ProductInput[] = [
  {
    name: "Trenchie Gothic Zip",
    label: "Chamarra oversize",
    category: "Chamarras",
    price: 1450,
    tag: "LIMITADA",
    colorway: "Vintage wash / negro",
    description:
      "Chamarra con capucha en lavado vintage, estampado gótico a doble cara y cierre completo. Silueta oversize, caída pesada.",
    images: { flat: chamarraGothicaFlat, model: chamarraGothicaModel },
  },
  {
    name: "Atrocity Layered Tee",
    label: "Playera de manga larga",
    category: "Playeras",
    price: 850,
    tag: "MAS VENDIDA",
    colorway: "Negro / blanco",
    description:
      "Playera de capas falsas con gráfico gótico serigrafiado al frente. Algodón pesado, corte oversize, mangas contraste.",
    images: { flat: sudaderaGothicaFlat, model: sudaderaGothicaModel },
  },
  {
    name: "Vice Quarter-Zip",
    label: "Sudadera 1/4 cierre",
    category: "Sudaderas",
    price: 980,
    tag: "NUEVO",
    colorway: "Azul marino",
    description:
      "Sudadera de cuello alto con medio cierre, parche bordado y bandera en la manga. Felpa gruesa cepillada por dentro.",
    images: { flat: sudaderaPatrioticaFlat, model: sudaderaPatrioticaModel },
  },
  {
    name: "Arch Terminal Tee",
    label: "Playera básica",
    category: "Playeras",
    price: 550,
    tag: "RESTOCK",
    colorway: "Negro",
    description:
      "Playera de algodón 100% con gráfico Arch Linux al pecho. Corte recto, cuello redondo reforzado, para uso diario.",
    images: { flat: playeraLinuxFlat, model: playeraLinuxModel },
  },
  {
    name: "Nocturne Leather Jacket",
    label: "Chamarra de cuero",
    category: "Chamarras",
    price: 1890,
    tag: "LIMITADA",
    colorway: "Café envejecido",
    description:
      "Chamarra de cuero café con acabado envejecido, estructura amplia y presencia pesada. Una pieza de carácter oscuro diseñada para dominar la silueta.",
    images: { flat: chamarraCueroCafeFlat, model: chamarraCueroCafeModel },
  },
  {
    name: "Riot Cargo Denim",
    label: "Pantalón mezclilla",
    category: "Pantalones",
    price: 1100,
    tag: "NUEVO",
    colorway: "Negro / rojo",
    description:
      "Pantalón cargo de mezclilla rígida con pespunte de contraste y parche gráfico grafiti. Pierna ancha, bolsillos utilitarios.",
    images: { flat: pantalonSwagFlat, model: pantalonSwagFlat },
  },
  {
    name: "Shadow Utility Cargo",
    label: "Pantalón cargo",
    category: "Pantalones",
    price: 1050,
    tag: "LIMITADA",
    colorway: "Negro desgastado",
    description:
      "Pantalón cargo de corte amplio con bolsillos utilitarios y acabado negro desgastado. Una pieza única, resistente y lista para una segunda vida.",
    images: { flat: pantalonCargoFlat, model: pantalonCargoModel },
  },
  {
    name: "Everlast Fight Tee",
    label: "Playera gráfica",
    category: "Playeras",
    price: 720,
    tag: "NUEVO",
    colorway: "Negro / blanco",
    description:
      "Playera Everlast de carácter deportivo con gráfico frontal contundente y silueta relajada. Pieza única recuperada para volver a destacar.",
    images: { flat: playeraEverlastFlat, model: playeraEverlastModel },
  },
];

export const products: Product[] = catalogInput.map((input, i) =>
  createProduct(input, i + 1),
);

export function formatPrice(product: Pick<Product, "price" | "currency">): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);
}
