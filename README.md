# Callout! Bingo

Classic, Party, Movie, Office and custom Bingo. A phone-and-TV single-screen game with solo CPU opponents, PeerJS room codes, and on-device Supertonic narration enabled by default.

## Playing

- **Classic Bingo** randomly draws B–I–N–G–O numbers 1–75; the host can draw manually or automatically.
- **Party / Movie / Office Bingo** never randomly draw events. Players mark moments they actually see or hear. A host can log real sightings; other players can report them.
- **Custom Bingo** can use drawn calls or watch-and-mark.
- Each player chooses **Manual**, **Highlight**, or **Auto** marking.
- A full row, column or diagonal wins one point. Winners can optionally use their microphone to shout BINGO to connected peers for **up to 10 seconds**.
- Play solo against CPUs without any server, or host on a TV/computer and have friends join from phones.

## Settings: voice, sound and timed caller

Open **⚙ Settings** on the home screen, during setup, in the lobby, or while playing. These settings are kept separate from the bingo card so the game remains on one screen.

- **Supertonic voice caller is ON by default** for the host and solo games. Choose the voice, press **Test**, or mute it in Settings. Your preference is remembered.
- **Game sound effects** (beeps) have a separate On/Off setting. Turning off beeps does not turn off the voice caller or the winner's microphone.
- **Timed caller:** For Classic Bingo (or a custom random-call game), enable it in Settings and enter **Minimum seconds** and **Maximum seconds** (3–180 seconds). For example, 10–20 seconds chooses a fresh random delay for every next call. Set both fields to 15 for exactly 15-second gaps. Use **Pause auto** or **Next call** during the game. A live countdown shows the next draw, and auto-calling waits for any in-progress Supertonic announcement to finish before advancing.
- **Party, Movie and Office Bingo** do not draw random calls; the timer is unavailable for observation games.
- **Classic numbers** are read as complete words (for example, "Bee, number seven") when drawn.
- Party, Movie and Office sightings are read aloud **only when players log a moment that actually happened**. No artificial events or random turns.
- The **host or solo device** generates all speech locally with Supertonic 3 (WebGPU, with WASM fallback). It does not broadcast synthesized audio to peers; it plays through the host/solo device speakers. The winner's 10-second microphone feature is separate.
- First use downloads roughly **400 MB** of ONNX weights from the [archived model](https://huggingface.co/supertone-oss-archive/supertonic-3). Do not expect instant loading or offline startup before the downloads are cached. Text is never sent to a voice-generation API.
- If the model fails to load, **Bingo remains playable**. Browser audio-autoplay policies may require tapping **Test** in Settings. Supertonic automatically attempts to initialize when you start hosting or solo play; it can take a while the first time.

## GitHub Pages

1. In repository **Settings → Pages**, choose **Deploy from branch**, **main**, **/(root)**, then Save.
2. Open **https://tbenitz.github.io/callout-bingo/** after GitHub Pages is published.
3. For multiplayer, keep the host tab open. HTTPS enables microphone permissions. PeerJS uses a public signaling service; highly restrictive NAT/firewalls may need TURN.

No Node build step is required. Files in the site root: `index.html`, `voice.js`, `supertonic-helper.js`.

## License / attribution

The browser TTS inference helper is adapted from the [archived Supertonic Web example](https://github.com/supertone-oss-archive/supertonic/tree/main/web) (MIT license), not authored from scratch. The Supertonic weights are downloaded from the separate Hugging Face archive and governed by their own [model license](https://huggingface.co/supertone-oss-archive/supertonic-3/blob/main/LICENSE). ONNX Runtime Web is MIT-licensed.

## Testing

Game actions, caller/sighting event routing, settings toggles, randomized auto-calling, voice-panel wiring, syntax, and single-screen mobile/landscape layouts were checked with simulated voice events in Chromium. **Full Supertonic 3 model inference/audio playback and cross-device microphone audio have not been verified on a live device** in this environment.
