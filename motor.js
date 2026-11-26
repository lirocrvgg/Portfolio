(() => {
  const canvas = document.querySelector('#motor-view');
  const ctx = canvas.getContext('2d');
  const button = document.querySelector('#motor-play');
  const blue = '#002fa7';
  const phases = [
    { name: 'R', color: blue },
    { name: 'S', color: '#167875' },
    { name: 'T', color: '#af492b' }
  ];
  const tau = 2 * Math.PI;
  const center = { x: 134, y: 130 };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !reduced.matches;
  let visible = false;
  const count = 175;
  const step = 1 / 60;
  const frequency = tau / ((count - 1) * step);
  const history = phases.map((_, phase) => Float64Array.from(
    {length: count}, (_, i) => Math.cos((i - count + 1) * step * frequency - phase * tau / 3)
  ));
  let head = count - 1;
  let elapsed = 0;
  let remainder = 0;
  let fieldAngle = 0;
  let fieldStrength = 1.5;
  let rotorAngle = 0;
  let rotorSpeed = frequency * .93;
  const levels = [0, 0, 0];

  function advance() {
    elapsed += step;
    head = (head + 1) % count;
    let horizontal = 0, vertical = 0;
    phases.forEach((_, i) => {
      const axis = i * tau / 3;
      const target = pointer?.phase === i ? pointer.intensity : 0;
      levels[i] += (target - levels[i]) * .17;
      const noise = .34 * Math.sin(17 * elapsed + axis) + .19 * Math.sin(43 * elapsed - axis);
      const current = Math.cos(elapsed * frequency - axis) + levels[i] * noise;
      history[i][head] = current;
      horizontal += current * Math.cos(axis);
      vertical += current * Math.sin(axis);
    });
    const direction = Math.atan2(vertical, horizontal);
    const delta = direction - fieldAngle;
    const fieldSpeed = Math.atan2(Math.sin(delta), Math.cos(delta)) / step;
    fieldStrength = Math.hypot(horizontal, vertical);
    fieldAngle = direction;
    // Modelo didático de inércia, acoplamento ao campo e atrito viscoso.
    const coupling = 7 * (fieldStrength / 1.5) ** 2;
    rotorSpeed += step * (coupling * (fieldSpeed - rotorSpeed) - (7 * .07 / .93) * rotorSpeed);
    rotorAngle += rotorSpeed * step;
  }
  let previous = 0;
  let frame = 0;
  let pointer = null;

  function circle(x, y, radius, fill, stroke) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, tau);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }
  function line(x, y, endX, endY, color, width = 1) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  function label(value, x, y, color = blue) {
    ctx.fillStyle = color;
    ctx.font = 'bold 13px Consolas, monospace';
    ctx.fillText(value, x, y);
  }
  function motor() {
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.lineWidth = 2;
    circle(0, 0, 106, '#dbe3f3', blue);
    circle(0, 0, 97, '#b1bfda', blue);
    for (let i = 0; i < 36; i++) {
      ctx.save();
      ctx.rotate(i * tau / 36);
      ctx.fillStyle = '#687da5';
      ctx.fillRect(69, -2, 24, 4);
      ctx.restore();
    }
    circle(0, 0, 66, '#f3f6fd', blue);
    circle(0, 0, 57, '#c1cde3', '#506488');
    ctx.save();
    ctx.rotate(-rotorAngle);
    for (let i = 0; i < 18; i++) {
      ctx.rotate(tau / 18);
      circle(48, 0, 3, '#536886');
    }
    circle(0, 0, 14, '#fff', blue);
    line(3, 0, 13, 0, blue, 3);
    ctx.restore();
    phases.forEach(({name, color}, i) => {
      const axis = i * tau / 3;
      const x = Math.cos(axis), y = -Math.sin(axis);
      const current = history[i][head];
      for (const sign of [-1, 1]) {
        const px = x * 83 * sign, py = y * 83 * sign;
        circle(px, py, 12, '#fff', color);
        label(name + (sign > 0 ? '+' : '−'), px - 8, py + 4, color);
      }
      line(0, 0, 44 * current * x, 44 * current * y, color, 3);
    });
    ctx.rotate(-fieldAngle);
    const tip = 44 * fieldStrength;
    line(0, 0, tip - 4, 0, '#111827', 3);
    ctx.fillStyle = '#111827';
    ctx.beginPath(); ctx.moveTo(tip, 0); ctx.lineTo(tip - 10, -5); ctx.lineTo(tip - 10, 5); ctx.fill();
    ctx.restore();
  }
  function traces() {
    const dark = document.documentElement.dataset.tema === 'escuro';
    const legend = dark ? '#e5eafb' : '#111827';
    label('CORRENTES DE FASE', 268, 40, dark ? '#a5baff' : blue);
    phases.forEach(({name, color: baseColor}, i) => {
      const color = dark ? ['#8facff', '#66d6be', '#ffac89'][i] : baseColor;
      const y = 78 + i * 55;
      label(name, 270, y + 4, color);
      line(292, y, 467, y, '#a2aec7');
      ctx.beginPath();
      for (let x = 0; x <= 174; x++) {
        const sample = history[i][(head + 1 + x) % count];
        const py = y - 17 * sample;
        if (x === 0) ctx.moveTo(292, py);
        else ctx.lineTo(292 + x, py);
      }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      circle(466, y - 17 * history[i][head], 3, color);
    });
    line(271, 234, 286, 234, legend, 3);
    label('Campo resultante', 293, 239, legend);
  }
  function draw() {
    ctx.setTransform(canvas.width/480, 0, 0, canvas.height/270, 0, 0);
    ctx.clearRect(0, 0, 480, 270);
    motor();
    traces();

  }
  function animate(now) {
    frame = 0;
    if (previous) remainder += Math.min(now - previous, 80) / 1000;
    while (remainder >= step) {
      advance();
      remainder -= step;
    }
    previous = now;
    draw();
    schedule();
  }
  function schedule() {
    if (playing && visible && !document.hidden) {
      if (!frame) frame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame);
      frame = previous = 0;
    }
    button.textContent = playing ? 'Pausar' : 'Animar';
  }
  document.addEventListener('mudanca-de-tema', draw);
  button.onclick = () => { playing = !playing; schedule(); };
  reduced.onchange = () => { playing = !reduced.matches; schedule(); draw(); };
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(canvas);
  new ResizeObserver(() => {
    const w = Math.max(1, Math.round(canvas.clientWidth * Math.min(devicePixelRatio, 2)));
    canvas.width = w; canvas.height = Math.round(w * 270/480);
    draw();
  }).observe(canvas);
  function interact(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * 480 / rect.width;
    const y = (event.clientY - rect.top) * 270 / rect.height;
    const phase = Math.round((y - 78) / 55);
    pointer = x >= 265 && x <= 473 && phase >= 0 && phase < 3
      ? { phase, intensity: .45 + .55 * Math.min(1, (x - 265) / 201) }
      : null;
    draw();
  }
  function release() { pointer = null; draw(); }
  canvas.onpointermove = canvas.onpointerdown = interact;
  canvas.onpointerleave = canvas.onpointercancel = release;
  canvas.onpointerup = event => { if (event.pointerType !== 'mouse') release(); };
  schedule();
})();
