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
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  promotionType: "NONE" | "PERCENT" | "BUY2GET1";
  promotionValue: string;
  categoryId: string;
  images: string[];
  variants: Variant[];
};
const toDraft = (p: Product): Draft => ({
  colorImages: p.images
    .filter((i) => i.alt.startsWith("ZERO_COLOR_IMAGE::"))
    .reduce(
      (acc, i) => {
        const parts = i.alt.split("::");
        const color = parts[1]?.trim();
        const side = parts[2] as "front" | "back";
        if (color && (side === "front" || side === "back"))
          acc[color] = {
            ...(acc[color] || { front: "", back: "" }),
            [side]: i.url,
          };
        return acc;
      },
      {} as Record<string, { front: string; back: string }>,
    ),
  slug: p.slug,
  nameEn: p.nameEn,
  nameAr: p.nameAr,
  descriptionEn: p.descriptionEn,
  descriptionAr: p.descriptionAr,
  price: String(p.price),
  compareAtPrice: p.compareAtPrice === null ? "" : String(p.compareAtPrice),
  sizeChartUrl: p.sizeChartUrl || "",
  active: p.active,
  featured: p.featured,
  bestSeller: p.bestSeller,
  newArrival: p.newArrival,
  promotionType: p.promotionType || "NONE",
  promotionValue: String(p.promotionValue || 0),
  categoryId: p.categoryId,
  images: p.images
    .filter((i) => !i.alt.startsWith("ZERO_COLOR_IMAGE::"))
    .map((i) => i.url),
  variants: p.variants.map((v) => ({ ...v })),
});
async function request(path: string, init?: RequestInit) {
  const r = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Request failed");
  return d;
}
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]),
    [categories, setCategories] = useState<Category[]>([]),
    [drafts, setDrafts] = useState<Record<string, Draft>>({}),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(""),
    [categoryFilter, setCategoryFilter] = useState("ALL"),
    [colorDrafts, setColorDrafts] = useState<Record<string, string>>({});
  const [colorSaveState, setColorSaveState] = useState<
    Record<string, "idle" | "dirty" | "saving" | "saved" | "error">
  >({});
  async function load() {
    setBusy(true);
    setError("");
    try {
      const d = await request("/api/admin/products");
      setProducts(d.products || []);
      setCategories(d.categories || []);
      const next: Record<string, Draft> = {};
      (d.products || []).forEach((p: Product) => (next[p.id] = toDraft(p)));
      setDrafts(next);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not load products.";
      if (message === "Unauthorized.") {
        window.location.assign("/admin?next=%2Fadmin%2Fproducts");
        return;
      }
      setError(message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const q = query.trim().toLowerCase();
        const matches =
          !q ||
          [p.nameEn, p.nameAr, p.slug, p.category?.nameEn, p.category?.nameAr]
            .join(" ")
            .toLowerCase()
            .includes(q);
        return (
          matches &&
          (categoryFilter === "ALL" || p.categoryId === categoryFilter)
        );
      }),
    [products, query, categoryFilter],
  );
  function patch(id: string, change: Partial<Draft>) {
    setDrafts((old) => ({ ...old, [id]: { ...old[id], ...change } }));
  }
  function markColorsDirty(id: string) {
    setColorSaveState((old) => ({ ...old, [id]: "dirty" }));
    setError("");
    setNotice("");
  }
  function patchColorImage(
    id: string,
    color: string,
    side: "front" | "back",
    url: string,
  ) {
    const d = drafts[id];
    if (!d) return;
    patch(id, {
      colorImages: {
        ...d.colorImages,
        [color]: {
          ...(d.colorImages[color] || { front: "", back: "" }),
          [side]: url,
        },
      },
    });
    markColorsDirty(id);
  }
  function addProductColor(id: string) {
    const d = drafts[id];
    const color = (colorDrafts[id] || "").trim();
    if (!d || !color) return;
    if (
      d.variants.some(
        (v) => v.color.trim().toLowerCase() === color.toLowerCase(),
      )
    ) {
      setError("This color already exists for the product.");
      return;
    }
    const sizes = Array.from(
      new Set(d.variants.map((v) => v.size.trim()).filter(Boolean)),
    );
    if (!sizes.length) {
      setError("Add at least one size before adding a color.");
      return;
    }
    const variants = [
      ...d.variants,
      ...sizes.map((size) => ({
        sku: [d.slug, size, color].map(skuPart).join("-"),
        size,
        color,
        stock: 0,
      })),
    ];
    patch(id, {
      variants,
      colorImages: { ...d.colorImages, [color]: { front: "", back: "" } },
    });
    setColorDrafts((old) => ({ ...old, [id]: "" }));
    markColorsDirty(id);
    setError("");
  }
  function removeProductColor(id: string, color: string) {
    const d = drafts[id];
    if (!d) return;
    if (
      !window.confirm(
        `Remove the color “${color}” and all its size variants? Changes apply after saving.`,
      )
    )
      return;
    const colorImages = { ...d.colorImages };
    delete colorImages[color];
    patch(id, {
      variants: d.variants.filter(
        (v) => v.color.trim().toLowerCase() !== color.toLowerCase(),
      ),
      colorImages,
    });
    markColorsDirty(id);
  }
  function patchVariant(id: string, index: number, change: Partial<Variant>) {
    const d = drafts[id];
    if (!d) return;
    patch(id, {
      variants: d.variants.map((v, i) =>
        i === index ? { ...v, ...change } : v,
      ),
    });
    markColorsDirty(id);
  }
  function addVariant(id: string) {
    const d = drafts[id];
    if (!d) return;
    patch(id, {
      variants: [...d.variants, { sku: "", size: "", color: "", stock: 0 }],
    });
    markColorsDirty(id);
  }
  function addImage(id: string) {
    const d = drafts[id];
    if (!d) return;
    if (d.images.length >= 8) {
      setError("You can add up to 8 images per product.");
      return;
    }
    patch(id, { images: [...d.images, ""] });
  }
  function patchImage(id: string, index: number, url: string) {
    const d = drafts[id];
    if (!d) return;
    patch(id, {
      images: d.images.map((value, i) => (i === index ? url : value)),
    });
  }
  function removeImage(id: string, index: number) {
    const d = drafts[id];
    if (!d) return;
    patch(id, { images: d.images.filter((_, i) => i !== index) });
  }
  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Remove “${product.nameEn}” from the store? If it has order or bundle history, it will be archived to preserve those records. Otherwise, it will be permanently deleted.`,
    );
    if (!confirmed) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await request("/api/admin/products", {
        method: "DELETE",
        body: JSON.stringify({ id: product.id }),
      });
      setProducts((old) => old.filter((item) => item.id !== product.id));
      setDrafts((old) => {
        const next = { ...old };
        delete next[product.id];
        return next;
      });
      setNotice(
        result.archived
          ? `“${product.nameEn}” was removed from the store and archived to preserve order history.`
          : `“${product.nameEn}” was permanently deleted.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete product.");
    } finally {
      setBusy(false);
    }
  }
  async function saveColors(id: string) {
    const d = drafts[id];
    const product = products.find((item) => item.id === id);
    if (!d || !product) return;

    const variants = d.variants.map((variant) => ({
      ...variant,
      sku: variant.sku.trim(),
      size: variant.size.trim(),
      color: variant.color.trim(),
      stock: Number(variant.stock),
    }));

    if (variants.length === 0) {
      setError("Keep at least one size and color option for this item.");
      setColorSaveState((old) => ({ ...old, [id]: "error" }));
      return;
    }
    if (variants.length > 100) {
      setError("An item can have up to 100 size/color combinations.");
      setColorSaveState((old) => ({ ...old, [id]: "error" }));
      return;
    }

    const combinations = new Set<string>();
    const skus = new Set<string>();
    for (const variant of variants) {
      const combination = `${variant.size.toLowerCase()}::${variant.color.toLowerCase()}`;
      if (!variant.sku || !variant.size || !variant.color) {
        setError("Every item needs a SKU, size and color before saving.");
        setColorSaveState((old) => ({ ...old, [id]: "error" }));
        return;
      }
      if (!Number.isInteger(variant.stock) || variant.stock < 0) {
        setError("Stock must be a whole number of zero or more.");
        setColorSaveState((old) => ({ ...old, [id]: "error" }));
        return;
      }
      if (combinations.has(combination)) {
        setError(
          `The size/color combination ${variant.size} / ${variant.color} is repeated.`,
        );
        setColorSaveState((old) => ({ ...old, [id]: "error" }));
        return;
      }
      if (skus.has(variant.sku.toLowerCase())) {
        setError(`The SKU ${variant.sku} is repeated.`);
        setColorSaveState((old) => ({ ...old, [id]: "error" }));
        return;
      }
      combinations.add(combination);
      skus.add(variant.sku.toLowerCase());
    }

    const activeColors = new Set(
      variants.map((variant) => variant.color.toLowerCase()),
    );
    const images = [
      ...d.images
        .map((url) => ({ url: url.trim(), alt: "" }))
        .filter((image) => image.url),
      ...Object.entries(d.colorImages)
        .filter(([color]) => activeColors.has(color.trim().toLowerCase()))
        .flatMap(([color, pair]) =>
          (["front", "back"] as const)
            .filter((side) => pair[side]?.trim())
            .map((side) => ({
              url: pair[side].trim(),
              alt: "ZERO_COLOR_IMAGE::" + color + "::" + side,
            })),
        ),
    ];
    if (images.length > 32) {
      setError("This product can have up to 32 photos in total.");
      setColorSaveState((old) => ({ ...old, [id]: "error" }));
      return;
    }
    if (
      images.some((image) => {
        try {
          return new URL(image.url).protocol !== "https:";
        } catch {
          return true;
        }
      })
    ) {
      setError("Product and color photos must use valid HTTPS image links.");
      setColorSaveState((old) => ({ ...old, [id]: "error" }));
      return;
    }

    setColorSaveState((old) => ({ ...old, [id]: "saving" }));
    setBusy(true);
    setError("");
    try {
      const result = await request("/api/admin/products", {
        method: "PATCH",
        body: JSON.stringify({
          id,
          active: product.active,
          variants,
          images,
        }),
      });
      if (!result.product)
        throw new Error("The server did not confirm the save.");

      const saved = result.product as Product;
      const savedDraft = toDraft(saved);
      setProducts((old) => old.map((item) => (item.id === id ? saved : item)));
      setDrafts((old) => ({
        ...old,
        [id]: {
          ...old[id],
          variants: savedDraft.variants,
          colorImages: savedDraft.colorImages,
        },
      }));
      setColorSaveState((old) => ({ ...old, [id]: "saved" }));
      setNotice("Colors and stock saved successfully.");
    } catch (e) {
      setColorSaveState((old) => ({ ...old, [id]: "error" }));
      setError(
        e instanceof Error
          ? e.message
          : "Could not save colors. Your changes are still on this page; try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save(id: string) {
    const d = drafts[id];
    if (!d) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await request("/api/admin/products", {
        method: "PATCH",
        body: JSON.stringify({
          ...d,
          id,
          price: Number(d.price),
          compareAtPrice:
            d.compareAtPrice === "" ? null : Number(d.compareAtPrice),
          sizeChartUrl: d.sizeChartUrl.trim() || null,
          promotionValue: Number(d.promotionValue || 0),
          images: [
            ...d.images
              .map((v) => ({ url: v.trim(), alt: "" }))
              .filter((v) => v.url),
            ...Object.entries(d.colorImages).flatMap(([color, pair]) =>
              (["front", "back"] as const)
                .filter((side) => pair[side]?.trim())
                .map((side) => ({
                  url: pair[side].trim(),
                  alt: "ZERO_COLOR_IMAGE::" + color + "::" + side,
                })),
            ),
          ],
          variants: d.variants.map((v) => ({ ...v, stock: Number(v.stock) })),
        }),
      });
      setNotice("Saved product and variant inventory.");
      setColorSaveState((old) => ({ ...old, [id]: "saved" }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="admin-main admin-product-page">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">ZERO CLOTHING / CATALOG</p>
          <h1>Product editor</h1>
        </div>
        <div className="admin-top-actions">
          <Link className="admin-primary" href="/admin/setup">
            + Add product
          </Link>
          <Link className="admin-secondary" href="/admin">
            Dashboard ↗
          </Link>
          <button
            className="admin-secondary"
            onClick={() => void load()}
            disabled={busy}
          >
            Refresh
          </button>
        </div>
      </header>
      <p className="admin-muted">
        Manage the live catalog in one place. Save a product to publish its
        updated details, photos, price and size/color stock to the storefront.
      </p>
      <div className="admin-catalog-toolbar">
        <label className="admin-search">
          <Search size={16} />
          <input
            aria-label="Search products"
            placeholder="Search by name or URL slug…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn} / {c.nameAr}
            </option>
          ))}
        </select>
        <span>{filteredProducts.length} products</span>
      </div>
      {error && <p className="admin-alert error">{error}</p>}
      {notice && <p className="admin-alert success">{notice}</p>}
      {busy && products.length === 0 ? (
        <p className="admin-muted">Loading catalog…</p>
      ) : products.length === 0 ? (
        <section className="admin-panel">
          <h2>No products yet</h2>
          <p>Create your first product from the setup page.</p>
          <Link className="admin-primary" href="/admin/setup">
            Open store setup ↗
          </Link>
        </section>
      ) : filteredProducts.length === 0 ? (
        <section className="admin-panel">
          <h2>No matching products</h2>
          <p>Try another search or category.</p>
          <button
            className="admin-secondary"
            onClick={() => {
              setQuery("");
              setCategoryFilter("ALL");
            }}
          >
            Clear filters
          </button>
        </section>
      ) : (
        <div className="admin-product-editor-list">
          {filteredProducts.map((p) => {
            const d = drafts[p.id];
            if (!d) return null;
            return (
              <section className="admin-panel admin-product-editor" key={p.id}>
                <header className="admin-panel-heading">
                  <div className="admin-product-heading-main">
                    {p.images[0]?.url ? (
                      <Image
                        className="admin-product-thumb"
                        src={p.images[0].url}
                        alt={p.images[0].alt || p.nameEn}
                        width={900}
                        height={900}
                        sizes="(max-width: 700px) 90vw, 280px"
                      />
                    ) : (
                      <div className="admin-product-thumb admin-product-thumb-empty">
                        Z.
                      </div>
                    )}
                    <div>
                      <h2>{p.nameEn}</h2>
                      <p>
                        {p.nameAr} · /{d.slug} ·{" "}
                        {p.category?.nameEn || "Uncategorized"}
                      </p>
                      <div className="admin-product-heading-links">
                        <Link href={"/product/" + p.slug} target="_blank">
                          View live page ↗
                        </Link>
                        <span>Updated from the catalog database</span>
                      </div>
                    </div>
                  </div>
                  <div className="admin-product-state-stack">
                    <button
                      type="button"
                      className="admin-delete-product"
                      onClick={() => void deleteProduct(p)}
                      disabled={busy}
                    >
                      Delete product
                    </button>
                    <span
                      className={
                        d.active
                          ? "admin-product-state"
                          : "admin-product-state inactive"
                      }
                    >
                      {d.active ? "PUBLISHED" : "HIDDEN"}
                    </span>
                    <span
                      className={
                        JSON.stringify(d) !== JSON.stringify(toDraft(p))
                          ? "admin-unsaved-state"
                          : "admin-saved-state"
                      }
                    >
                      {JSON.stringify(d) !== JSON.stringify(toDraft(p))
                        ? "UNSAVED CHANGES"
                        : "UP TO DATE"}
                    </span>
                  </div>
                </header>
                <div className="admin-form-grid">
                  <label>
                    Product name (EN)
                    <input
                      value={d.nameEn}
                      onChange={(e) => patch(p.id, { nameEn: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    اسم المنتج (AR)
                    <input
                      value={d.nameAr}
                      onChange={(e) => patch(p.id, { nameAr: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Slug
                    <input
                      value={d.slug}
                      onChange={(e) => patch(p.id, { slug: e.target.value })}
                      required
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={d.categoryId}
                      onChange={(e) =>
                        patch(p.id, { categoryId: e.target.value })
                      }
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameEn} / {c.nameAr}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Price (EGP)
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={d.price}
                      onChange={(e) => patch(p.id, { price: e.target.value })}
                    />
                  </label>
                  <label>
                    Compare-at price (optional)
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={d.compareAtPrice}
                      onChange={(e) =>
                        patch(p.id, { compareAtPrice: e.target.value })
                      }
                    />
                  </label>
                  <label className="admin-check-label">
                    <input
                      type="checkbox"
                      checked={d.active}
                      onChange={(e) =>
                        patch(p.id, { active: e.target.checked })
                      }
                    />{" "}
                    Published on storefront
                  </label>
                  <label className="admin-check-label">
                    <input
                      type="checkbox"
                      checked={d.featured}
                      onChange={(e) =>
                        patch(p.id, { featured: e.target.checked })
                      }
                    />{" "}
                    Featured product
                  </label>
                  <label className="admin-check-label">
                    <input
                      type="checkbox"
                      checked={d.bestSeller}
                      onChange={(e) =>
                        patch(p.id, { bestSeller: e.target.checked })
                      }
                    />{" "}
                    Best Seller
                  </label>
                  <label className="admin-check-label">
                    <input
                      type="checkbox"
                      checked={d.newArrival}
                      onChange={(e) =>
                        patch(p.id, { newArrival: e.target.checked })
                      }
                    />{" "}
                    New Arrival
                  </label>
                  <div className="admin-wide-field admin-promotion-editor">
                    <strong>Product promotion</strong>
                    <p className="admin-muted">
                      Choose one automatic offer for this product.
                    </p>
                    <div className="admin-form-grid">
                      <label>
                        Promotion type
                        <select
                          value={d.promotionType}
                          onChange={(e) =>
                            patch(p.id, {
                              promotionType: e.target
                                .value as Draft["promotionType"],
                              promotionValue:
                                e.target.value === "PERCENT"
                                  ? Number(d.promotionValue) > 0
                                    ? d.promotionValue
                                    : "10"
                                  : "0",
                            })
                          }
                        >
                          <option value="NONE">No promotion</option>
                          <option value="PERCENT">Percentage discount</option>
                          <option value="BUY2GET1">Buy 2 Get 1 Free</option>
                        </select>
                      </label>
                      {d.promotionType === "PERCENT" && (
                        <label>
                          Discount percentage
                          <input
                            type="number"
                            min="1"
                            max="90"
                            step="1"
                            value={d.promotionValue}
                            onChange={(e) =>
                              patch(p.id, { promotionValue: e.target.value })
                            }
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="admin-wide-field admin-product-images-field">
                    <div className="admin-images-heading">
                      <div>
                        <strong>Product images</strong>
                        <p className="admin-muted">
                          Add up to 8 direct HTTPS image URLs. The first image
                          is the main product photo; the rest appear in the
                          product gallery.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="admin-secondary"
                        onClick={() => addImage(p.id)}
                        disabled={d.images.length >= 8}
                      >
                        + Add image
                      </button>
                    </div>
                    <div className="admin-product-image-rows">
                      {d.images.map((url, index) => (
                        <div className="admin-product-image-row" key={index}>
                          <span className="admin-image-position">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <input
                            type="url"
                            aria-label={`Product image URL ${index + 1}`}
                            value={url}
                            onChange={(e) =>
                              patchImage(p.id, index, e.target.value)
                            }
                            placeholder="https://… (direct image URL)"
                          />
                          <button
                            type="button"
                            className="admin-image-remove"
                            onClick={() => removeImage(p.id, index)}
                            aria-label={`Remove image ${index + 1}`}
                          >
                            Remove
                          </button>
                          {url.trim().startsWith("https://") && (
                            <Image
                              className="admin-image-row-preview"
                              src={url.trim()}
                              alt={`Product image ${index + 1} preview`}
                              onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                              }}
                              width={900}
                              height={900}
                              sizes="(max-width: 700px) 90vw, 280px"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {d.images.length === 0 && (
                      <p className="admin-muted">
                        No images added yet. Add the main product photo to get
                        started.
                      </p>
                    )}
                    <span className="admin-muted">
                      Paste a link that opens the image itself, not a webpage.
                      Save product changes to publish the gallery.
                    </span>
                  </div>
                  <div className="admin-wide-field admin-color-image-editor">
                    <strong>Product colors & photos</strong>
                    <p className="admin-muted">
                      Add or remove colors, then save once. Each new color is
                      added to all current sizes. Front and back photos are
                      optional.
                    </p>
                    <div className="admin-color-save-row">
                      <button
                        type="button"
                        className="admin-primary"
                        onClick={() => void saveColors(p.id)}
                        disabled={
                          busy ||
                          colorSaveState[p.id] === "saving" ||
                          (colorSaveState[p.id] !== "dirty" &&
                            colorSaveState[p.id] !== "error")
                        }
                      >
                        {colorSaveState[p.id] === "saving"
                          ? "Saving colors…"
                          : "Save colors & stock"}
                      </button>
                      <span
                        className={
                          "admin-color-save-status status-" +
                          (colorSaveState[p.id] || "idle")
                        }
                        role="status"
                        aria-live="polite"
                      >
                        {colorSaveState[p.id] === "saved"
                          ? "All changes saved"
                          : colorSaveState[p.id] === "dirty"
                            ? "You have unsaved color changes"
                            : colorSaveState[p.id] === "saving"
                              ? "Saving securely…"
                              : colorSaveState[p.id] === "error"
                                ? "Save failed — your edits are still here"
                                : "Ready"}
                      </span>
                    </div>
                    <div className="admin-add-color-row">
                      <input
                        value={colorDrafts[p.id] || ""}
                        disabled={busy}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addProductColor(p.id);
                          }
                        }}
                        onChange={(e) =>
                          setColorDrafts((old) => ({
                            ...old,
                            [p.id]: e.target.value,
                          }))
                        }
                        placeholder="New color name (e.g. Burgundy)"
                        aria-label="New product color"
                      />
                      <button
                        type="button"
                        className="admin-secondary"
                        onClick={() => addProductColor(p.id)}
                        disabled={busy || !(colorDrafts[p.id] || "").trim()}
                      >
                        + Add color
                      </button>
                    </div>
                    <div className="admin-color-chips">
                      {Array.from(
                        new Set(
                          d.variants.map((v) => v.color.trim()).filter(Boolean),
                        ),
                      ).map((color) => (
                        <span className="admin-color-chip" key={color}>
                          {color}
                          <button
                            type="button"
                            onClick={() => removeProductColor(p.id, color)}
                            disabled={busy}
                            aria-label={"Remove " + color}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="admin-color-photo-grid">
                      {Array.from(
                        new Set(
                          d.variants.map((v) => v.color.trim()).filter(Boolean),
                        ),
                      ).map((color) => (
                        <div className="admin-color-image-card" key={color}>
                          <div className="admin-color-card-title">
                            <h4>{color}</h4>
                            <span>OPTIONAL PHOTOS</span>
                          </div>
                          <div className="admin-form-grid">
                            {(["front", "back"] as const).map((side) => (
                              <label key={side}>
                                {side === "front"
                                  ? "Front image URL (optional)"
                                  : "Back image URL (optional)"}
                                <input
                                  type="url"
                                  disabled={busy}
                                  value={d.colorImages[color]?.[side] || ""}
                                  onChange={(e) =>
                                    patchColorImage(
                                      p.id,
                                      color,
                                      side,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Paste direct HTTPS image URL"
                                />
                                {d.colorImages[color]?.[side]?.startsWith(
                                  "https://",
                                ) && (
                                  <Image
                                    src={d.colorImages[color][side]}
                                    alt={color + " " + side + " preview"}
                                    style={{
                                      display: "block",
                                      width: "100%",
                                      maxWidth: 190,
                                      height: 150,
                                      objectFit: "contain",
                                      marginTop: 8,
                                      border: "1px solid #ddd",
                                      background: "#fff",
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.visibility =
                                        "hidden";
                                    }}
                                    width={900}
                                    height={900}
                                    sizes="(max-width: 700px) 90vw, 280px"
                                  />
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="admin-wide-field">
                    <label>
                      Size chart image URL
                      <input
                        type="url"
                        value={d.sizeChartUrl}
                        onChange={(e) =>
                          patch(p.id, { sizeChartUrl: e.target.value })
                        }
                        placeholder="https://… (direct image URL)"
                      />
                    </label>
                    <p className="admin-muted">
                      Add a direct HTTPS link to this product’s size chart
                      image. Leave empty if there is no chart.
                    </p>
                    {d.sizeChartUrl.trim().startsWith("https://") && (
                      <Image
                        src={d.sizeChartUrl.trim()}
                        alt="Size chart preview"
                        style={{
                          display: "block",
                          maxWidth: 320,
                          maxHeight: 320,
                          objectFit: "contain",
                          marginTop: 10,
                          border: "1px solid #ddd",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                        width={700}
                        height={900}
                        sizes="(max-width: 700px) 90vw, 360px"
                      />
                    )}
                  </div>
                  <label>
                    Description EN
                    <textarea
                      rows={2}
                      value={d.descriptionEn}
                      onChange={(e) =>
                        patch(p.id, { descriptionEn: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    الوصف بالعربي
                    <textarea
                      rows={2}
                      value={d.descriptionAr}
                      onChange={(e) =>
                        patch(p.id, { descriptionAr: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="admin-variants-head">
                  <div>
                    <h3>Size / color inventory</h3>
                    <p>Each combination has its own SKU and stock count.</p>
                  </div>
                  <button
                    type="button"
                    className="admin-secondary"
                    onClick={() => addVariant(p.id)}
                    disabled={busy}
                  >
                    + Add variant
                  </button>
                </div>
                <div className="admin-variant-list">
                  {d.variants.map((v, i) => (
                    <div className="admin-variant-row" key={v.id || "new-" + i}>
                      <label>
                        SKU
                        <input
                          value={v.sku}
                          disabled={busy}
                          onChange={(e) =>
                            patchVariant(p.id, i, { sku: e.target.value })
                          }
                          required
                        />
                      </label>
                      <label>
                        Size
                        <input
                          value={v.size}
                          disabled={busy}
                          onChange={(e) =>
                            patchVariant(p.id, i, { size: e.target.value })
                          }
                          required
                        />
                      </label>
                      <label>
                        Color
                        <input
                          value={v.color}
                          disabled={busy}
                          onChange={(e) =>
                            patchVariant(p.id, i, { color: e.target.value })
                          }
                          required
                        />
                      </label>
                      <label>
                        Stock
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={v.stock}
                          disabled={busy}
                          onChange={(e) =>
                            patchVariant(p.id, i, { stock: e.target.value })
                          }
                          required
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="admin-save-row">
                  <p>
                    Saving updates this product on the homepage, shop and
                    product detail page. Hidden products won&apos;t appear in
                    the public catalog.
                  </p>
                  <button
                    className="admin-primary admin-save-product"
                    onClick={() => void save(p.id)}
                    disabled={
                      busy || JSON.stringify(d) === JSON.stringify(toDraft(p))
                    }
                  >
                    {busy ? "Saving…" : "Save product changes"}
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
