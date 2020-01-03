window.onload = function () {
  let audio,
    analyser,
    audioCtx,
    canvas,
    gradient,
    source,
    bufferLength,
    freqArray,
    stream;

  let display = "star";
  let audioInput = document.getElementById('audiofile');
  let sample = document.getElementsByClassName('sample')[0];

  audioInput.addEventListener('change', function (event) {
    if (!audioCtx || audioCtx.state !== "running") {
      stream = URL.createObjectURL(event.target.files[0]);
      audio = new Audio(stream);
      setupAudio();
    }
  });

  sample.addEventListener('click', function () {
    // audio = new Audio('https://s3.us-east-2.amazonaws.com/sparkify2019/whatsgoing/1.mp3');
    audio = new Audio('gagging_order.mp3');
    // audio.crossOrigin = "anonymous";
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
  document.getElementsByClassName('play')[0].addEventListener('click', playSound.bind(null, source));
  document.getElementsByClassName('stop')[0].addEventListener('click', stopSound);

  function playSound() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
  }

  function stopSound() {
    if (audioCtx) {
      if (audioCtx.state === 'running') {
        audioCtx.suspend();
      }
    }
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

      let r = barHeight + (25 * (i / bufferLength));
      let g = 250 * (i / bufferLength);
      let b = 50;

      ctx.fillStyle = "rgb(" + freqArray[i] + ", " + freqArray[i] + ", " + 205 + ")";
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
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
    }

    requestAnimationFrame(animate);
  }

  let options = document.getElementsByClassName('options-header')[0];

  options.addEventListener("click", function () {
    let accordion = document.getElementsByClassName('options-list')[0];
    accordion.classList.toggle("hiding");
  })

  let barGraphButton = document.getElementById('barGraph');
  let starButton = document.getElementById('star');

  barGraphButton.addEventListener("click", function () {
    display = "barGraph";
  });

  starButton.addEventListener("click", function () {
    display = "star";
  })
  // let question = document.getElementsByClassName('help')[0];
  // let closeButton = document.getElementsByClassName('close')[0];
  // let modal = document.getElementsByClassName('modal')[0];

  // closeButton.addEventListener("click", function () {
  //   modal.classList.add("closed");
  // })

  // question.addEventListener("click", function () {
  //   modal.classList.remove("closed");
  // })
};