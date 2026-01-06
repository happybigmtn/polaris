import { generateText } from "ai";
import { inngest } from "./client";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import FirecrawlApp from "@mendable/firecrawl-js";

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

const firecrawl = new FirecrawlApp({
	apiKey: process.env.FIRECRAWL_API_KEY,
});

const URL_REGEX = /https?:\/\/[^\s]+/g;

export const demoGenerate = inngest.createFunction(
	{ id: "demo-generate" },
	{ event: "demo/generate" },
	async ({ event, step }) => {
		const { prompt } = event.data as { prompt: string };

		const urls = (await step.run("extract-urls", async () => {
			return prompt.match(URL_REGEX) ?? [];
		})) as string[];

		const scrapedContent = await step.run("scrape-urls", async () => {
			const results = await Promise.all(
				urls.map(async (url) => {
					const result = await firecrawl.scrape(url, {
						formats: ["markdown"],
					});
					return result.markdown ?? null;
				}),
			);
			return results.filter(Boolean).join("\n\n");
		});

		const finalPrompt = scrapedContent
			? `Context:\n${scrapedContent}\n\nPrompt:\n${prompt}`
			: prompt;

		await step.run("generate-text", async () => {
			return await generateText({
				model: openrouter.chat("anthropic/claude-haiku-4.5"),
				prompt: finalPrompt,
			});
		});
	},
);
