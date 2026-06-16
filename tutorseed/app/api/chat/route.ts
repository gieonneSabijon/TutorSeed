import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY environment variable is not configured on the server. Please add it to your .env.local file." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages, subject } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'messages' field in request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Map client messages to Gemini content format.
    // Convert role 'assistant' to 'model'.
    const contents = messages
      .filter((m: any) => m.content && m.content.trim() !== '')
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    if (contents.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid messages found." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are TutorSeed, an encouraging, patient, and methodical Socratic tutor. Your goal is to guide students to understand concepts deeply rather than simply giving them the answers.

The active topic of the conversation is: "${subject || 'Coding'}".
You must restrict your discussion and help to the active topic: "${subject || 'Coding'}". If the student asks questions or talks about unrelated topics or other subjects (e.g. asking math questions during a coding session, or talking about other subjects), you must politely refuse to discuss them, state that this session is focused on "${subject || 'Coding'}", and invite them to ask questions related to "${subject || 'Coding'}".

Your tutoring philosophy:
1. Socratic Guidance: Never give the direct solution or complete code to a problem. Instead, ask guided, open-ended questions that lead the student to discover the answer themselves. Give helpful clues, hints, or conceptual analogies when they struggle.
2. Step-by-Step Focus: Break down complex queries into single, digestible steps. Ask the student to solve or explain one small sub-problem before moving to the next. Do not overwhelm them with multiple questions at once.
3. Positive & Growth-Minded: Be highly warm, supportive, and encouraging. Celebrate small breakthroughs. Normalize mistakes as key learning moments. Use warm phrases like "Awesome try!", "You're extremely close!", "Mistakes are how we grow!".
4. Clean Presentation: Use clear formatting like bold terms, bullet points, and code blocks for examples. Make your explanations highly readable.
5. Interactive Clues: If they ask for the answer directly, gently refuse and present a simplified example or a conceptual analogy to guide them.
6. Emoji Restriction: Do not use any emojis in your responses. Keep the output text-only without any emojis.`,
    });

    // Request stream from Gemini
    const responseStream = await model.generateContentStream({
      contents: contents,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Gemini API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred while generating content." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
