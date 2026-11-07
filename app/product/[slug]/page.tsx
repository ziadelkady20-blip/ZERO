import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

async function loadProduct(slug: string) {
  try {
    return await prisma.product.findFirst({
      where: { slug, active: true },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameAr: true,
        descriptionEn: true,
        descriptionAr: true,
        price: true,
        compareAtPrice: true,
        promotionType: true,
        promotionValue: true,
        sizeChartUrl: true,
        active: true,
        category: { select: { nameEn: true, nameAr: true, slug: true } },
        images: { select: { url: true, alt: true, position: true }, orderBy: { position: "asc" } },
        variants: { select: { id: true, size: true, color: true, stock: true, sku: true } },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Product | ZERO CLOTHING", robots: { index: false, follow: false } };

  const title = `${product.nameEn} | ZERO CLOTHING`;
  const description = (product.descriptionEn || product.descriptionAr || "Premium performance wear by ZERO CLOTHING.").slice(0, 160);
  const image = product.images[0]?.url;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const canonical = siteUrl ? new URL(`/product/${encodeURIComponent(product.slug)}`, siteUrl).toString() : undefined;

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      ...(canonical ? { url: canonical } : {}),
      ...(image ? { images: [{ url: image, alt: product.nameEn }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();
  const structuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEn,
    description: product.descriptionEn || product.descriptionAr || "Premium performance wear by ZERO CLOTHING.",
    brand: { "@type": "Brand", name: "ZERO CLOTHING" },
    image: product.images.map(image => image.url),
    sku: product.slug,
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: String(product.price),
      availability: product.variants.some(variant => variant.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: process.env.NEXT_PUBLIC_SITE_URL
        ? new URL(`/product/${encodeURIComponent(product.slug)}`, process.env.NEXT_PUBLIC_SITE_URL).toString()
        : undefined,
    },
  } : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      )}
      <ProductDetailClient initialProduct={product as NonNullable<typeof product>} />
    </>
  );
}
