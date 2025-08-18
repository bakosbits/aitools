export const PRICING_OPTIONS = [
    "Freemium",
    "Free trial",
    "Free",
    "Subscription",
    "Single purchase",
    "Enterprise licensing",
    "Usage based",
];

export const AI_MODELS = [
    { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
    { id: "anthropic/claude-sonnet-4", name: "Claude 4 Sonnet" },
    { id: "anthropic/claude-opus-4.1", name: "Claude Opus 4.1" },
    { id: "openai/gpt-4o", name: "OpenAI GPT-4o" },
    { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "openai/gpt-4.1-mini", name: "GPT 4.1 mini" },
    { id: "openai/gpt-oss-120b", name: "GPT oss" },
    { id: "openai/gpt-4.1-nano", name: "GPT 4.1 nano" },
    { id: "openai/gpt-5", name: "GPT 5" },
    { id: "openai/gpt-5-nano", name: "GPT 5 nano" },
    { id: "openai/gpt-5-mini", name: "GPT 5 mini" },
];

// A derived array of just the model IDs for efficient API validation.
export const ALLOWED_MODELS = AI_MODELS.map((model) => model.id);

export const ARTICLE_TYPES = [
    { id: "review", name: "Affiliate Review" },
    { id: "blog", name: "Blog Post" },
    { id: "tutorial", name: "Tutorial" },
];

export const ALLOWED_ARTICLE_TYPES = ARTICLE_TYPES.map((type) => type.id);

export const QUICK_TOOLS = [
    {
        id: "blog",
        name: "Blog Post Outline Generator",
        memo: "This will get you started with an outline for a blog post topic. The rest is on you.",
    },
    {
        id: "headline",
        name: "Headline Rewriter",
        memo: "Need help with your headline? This will give you 5 variations.",
    },
    {
        id: "tweet",
        name: "Tweet Expander",
        memo: "Pass in twitter topic and expand it into 5-8 posts.",
    },
    {
        id: "tagline",
        name: "Tagline Generator",
        memo: "Have an idea?  Need a tagline? This will give you 5.",
    },
    {
        id: "image",
        name: "Image Prompt Generator",
        memo: "Your content needs images. This generates prompt ready image descriptions from text or a URL.",
    },
    {
        id: "quote",
        name: "Quote Generator",
        memo: "Found something quote-worthy? This will generate quotes from text a URL.",
    },
];
