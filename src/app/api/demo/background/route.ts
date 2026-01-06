import { inngest } from "@/inngest/client";

export async function POST() {
	await inngest.send({
		name: "demo/generate",
		data: {
			prompt: "What is OpenRouter? https://openrouter.ai",
		},
	});
	return Response.json({ status: "started" });
}
