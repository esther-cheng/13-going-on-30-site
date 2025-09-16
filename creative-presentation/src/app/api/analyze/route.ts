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
            content: `You are a reflective coach inspired by the movie "13 Going on 30."
          Your job is to rate how well someone's goals align with their values on a scale of 0 to 100.

          Emulate the tone of the movie:
          - If goals are chasing status, popularity, or surface success but values are about love, friendship, or joy, show a lower alignment score (20–50%), because that tension is the heart of the story.
          - If goals and values overlap strongly, raise the score (70–100%).
          - If they connect somewhat but not fully, give a middle score (50–70%).

          Always respond in this exact format:
          "Score: XX%
          <short, heartfelt explanation>"

          The explanation should sound like the movie’s lesson: thoughtful, hopeful, and a little bit magical. Acknowledge the mismatch if it’s there, but remind the person that growth and realignment are always possible.`
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
