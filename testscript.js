window.onload = function () {
  let audio,
    analyser,
    audioCtx,
    canvas,
    gradient,
    node,
    source,
    bufferLength,
    freqArray,
    stream;

  let audioInput = document.getElementById('audiofile');
  let sample = document.getElementsByClassName('sample')[0];
  let display = "star";

  const error = function () {
    console.log(arguments)
  }

  canvas = document.getElementById('canvas'),
    width = canvas.width = window.innerWidth,
    height = canvas.height = window.innerHeight,
    ctx = canvas.getContext('2d');

  gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(35, 7, 77, 1)");
  gradient.addColorStop(1, "rgba(0, 100, 0, 1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  audioInput.addEventListener('change', function (event) {
    pauseSound();
    stream = URL.createObjectURL(event.target.files[0]);
    audio = new Audio(stream);
    setupAudio();
  });

  sample.addEventListener('click', function () {
    pauseSound();
    audio = new Audio('delight.mp3');
    setupAudio();
  });

  function setupAudio() {
    audio.addEventListener('canplay', function () {
      audioCtx = new AudioContext();
      analyser = audioCtx.createAnalyser();
      analyser.smoothingTimeConstant = 0.1;
      analyser.fftSize = 512;
      source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      audio.play();
      animate();
    });
  }

  function setupStream(stream) {
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.smoothingTimeConstant = 0.2;
    analyser.fftSize = 1024;
    node = audioCtx.createScriptProcessor(1024, 1, 1);
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.connect(node);
    analyser.connect(audioCtx.destination);
    animate();
  }

  function drawStar(ctx, freqArray, analyser, width, height) {
    let centerX = width / 2,
      centerY = height / 2,
      radius = 150,
      bars = 170,
      barWidth = 2,
      barHeight;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    analyser.getByteFrequencyData(freqArray);

    for (let i = 0; i < bars; i++) {
      let rads = Math.PI * 2 / bars;
      let lineColor = "rgb(" + freqArray[i] + ", " + freqArray[i] + ", " + 205 + ")";
      barHeight = freqArray[i] * 0.7;

      x = centerX + Math.cos(rads * i) * (radius);
      y = centerY + Math.sin(rads * i) * (radius);
      xEnd = centerX + Math.cos(rads * i) * (radius + barHeight);
      yEnd = centerY + Math.sin(rads * i) * (radius + barHeight);

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = barWidth;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(xEnd, yEnd);
      ctx.stroke();
    }
  }

  function drawBarGraph(ctx, freqArray, bufferLength, analyser, width, height) {
    let barWidth = (width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    analyser.getByteFrequencyData(freqArray);

    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < bufferLength; i++) {
      barHeight = freqArray[i] * 1.5;

      ctx.fillStyle = "rgb(" + freqArray[i] + ", " + freqArray[i] + ", " + 205 + ")";
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  function drawWaves(ctx, freqArray, bufferLength, analyser, width, height) {
    analyser.getByteFrequencyData(freqArray);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0, 0, 205)";

    ctx.beginPath();
    let sliceWidth = width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {

      let v = freqArray[i] / 86.0;
      let y = v * 200 / 2;

      if (i === 0) {
        ctx.moveTo(x, (y + height / 2));
      } else {
        ctx.lineTo(x, (y + height / 2));
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(35, 7, 77, 1)");
    gradient.addColorStop(1, "rgba(0, 100, 0, 1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    bufferLength = analyser.frequencyBinCount;
    freqArray = new Uint8Array(bufferLength);

    if (display === "star") {
      drawStar(ctx, freqArray, analyser, width, height);
    } else if (display === "barGraph") {
      drawBarGraph(ctx, freqArray, bufferLength, analyser, width, height);
    } else if (display === "waves") {
      drawWaves(ctx, freqArray, bufferLength, analyser, width, height);
    }

    requestAnimationFrame(animate);
  }

  document.getElementsByClassName('play')[0].addEventListener('click', playSound.bind(null, source));
  document.getElementsByClassName('pause')[0].addEventListener('click', pauseSound);
  document.getElementById('something').addEventListener('click', toggleMic);
 

  function playSound() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
  }

  function pauseSound() {
    if (audioCtx) {
      if (audioCtx.state === 'running') {
        audioCtx.suspend();
      }
    }
  }

  function toggleMic() {
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend();
    } else if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    } 
    
    if (!audioCtx || audioCtx.state === 'suspended') {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      navigator.getUserMedia({ audio: true }, setupStream, error);
    } 
    
  }

  let barGraphButton = document.getElementById('barGraph');
  let starButton = document.getElementById('star');
  let wavesButton = document.getElementById('waves');
  let about = document.getElementsByClassName('about')[0];
  let closeButton = document.getElementsByClassName('close')[0];
  let modal = document.getElementsByClassName('modal')[0];

  barGraphButton.addEventListener("click", function () {
    display = "barGraph";
  });

  starButton.addEventListener("click", function () {
    display = "star";
  })

  wavesButton.addEventListener("click", function () {
    display = "waves";
  })

  closeButton.addEventListener("click", function () {
    modal.classList.add("closed");
  })

  about.addEventListener("click", function () {
    modal.classList.remove("closed");
  })
};