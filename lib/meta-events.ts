// Client-side Meta commerce events. The base pixel is initialized in app/layout.tsx.
export type MetaContent = {
  content_ids: string[];
  content_type: "product";
  contents?: { id: string; quantity: number; item_price?: number }[];
  value: number;
  currency: "EGP";
  num_items?: number;
};

export function trackMetaEvent(
  event: "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase",
  data: MetaContent,
  eventId?: string,
): void {
  if (typeof window === "undefined") return;
  // The base pixel's fbq stub queues events until fbevents.js is ready.
  if (typeof window.fbq !== "function") return;
  if (eventId) window.fbq("track", event, data, { eventID: eventId });
  else window.fbq("track", event, data);
}
