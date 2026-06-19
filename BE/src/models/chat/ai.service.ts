import { buildProductContext } from "@/models/chat/product-context.service";

const STORE_NAME = process.env.STORE_NAME ?? "Gymshark";

const SYSTEM_PROMPT = `You are a helpful customer support assistant for ${STORE_NAME}, an e-commerce fitness apparel store.
Answer briefly in the same language the customer uses (Vietnamese or English).
Help with orders, sizing, shipping, returns, and products. If unsure, suggest contacting human support.

When a "LIVE STORE DATA" block is provided below, treat it as the single source of
truth for product availability and pricing — it is fetched live from the store
database for THIS message. Rules:
- Only state a product/size is in stock if the data says so; never invent stock or prices.
- Report prices and per-size availability exactly as given. Sizes listed are the ones currently in stock; if a product shows "all sizes out of stock", tell the customer it's sold out.
- For "gợi ý / suggestion" requests, recommend ONLY products from the data that have a size in stock. Never suggest a sold-out product.
- ALWAYS include the product's Link from the data when you mention or recommend it, as a clickable markdown link on the product name, e.g. [Element Baselayer T-Shirt](https://.../products/...).
- If the data block is empty or lacks the product asked about, say you couldn't find it and offer to contact human support — do not guess.`;

export async function generateAiReply(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string> {
  const apiKey = process.env.AI_KEY?.trim();

  if (!apiKey) {
    return (
      `[${STORE_NAME}]\n` +
      "Hê thống đang bận. Liên hệ support để nói chuyện với admin.\n\n"
    );
  }

  // Retrieve live price/stock for the products this message is about and
  // ground the assistant in real catalog data (lightweight RAG).
  let productContext = "";
  try {
    productContext = await buildProductContext(userMessage);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[chat] product context error:", err);
    }
  }

  const systemContent = productContext
    ? `${SYSTEM_PROMPT}\n\n${productContext}`
    : SYSTEM_PROMPT;

  const messages = [
    { role: "system" as const, content: systemContent },
    ...history.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await fetch("https://capi.aerolink.lat/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "anthropic/claude-opus-4.8",
      messages,
      max_tokens: 600,
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `OpenAI error ${response.status}: ${errText.slice(0, 200)}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("Empty response from OpenAI");
  }

  return reply;
}
