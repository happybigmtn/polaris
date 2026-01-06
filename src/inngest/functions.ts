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
			const matches = prompt.match(URL_REGEX) ?? [];
			console.log(`Found ${matches.length} URLs:`, matches);
			return matches;
		})) as string[];

		const scrapedContent = await step.run("scrape-urls", async () => {
			const results = await Promise.all(
				urls.map(async (url) => {
					try {
						console.log(`Scraping: ${url}`);
						const result = await firecrawl.scrape(url, {
							formats: ["markdown"],
						});
						return result.markdown ?? null;
					} catch (error) {
						console.error(`Failed to scrape ${url}:`, error);
						return null;
					}
				}),
			);
			const content = results.filter(Boolean).join("\n\n");
			console.log(
				`Scraped ${results.filter(Boolean).length}/${urls.length} URLs`,
			);
			return content;
		});

		const finalPrompt = scrapedContent
			? `Context:\n${scrapedContent}\n\nPrompt:\n${prompt}`
			: prompt;

		const result = await step.run("generate-text", async () => {
			console.log(`Generating with prompt length: ${finalPrompt.length}`);
			const response = await generateText({
				model: openrouter.chat("anthropic/claude-haiku-4.5"),
				prompt: finalPrompt,
				experimental_telemetry: {
					isEnabled: true,
					recordInputs: true,
					recordOutputs: true,
				},
			});
			console.log(`Generated ${response.text.length} chars`);
			return response;
		});

		return { text: result.text, urlsProcessed: urls.length };
	},
);

export const demoError = inngest.createFunction(
	{ id: "demo-error" },
	{ event: "demo/error" },
	async ({ step }) => {
		await step.run("throw-error", async () => {
			throw new Error("This is a demo error from Inngest Functions");
		});
	},
);
