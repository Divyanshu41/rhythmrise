# RhythmRise — Simple Web Piano

Small demo web piano built with HTML/CSS/JS using the Web Audio API. It demonstrates:

- Mouse + keyboard input to play notes
- Visual feedback for pressed keys
- Instrument selection (basic oscillator types)
- Volume and octave controls
- Simple record/playback of performed notes
- Visualizer using AnalyserNode

## How to use
1. Open `index.html` in a modern browser (Chrome/Edge/Firefox).
2. Click keys or use keyboard mapping (try `A W S E D R F T G Y H U` sequence to play notes).
3. Choose instrument and adjust volume.
4. Click `Record`, play something, then `Stop Rec`. Click `Play` to hear playback.

## Notes & next improvements
- This uses synthesized tones (oscillators) for simplicity. You can swap to sampled piano sounds or SoundFont.
- Improve keyboard mapping and mobile touch handling.
- Add multiple octaves viewport, sustain pedal, and better ADSR for realism.