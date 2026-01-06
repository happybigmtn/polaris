// import { google } from "@ai-sdk/google";
// import { generateText } from "ai";
//
// export async function POST() {
// 	const response = await generateText({
// 		model: google("gemini-2.5-flash"),
// 		prompt: "Write a veggie lasagna recipe for 4 people.",
// 	});
// 	return Response.json({ response });
// }
//

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST() {
	const { text } = await generateText({
		model: openrouter.chat("anthropic/claude-haiku-4.5"),
		prompt: "What is OpenRouter?",
		experimental_telemetry: {
			isEnabled: true,
			recordInputs: true,
			recordOutputs: true,
		},
	});

	return Response.json({ text });
}
