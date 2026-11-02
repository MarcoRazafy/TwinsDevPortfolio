import {
  AppWindow,
  Bot,
  ChartColumn,
  Database,
  Globe2,
  Layers,
  Palette,
  Server,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIcon } from "@/lib/projects";

/** Icône de chaque choix proposé pour une catégorie. */
export const CATEGORY_ICON: Record<CategoryIcon, { Icon: LucideIcon; label: string }> = {
  app: { Icon: AppWindow, label: "Application" },
  globe: { Icon: Globe2, label: "Site web" },
  layers: { Icon: Layers, label: "Plateforme" },
  server: { Icon: Server, label: "Serveur" },
  cart: { Icon: ShoppingCart, label: "E-commerce" },
  phone: { Icon: Smartphone, label: "Mobile" },
  bot: { Icon: Bot, label: "IA / automatisation" },
  database: { Icon: Database, label: "Données" },
  shield: { Icon: ShieldCheck, label: "Sécurité" },
  palette: { Icon: Palette, label: "Design" },
  chart: { Icon: ChartColumn, label: "Statistiques" },
  tag: { Icon: Tag, label: "Autre" },
};

export const categoryIcon = (icon: CategoryIcon | undefined) => (icon && CATEGORY_ICON[icon]?.Icon) || Tag;
