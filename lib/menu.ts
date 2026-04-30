import menuData from "@/data/menu.json";

export type MenuItem = {
  name: string;
  description?: string;
  price: number;
  featured?: boolean;
};

export type MenuSection = {
  id: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
};

export type MenuCategory = {
  id: string;
  name: string;
  tagline: string;
  image?: string;
  imageAlt?: string;
  sections: MenuSection[];
};

export type MenuData = {
  currency: string;
  disclaimer: string;
  categories: MenuCategory[];
};

export const menu: MenuData = menuData as MenuData;

export function formatPrice(price: number, currency = "RWF"): string {
  return `${price.toLocaleString("en-US")} ${currency}`;
}
