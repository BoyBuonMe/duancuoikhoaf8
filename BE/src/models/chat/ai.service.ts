const STORE_NAME = process.env.STORE_NAME ?? "Gymshark";

const SYSTEM_PROMPT = `You are a helpful customer support assistant for ${STORE_NAME}, an e-commerce fitness apparel store.
Answer briefly in the same language the customer uses (Vietnamese or English).
Help with orders, sizing, shipping, returns, and products. If unsure, suggest contacting human support.`;

export async function generateAiReply(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return (
      `[${STORE_NAME} Assistant — demo mode]\n` +
      "Cảm ơn bạn đã nhắn tin. Hiện chưa cấu hình OPENAI_API_KEY trên server.\n" +
      "Bạn có thể hỏi về đơn hàng, size, giao hàng — hoặc chuyển sang tab Liên hệ support để nói chuyện với admin.\n\n" +
      `Tin nhắn của bạn: "${userMessage.slice(0, 200)}"`
    );
  }

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages,
      max_tokens: 600,
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errText.slice(0, 200)}`);
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
