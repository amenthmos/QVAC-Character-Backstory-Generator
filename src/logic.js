// QVAC Character Backstory Generator — core logic.
// completion() writes a short backstory paragraph grounded in the specific
// traits the user typed. A grounding check confirms the traits' own words
// (or close variants) show up in the output; if the model drifts into a
// generic backstory, we fall back to a template built from the literal
// traits so it never loses the specifics.

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length === 0) return true;
  if (text.length > 900) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "i am not able", "language model"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "at", "for",
  "with", "was", "were", "is", "are", "now", "who", "runs", "very", "once",
]);

function keywordsOf(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

function isGrounded(output, traits) {
  const kws = keywordsOf(traits);
  if (kws.length === 0) return true;
  const lowerOut = output.toLowerCase();
  const hits = kws.filter((kw) => lowerOut.includes(kw) || lowerOut.includes(kw.slice(0, Math.max(4, kw.length - 2))));
  // Require at least one concrete anchor to the input traits, not a strict
  // majority — a good creative backstory paraphrases most traits (e.g.
  // "detective" -> "crime", "solve") while still being clearly grounded.
  return hits.length >= 1;
}

function fallback(traits) {
  return `Before becoming known simply as "${traits}," this character built a life out of hard lessons and small victories. Every quirk and habit they carry now traces back to something they lived through, and it still shapes how they treat the people around them today.`;
}

export async function generate(modelId, traits) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You write a short, grounded backstory paragraph (3-5 sentences) for a fictional " +
          "character, based on the traits/role given. The backstory MUST use and build on the " +
          "specific traits provided, not generic filler. Reply with ONLY the backstory paragraph, " +
          "no preamble, no explanation, no title.",
      },
      {
        role: "user",
        content: "Traits/role: grumpy retired detective, now runs a bakery",
      },
      {
        role: "assistant",
        content:
          "Twenty-two years on the force taught him to read a room before he ever opened his mouth, " +
          "and he never quite lost the habit even after he traded his badge for a rolling pin. He " +
          "opened the bakery on the same street where he solved his first real case, mostly because " +
          "the quiet of early mornings kneading dough was the only thing that ever settled his nerves. " +
          "He still grumbles at customers who linger too long by the register, out of old instinct more " +
          "than actual annoyance, and he keeps a notepad by the ovens just in case something doesn't add up.",
      },
      { role: "user", content: `Traits/role: ${traits}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.85, maxTokens: 260 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = text
    .trim()
    .replace(/^here'?s[^:\n]*:\s*/i, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();

  const backstory = looksUnusable(text) || !isGrounded(text, traits) ? fallback(traits) : text;
  return { backstory };
}
