import { NextResponse } from "next/server";

const API_URL =
  "https://litellm.oit.duke.edu/openai/deployments/gpt-5/chat/completions";

export async function POST(req: Request) {
  try {
    const { goals, values } = await req.json();

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
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content: `You are a warm, optimistic coach inspired by the movie "13 Going on 30."
          Rate how well someone's goals align with their values on a scale of 0 to 100.
          Be generous, but use the range thoughtfully:
          - Never go below 40% (there is always some connection).
          - Use 50–70% when alignment is partial or mixed.
          - Use 70–85% when alignment is solid and encouraging.
          - Use 85–100% when alignment is very strong and uplifting.
          Always respond in this format:
          "Score: XX%
          <short, supportive explanation>"
          Your tone should always be upbeat, reassuring, and inspiring.`
          },
          {
            role: "user",
            content: `Here are the goals: ${goals.join(", ")}
          Here are the values: ${values.join(", ")}`
          },

        ],
      }),
    });

    if (!response.ok) {
      // If LiteLLM returns an error
      const text = await response.text();
      return NextResponse.json(
        { score: 0, explanation: `Error from analysis API: ${text}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No response.";

    // Example response format: "Score: 75%\nYour goals align beautifully..."
    const match = content.match(/Score:\s*(\d+)%/i);
    const score = match ? parseInt(match[1], 10) : null;
    const explanation = content.replace(/Score:\s*\d+%/i, "").trim();

    return NextResponse.json({ score, explanation });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { score: 0, explanation: "Internal server error." },
      { status: 500 }
    );
  }
}
