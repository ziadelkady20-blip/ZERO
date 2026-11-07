type WhatsAppDelivery = {
  configured: boolean;
  sent: boolean;
  reason?: "not_configured" | "invalid_phone" | "provider_error";
  messageId?: string;
};

type OrderMessage = {
  code: string;
  customerName: string;
  phone: string;
  total: number;
  whatsappOptIn: boolean;
};

const WHATSAPP_OPT_IN_MARKER = "[[ZERO_WHATSAPP_OPT_IN]]";
const ESCAPE = String.fromCharCode(92);
const NEWLINE = String.fromCharCode(10);

export function addWhatsAppOptInMarker(notes: string | null, optedIn: boolean) {
  if (!optedIn) {
    return notes?.startsWith(WHATSAPP_OPT_IN_MARKER)
      ? ESCAPE + notes
      : notes;
  }
  return WHATSAPP_OPT_IN_MARKER + (notes ? NEWLINE + notes : "");
}

export function hasWhatsAppOptIn(notes: string | null) {
  return typeof notes === "string" && notes.startsWith(WHATSAPP_OPT_IN_MARKER);
}

export function stripWhatsAppOptIn(notes: string | null) {
  if (typeof notes !== "string") return notes;
  if (notes.startsWith(WHATSAPP_OPT_IN_MARKER)) {
    const clean = notes.slice(WHATSAPP_OPT_IN_MARKER.length);
    return (clean.startsWith(NEWLINE) ? clean.slice(1) : clean) || null;
  }
  return notes.startsWith(ESCAPE + WHATSAPP_OPT_IN_MARKER) ? notes.slice(1) : notes;
}
const COUNTRY_CODE = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "20").replace(/\D/g, "");

export function isWhatsAppConfigured() {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export function normalizeWhatsAppPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = COUNTRY_CODE + digits.slice(1);
  else if (COUNTRY_CODE && digits.length >= 9 && digits.length <= 11 && !digits.startsWith(COUNTRY_CODE)) digits = COUNTRY_CODE + digits;
  return /^\d{8,15}$/.test(digits) ? digits : null;
}

export function buildWhatsAppSupportUrl(orderCode?: string) {
  const businessNumber = process.env.WHATSAPP_BUSINESS_NUMBER;
  if (!businessNumber) return null;
  const phone = normalizeWhatsAppPhone(businessNumber);
  if (!phone) return null;
  const message = orderCode
    ? `مرحبًا، أحتاج مساعدة بخصوص طلب ZERO رقم ${orderCode}.`
    : "مرحبًا، أحتاج مساعدة بخصوص متجر ZERO.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

async function sendTemplate(
  phoneValue: string,
  templateName: string,
  parameters: string[],
): Promise<WhatsAppDelivery> {
  if (!isWhatsAppConfigured()) return { configured: false, sent: false, reason: "not_configured" };
  const phone = normalizeWhatsAppPhone(phoneValue);
  if (!phone) return { configured: true, sent: false, reason: "invalid_phone" };

  const version = process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0";
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "ar";
  const url = `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: language },
          components: [{
            type: "body",
            parameters: parameters.map((text) => ({ type: "text", text: text.slice(0, 1024) })),
          }],
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    });
    const payload = await response.json().catch(() => ({})) as {
      messages?: { id?: string }[];
      error?: { code?: number; message?: string };
    };
    if (!response.ok || !payload.messages?.[0]?.id) {
      console.error("[whatsapp] Template delivery failed.", {
        status: response.status,
        code: payload.error?.code,
      });
      return { configured: true, sent: false, reason: "provider_error" };
    }
    return { configured: true, sent: true, messageId: payload.messages[0].id };
  } catch (error) {
    console.error("[whatsapp] Template delivery request failed.", error instanceof Error ? error.name : "unknown");
    return { configured: true, sent: false, reason: "provider_error" };
  }
}

export function sendOrderConfirmation(order: OrderMessage, trackingUrl: string) {
  if (!order.whatsappOptIn) return { configured: isWhatsAppConfigured(), sent: false, reason: "not_opted_in" as const };
  const template = process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRMATION || "zero_order_confirmation";
  return sendTemplate(order.phone, template, [
    order.customerName,
    order.code,
    `EGP ${order.total.toLocaleString("en-EG")}`,
    trackingUrl,
  ]);
}

const statusCopy: Record<string, { ar: string; en: string }> = {
  PENDING: { ar: "تم استلام الطلب", en: "Order received" },
  CONFIRMED: { ar: "تم تأكيد الطلب", en: "Order confirmed" },
  PREPARING: { ar: "جاري تجهيز الطلب", en: "Order is being prepared" },
  SHIPPED: { ar: "الطلب خرج للتوصيل", en: "Order is on the way" },
  DELIVERED: { ar: "تم تسليم الطلب", en: "Order delivered" },
  CANCELLED: { ar: "تم إلغاء الطلب", en: "Order cancelled" },
};

export function sendOrderStatusUpdate(order: OrderMessage, status: string, trackingUrl: string) {
  if (!order.whatsappOptIn) return { configured: isWhatsAppConfigured(), sent: false, reason: "not_opted_in" as const };
  const template = process.env.WHATSAPP_TEMPLATE_ORDER_STATUS || "zero_order_status_update";
  const language = (process.env.WHATSAPP_TEMPLATE_LANGUAGE || "ar").toLowerCase();
  const statusLabel = statusCopy[status]?.[language.startsWith("ar") ? "ar" : "en"] || status;
  return sendTemplate(order.phone, template, [
    order.customerName,
    order.code,
    statusLabel,
    trackingUrl,
  ]);
}
