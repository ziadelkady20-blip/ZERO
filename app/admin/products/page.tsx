"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import "../admin.css";

type Variant = {
  id?: string;
  sku: string;
  size: string;
  color: string;
  stock: number | string;
};
type Product = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  compareAtPrice: number | null;
  sizeChartUrl: string | null;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  promotionType: "NONE" | "PERCENT" | "BUY2GET1";
  promotionValue: number;
  categoryId: string;
  category: { nameEn: string; nameAr: string };
  images: { url: string; alt: string; position: number }[];
  variants: Variant[];
};
type Category = { id: string; nameEn: string; nameAr: string };

function skuPart(value: string) {
  return Array.from(value.trim().toLowerCase())
    .map((character) => {
      if (/[a-z0-9]/.test(character)) return character;
      if (/\s/.test(character)) return "-";
      return `u${character.codePointAt(0)?.toString(16) || "0"}`;
    })
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
type Draft = {
  colorImages: Record<string, { front: string; back: string }>;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  compareAtPrice: string;
  sizeChartUrl: string;
  ¶»§q«^