import { NextResponse } from "next/server";

const API_URL =
  "https://litellm.oit.duke.edu/openai/deployments/gpt-5/chat/completions";

export async function POST(req: Request) {
  const { goals, values } = await req.json();

  if (!goals?.length || !values?.length) {
    return NextResponse.json({ score: 0, explanation: "No data provided." });
  }

  // Simple keyword overlap score (can be replaced w/ embeddings later)
  const overlap = goals.filter((g: string) =>
    values.somse((v: string) =>
      g.toLowerCase().includes(v.toLowerCase())
    )
  );
  const score = goals.length
    ? Math.round((overlap.length / goals.length) * 100)
    : 0;

  // Call GPT-5 via LiteLLM
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "x-litellm-api-key": process.env.DUKE_API_KEY as string,
    },
    body: JSON.stringify({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "You are a thoughtful coach helping someone reflect on how well their goals align with their values. Rate the alignment on a scale of 0 to 100 and be quite generous.",
        },
        {
          role: "user",
          content: `Here are the goals: ${goals.join(
            ", "
          )}\nHere are the values: ${values.join(
            ", "
          )}\nThe numeric alignment score is ${score}%. Provide a short, supportive explanation of what this means.`,
        },
      ],
    }),
  });

  const data = await response.json();
  const explanation = data.choices?.[0]?.message?.content || "No response.";

  return NextResponse.json({ score, explanation });
}
