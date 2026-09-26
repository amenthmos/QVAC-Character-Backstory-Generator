# QVAC Character Backstory Generator

Enter a character's basic traits or role (e.g. "grumpy retired detective, now runs a bakery") and an on-device AI writes a short, grounded backstory paragraph that actually uses those specific traits. No cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:30004

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown. A grounding check confirms the traits you typed (or close variants) actually appear in the backstory, falling back to a template built from your literal traits if the model drifts away from them.

The first run downloads the model file, so it may take a minute before "Model ready." prints; after that `loadModel()` reuses the cached weights and startup is fast.

## Example

**Input**

- Traits/role: `washed-up rock star turned high school music teacher`

**Output**

> He spent his twenties opening for bands that ended up famous while his own career quietly stalled out, and by thirty he'd traded the tour bus for a classroom full of kids who barely knew what a cassette tape was. He teaches music now because it's the only thing that still feels honest, even if the paycheck and the applause are both a fraction of what they used to be. Every so often a student writes a riff that reminds him why he ever picked up a guitar in the first place, and on those days the washed-up feeling fades a little.

`logic.js` pulls the meaningful keywords out of the traits you typed and checks that at least one of them (or a close stem, like "detective" matching "detected") actually shows up in the generated backstory. If the model ignores your traits and writes something generic, it falls back to a template built directly from your literal input instead.

## Setup notes

- Requires Node.js >=22.17 (see `engines` in `package.json`).
- `npm start` runs `src/gui.js`, which starts the local HTTP server on port `30004` by default. Set the `PORT` environment variable to use a different port.
- No API keys, accounts, or network access are needed — everything, including the model weights, stays on your machine.

## License

MIT
