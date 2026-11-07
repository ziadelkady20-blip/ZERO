import HomeClient, { type HomeClientProps } from "./home-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, bundles, reviews] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true, slug: true, nameEn: true, nameAr: true, price: true,
        compareAtPrice: true, featured: true, bestSeller: true, newArrival: true,
        promotionType: true, promotionValue: true,
        category: { select: { slug: true, nameEn: true, nameAr: true } },
        images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
      },
    }).catch(() => []),
    prisma.bundle.findMany({
      where: { active: true },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      select: {
        id: true, titleEn: true, titleAr: true, descriptionEn: true,
        descriptionAr: true, imageUrl: true, totalPrice: true,
        items: {
          where: { product: { active: true } },
          select: {
            productId: true, variantId: true, quantity: true,
            product: {
              select: {
                id: true, nameEn: true, nameAr: true, price: true,
                images: { orderBy: { position: "asc" }, select: { url: true } },
                variants: { select: { id: true, size: true, color: true, stock: true } },
              },
            },
          },
        },
      },
    }).catch(() => []),
    prisma.customerReview.findMany({
      where: { active: true },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      select: { id: true, imageUrl: true, customerName: true, caption: true },
    }).catch(() => []),
  ]);

  return (
    <HomeClient
      initialProducts={products as unknown as HomeClientProps["initialProducts"]}
      initialBundles={bundles as unknown as HomeClientProps["initialBundles"]}
      initialReviews={reviews}
    />
  );
}
