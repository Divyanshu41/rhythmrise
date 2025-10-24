// RhythmRise - simple web piano using Web Audio API
(function(){
  const pianoEl = document.getElementById('piano');
  const nowPlayingEl = document.getElementById('nowPlaying');
  const instrumentEl = document.getElementById('instrument');
  const volumeEl = document.getElementById('volume');
  const octDown = document.getElementById('oct-down');
  const octUp = document.getElementById('oct-up');
  const octaveDisplay = document.getElementById('octave-display');
  const recordBtn = document.getElementById('record');
  const playbackBtn = document.getElementById('playback');
  const clearBtn = document.getElementById('clear');

  const canvas = document.getElementById('viz');
  const ctx = canvas.getContext('2d');

  // Audio setup
  const AudioC = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let masterGain, analyser;

  function ensureAudio(){
    if(!audioCtx){
      audioCtx = new AudioC();
      masterGain = audioCtx.createGain();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      masterGain.gain.value = parseFloat(volumeEl.value);
      masterGain.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
  }

  // Note utilities
  function midiToFreq(m){ return 440 * Math.pow(2,(m-69)/12); }

  // layout: generate two octaves of keys (C..B)
  const keyTemplate = [
    {name:'C', black:false},
    {name:'C#', black:true},
    {name:'D', black:false},
    {name:'D#', black:true},
    {name:'E', black:false},
    {name:'F', black:false},
    {name:'F#', black:true},
    {name:'G', black:false},
    {name:'G#', black:true},
    {name:'A', black:false},
    {name:'A#', black:true},
    {name:'B', black:false}
  ];

  let baseOctave = 4; // displayed octave for middle C
  octaveDisplay.textContent = `Octave: ${baseOctave}`;

  // Build keys for 2 octaves
  const keys = [];
  const octavesToShow = 2;
  const startMidi = 12 * (baseOctave) ; // C of baseOctave
  let midiStart = 60; // middle C default (C4)

  function buildKeys(){
    pianoEl.innerHTML = '';
    keys.length = 0;
    const startC = 12*(baseOctave) ;
    let midi = 12*(baseOctave) ;
    // we'll produce white-container then overlay blacks via absolute positioning using order
    for(let o=0;o<octavesToShow;o++){
      for(let i=0;i<12;i++){
        const t = keyTemplate[i];
        const midiNum = midi + i + o*12;
        const key = document.createElement('div');
        key.className = 'key '+(t.black? 'black':'white');
        key.dataset.midi = midiNum;
        key.dataset.name = `${t.name}${baseOctave + o}`;
        key.innerHTML = `<div class="label">${t.name}${baseOctave + o}</div>`;
        pianoEl.appendChild(key);
        keys.push({el:key,midi:midiNum,name:t.name+ (baseOctave + o),black:t.black});
      }
    }
    // Reorder whites visually (simple approach): set display flex; black keys overlap due to negative margins in CSS
    attachKeyEvents();
  }

  // ===== audio note engine =====

  function startNote(midi){
    ensureAudio();
    const type = instrumentEl.value || 'sine';
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    o.type = type;
    o.frequency.value = midiToFreq(midi);
    const g = audioCtx.createGain();
    // simple piano-like envelope
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(1.0, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    o.connect(g);
    g.connect(masterGain);
    o.start(now);
    // stop automatically after 2s
    const stopAt = now + 2.2;
    o.stop(stopAt);
    // cleanup after stop
    setTimeout(()=>{
      try{ o.disconnect(); g.disconnect(); }catch(e){}
      updateKeyVisual(midi,false);
    }, (stopAt - now)*1000 + 50);
    updateKeyVisual(midi,true);
  }

  function updateKeyVisual(midi, on){
    const k = keys.find(x=>Number(x.midi)===Number(midi));
    if(k){
      if(on) k.el.classList.add('active'); else k.el.classList.remove('active');
      nowPlayingEl.textContent = on? `Now: ${k.name}` : 'Now: —';
    }
  }

  // ===== events =====
  function attachKeyEvents(){
    keys.forEach(k=>{
      k.el.addEventListener('mousedown', (ev)=>{
        ev.preventDefault();
        ensureAudio(); audioCtx.resume();
        startNote(k.midi);
      });
    });
  }

  // controls
  volumeEl.addEventListener('input', ()=>{ if(masterGain) masterGain.gain.value = parseFloat(volumeEl.value); });
  octDown.addEventListener('click', ()=>{ baseOctave = Math.max(1, baseOctave-1); octaveDisplay.textContent = `Octave: ${baseOctave}`; buildKeys(); });
  octUp.addEventListener('click', ()=>{ baseOctave = Math.min(7, baseOctave+1); octaveDisplay.textContent = `Octave: ${baseOctave}`; buildKeys(); });

  // init
  buildKeys();
})();