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

## License

MIT
