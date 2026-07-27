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

export type ProductTag = "NEW TO STORE" | "ONE OF ONE" | "STUDENT PICK" | "AVAILABLE";

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
    label: "Second-hand oversized jacket",
    category: "Jackets",
    price: 1450,
    tag: "ONE OF ONE",
    colorway: "Vintage brown / black",
    description:
      "This second-hand jacket is vintage brown and black, and the jacket's size is M. The jacket's price is $1,450 MXN. These printed panels and that full zipper are in good condition. A student bought it two years ago and wore it on campus. It was the student's favorite winter jacket, but it was not used last year.",
    images: { flat: chamarraGothicaFlat, model: chamarraGothicaModel },
  },
  {
    name: "Atrocity Layered Tee",
    label: "Second-hand layered T-shirt",
    category: "T-shirts",
    price: 850,
    tag: "STUDENT PICK",
    colorway: "Black / white",
    description:
      "This second-hand T-shirt is black and white, and the T-shirt's size is L. Its price is $850 MXN. These white sleeves are soft, and that front print is still clear. Its first owner bought it in 2023 and used it at concerts. It was an expensive piece when it was new, but the sleeves were always comfortable.",
    images: { flat: sudaderaGothicaFlat, model: sudaderaGothicaModel },
  },
  {
    name: "Vice Quarter-Zip",
    label: "Second-hand quarter-zip sweatshirt",
    category: "Sweatshirts",
    price: 980,
    tag: "NEW TO STORE",
    colorway: "Navy blue",
    description:
      "This second-hand sweatshirt is navy blue, and the sweatshirt's size is M. The sweatshirt's price is $980 MXN. This embroidered patch is clean, and these cuffs are in very good condition. A student bought it for a school trip and wore it during one cold semester. It was warm and useful, and there were no broken parts.",
    images: { flat: sudaderaPatrioticaFlat, model: sudaderaPatrioticaModel },
  },
  {
    name: "Arch Terminal Tee",
    label: "Second-hand graphic T-shirt",
    category: "T-shirts",
    price: 550,
    tag: "AVAILABLE",
    colorway: "Black",
    description:
      "This second-hand T-shirt is black, and the T-shirt's size is M. The T-shirt's price is $550 MXN. That blue Arch Linux logo is bright, and these seams are strong. Its previous owner bought it in 2022 and wore it in the computer lab. It was a simple daily shirt, and it was easy to combine with jeans.",
    images: { flat: playeraLinuxFlat, model: playeraLinuxModel },
  },
  {
    name: "Nocturne Leather Jacket",
    label: "Second-hand leather jacket",
    category: "Jackets",
    price: 1890,
    tag: "ONE OF ONE",
    colorway: "Aged brown",
    description:
      "This second-hand leather jacket is aged brown, and the jacket's size is L. The jacket's price is $1,890 MXN. These leather panels have natural marks, and that metal zipper works well. A student found it in a local vintage shop and wore it for two years. It was his graduation jacket, and the shoulders were already slightly worn.",
    images: { flat: chamarraCueroCafeFlat, model: chamarraCueroCafeModel },
  },
  {
    name: "Riot Cargo Denim",
    label: "Second-hand denim pants",
    category: "Pants",
    price: 1100,
    tag: "NEW TO STORE",
    colorway: "Black / red",
    description:
      "These second-hand denim pants are black and red, and the pants' size is 32. Their price is $1,100 MXN. These wide legs are strong, and that red patch gives the pair a clear identity. A design student bought them in 2023 and changed the stitching by hand. They were part of a class project, and they were only worn a few times.",
    images: { flat: pantalonSwagFlat, model: pantalonSwagFlat },
  },
  {
    name: "Shadow Utility Cargo",
    label: "Second-hand cargo pants",
    category: "Pants",
    price: 1050,
    tag: "ONE OF ONE",
    colorway: "Faded black",
    description:
      "These second-hand cargo pants are faded black, and the pants' size is 30. The pants' price is $1,050 MXN. These utility pockets are useful, and that washed finish is part of the original look. Their first owner bought them for photography work and used them around campus. They were practical and durable, but they were not used this semester.",
    images: { flat: pantalonCargoFlat, model: pantalonCargoModel },
  },
  {
    name: "Everlast Fight Tee",
    label: "Second-hand sports T-shirt",
    category: "T-shirts",
    price: 720,
    tag: "NEW TO STORE",
    colorway: "Black / white",
    description:
      "This second-hand sports T-shirt is black and white, and the T-shirt's size is L. The T-shirt's price is $720 MXN. This Everlast graphic is in good condition, and these sleeves keep their relaxed shape. A student bought it at a boxing event and wore it for weekend training. It was part of the student's sports wardrobe, but it was not worn last year.",
    images: { flat: playeraEverlastFlat, model: playeraEverlastModel },
  },
];

export const products: Product[] = catalogInput.map((input, i) =>
  createProduct(input, i + 1),
);

export function formatPrice(product: Pick<Product, "price" | "currency">): string {
  return new Intl.NumberFormat("en-MX", {
    style: "currency",
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);
}
