// Regalo Oscar
// Hecho con amor (y con un poquito de ayuda de la IA) por Anagallia

let screen = 0;
// 0 = intro
// 1 = level
// 2 = success screen
// 99 = final message

let currentLevel = 0;

let cnv;                 // canvas DOM element
let finalDiv;            // contenedor con scroll para el mensaje final
let lastFinalHtml = "";  // para no resetear scroll cada frame

// Responsive layout
let margin = 120;
let topMargin = 150;
let baseFontSize = 20;

// Input + errors
let typed = "";
let errorMsg = "";
let errorTimer = 0;

// Typewriter
let twFull = "";
let twCount = 0;
let twDelay = 2; // bigger = slower
let twFrameCounter = 0;

// Success message
let currentSuccessMessage = "";

// Hint reveal + fade
let hintRevealed = false;
let hintAlpha = 0;
let hintBtnW = 220;
let hintBtnH = 45;

// Continue button
let contBtnW = 220;
let contBtnH = 50;

// Panel
let panelX, panelY, panelW, panelH;

// LEVEL DATA
const questions = [
  "¿Quién te enseñó el primer truco con el que empezaste a conquistarme?",
  "¿Qué fue lo primero que tuvimos que mantener en equilibrio entre nosotros?",
  '¿Qué dices que soy cuando hago "hmm"?',
  "¿Qué canción cantaste borracho e hizo que me enamoraras más?",
  '¿Qué "vehículo" tuyo me encanta?',
  "Si pudieras describir cuánto te amo en una palabra, ¿cuál sería?",
  "¿Qué es lo único que no me gusta de ti?"
];

const hints = [
  "Se llama como tú",
  "Estaba entre nuestras frentes.",
  "Minecraft.",
  "Mi video favorito en el mundo.",
  "Es potente y no necesita gasolina.",
  "Cuelga de mi cuello.",
  "No debería existir entre nosotros."
];

const answers = [
  ["abuelo", "david", "abuelo david", "mi abuelo david", "mi abuelo"],
  ["globo", "bomba"],
  ["aldeano"],
  ["cali pachanguero"],
  ["terreneitor"],
  ["infinito"],
  ["distancia", "la distancia"]
];

const successMessages = [
  "¡Correcto!",
  "¡Vas muy bien amor!",
  "Esoo amor, qué listo eres",
  "¡Exacto! Ayy cómo me encanta ese video",
  "Jeje, respuesta correcta",
  "Me alegra que sepas cuánto te amo <3",
  "¡Lo lograste mi amor! Desbloqueaste un mensaje secreto:"
];

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style("position", "absolute");
  cnv.style("z-index", "0"); // canvas abajo

  textFont("monospace");
  textAlign(LEFT, TOP);

  enterIntro();

  // Div final con scroll (encima del canvas)
  finalDiv = createDiv("");
  finalDiv.style("position", "absolute");
  finalDiv.style("z-index", "10"); // arriba del canvas
  finalDiv.style("overflow-y", "scroll"); // scroll real
  finalDiv.style("-webkit-overflow-scrolling", "touch"); // iOS smooth
  finalDiv.style("white-space", "pre-wrap");
  finalDiv.style("font-family", "monospace");
  finalDiv.style("color", "#FFFFFF");
  finalDiv.style("line-height", "1.6");
  finalDiv.style("padding", "18px");
  finalDiv.style("border-radius", "14px");
  finalDiv.style("background", "rgba(8,12,12,0.92)");
  finalDiv.style("border", "1px solid rgba(0,255,0,0.45)");
  finalDiv.style("box-sizing", "border-box");
  finalDiv.style("pointer-events", "auto");
  finalDiv.hide();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  // Oculta el div en todas menos final
  if (finalDiv) {
    if (screen === 99) finalDiv.show();
    else finalDiv.hide();
  }

  // --- Responsive layout ---
  margin = max(24, width * 0.10);
  topMargin = max(70, height * 0.16);
  baseFontSize = max(16, min(width, height) * 0.024);
  textSize(baseFontSize);
  textLeading(baseFontSize * 1.6);

  // Panel dims
  panelX = margin;
  panelY = topMargin - baseFontSize * 0.6;
  panelW = width - margin * 2;
  panelH = min(height - topMargin, height * 0.72);

  updateTypewriter();

  if (screen === 0) {
    drawPanel();
    drawHeader("Reto cumpleañero");

    fill(0, 255, 0);
    text(getTypedText(), panelX + pad(), panelY + pad(), panelW - pad() * 2, panelH - pad() * 2);

    if (typeDone()) {
      fill(130);
      text("Presiona ENTER para comenzar", panelX + pad(), panelY + pad() + panelH * 0.65);
    }
    return;
  }

  if (screen === 1) {
    drawPanel();
    drawHeader(`LEVEL ${currentLevel + 1}`);

    fill(0, 255, 0);
    text(getTypedText(), panelX + pad(), panelY + pad(), panelW - pad() * 2, panelH - pad() * 2);

    if (typeDone()) {
      drawHintButton();

      if (hintRevealed) {
        hintAlpha = min(255, hintAlpha + 10);

        const hintY = hintBtnY() + hintBtnH + 20; 

        fill(180, 255, 180, hintAlpha);
        text(
          hints[currentLevel],
          panelX + pad(),
          hintY,
          panelW - pad() * 2,
          panelY + panelH - hintY
        );
      }

      drawInput();
    }
    return;
  }

  if (screen === 2) {
    drawPanel();
    drawHeader("CHECKPOINT");

    // Check mark grande
    fill(0, 255, 0);
    textSize(baseFontSize * 3.0);
    textAlign(LEFT, TOP);
    text("✓", panelX + pad(), panelY + pad());

    // Mensaje
    textSize(baseFontSize);
    textLeading(baseFontSize * 1.6);
    fill(0, 255, 0);
    text(
      currentSuccessMessage,
      panelX + pad() + baseFontSize * 3.0,
      panelY + pad() + baseFontSize * 0.6,
      panelW - pad() * 2 - baseFontSize * 3.2,
      panelH
    );

    drawContinueButton();
    return;
  }

  if (screen === 99) {
    drawPanel();
    drawHeader("MENSAJE SECRETO");

    // Posicionar el div exactamente dentro del panel
    const x = panelX + pad();
    const y = panelY + pad();
    const w = panelW - pad() * 2;
    const h = panelH - pad() * 2;

    finalDiv.position(x, y);
    finalDiv.size(w, h);
    
    // ✅ Igualar tipografía del div con la del canvas
finalDiv.style("font-size", `${baseFontSize}px`);
finalDiv.style("line-height", `${baseFontSize * 1.6}px`);

    // Mantener typewriter, pero SIN romper el scroll:
    // - solo actualiza si cambió el contenido
    // - preserva scrollTop
    const typedHtml = escapeHtml(getTypedText()).replaceAll("\n", "<br>");

    if (typedHtml !== lastFinalHtml) {
      const prevScroll = finalDiv.elt.scrollTop;
      finalDiv.html(typedHtml);
      finalDiv.elt.scrollTop = prevScroll;
      lastFinalHtml = typedHtml;
    }

    return;
  }
}

// ----------------- INPUT / NAV -----------------

function keyPressed() {
  if (screen === 0 && keyCode === ENTER && typeDone()) {
    enterLevel();
    return false;
  }

  if (screen === 1 && typeDone()) {
    if (keyCode === BACKSPACE) {
      if (typed.length > 0) typed = typed.slice(0, -1);
      return false;
    }

    if (keyCode === ENTER) {
      validateAnswer();
      return false;
    }

    if (keyCode === SHIFT || keyCode === CONTROL || keyCode === ALT) return false;

    if (typed.length < 40 && key.length === 1) {
      typed += key;
    }
  }

  return false;
}

function mousePressed() {
  if (screen === 1 && typeDone() && !hintRevealed) {
    if (overRect(hintBtnX(), hintBtnY(), hintBtnW, hintBtnH)) {
      hintRevealed = true;
      hintAlpha = 0;
    }
  }

  if (screen === 2) {
    if (overRect(contBtnX(), contBtnY(), contBtnW, contBtnH)) {
      nextStep();
    }
  }
}

// ----------------- GAME FLOW -----------------

function validateAnswer() {
  const cleaned = normalize(typed);
  const validAnswers = answers[currentLevel].map(a => normalize(a));

  if (validAnswers.includes(cleaned)) {
    currentSuccessMessage = successMessages[currentLevel];
    screen = 2;
    typed = "";
    errorMsg = "";
    errorTimer = 0;
  } else {
    errorMsg = "Ups, intenta de nuevo.";
    errorTimer = 90;
  }
}

function nextStep() {
  currentLevel++;
  if (currentLevel >= questions.length) enterFinal();
  else enterLevel();
}

function enterIntro() {
  screen = 0;
  currentLevel = 0;
  typed = "";
  hintRevealed = false;
  hintAlpha = 0;
  lastFinalHtml = "";
  twFull =
    "Hola amor\n" +
    "Como sé que te gustan los juegos, te preparé un pequeño reto de adivinanzas.\n" +
    "Sé que eres muy listo y podrás descifrarlo.\n\n" +
    "¡Te amo!";
  resetTypewriter();
}

function enterLevel() {
  screen = 1;
  typed = "";
  hintRevealed = false;
  hintAlpha = 0;
  errorMsg = "";
  errorTimer = 0;
  lastFinalHtml = "";
  twFull = questions[currentLevel];
  resetTypewriter();
}

function enterFinal() {
  screen = 99;
  lastFinalHtml = "";
  twFull =
    "¡Feliz cumpleaños, mi amor!\n\n" +
    "Como mi regalo llegó con mucha anticipación, me tocó ponerme creativa\n" +
    "para hacerte llegar algo en tu mero día también jeje.\n\n" +
    "Me habría encantado festejar este día a tu lado,\n" +
    "pero lo bonito de los cumpleaños es que se repiten cada año...\n" +
    "y yo no pienso irme de tu vida en un buen rato\n" +
    "(¿premio o castigo? tú sabrás jeje).\n\n" +
    "Me intimida mucho el código,\n" +
    "pero haciendo esto me di cuenta de que con amor\n" +
    "(y un poquito de ayuda de la IA)\n" +
    "todo se puede lograr.\n\n" +
    "Espero que este pequeño reto te haya entretenido,\n" +
    "o que al menos te haya sacado una sonrisa.\n" +
    "Con saber que hice reír a este hombre tan precioso,\n" +
    "yo me conformo.\n\n" +
    "Te deseo un año lleno de cosas bellas,\n" +
    "de experiencias nuevas,\n" +
    "de crecimiento profesional y personal,\n" +
    "y sobre todo, de muchísimo amor.\n\n" +
    "Porque de mi parte,\n" +
    "te prometo que nunca te va a faltar.\n\n" +
    "Te mando un beso y un abrazo enormes,\n" +
    "que ya pronto te daré en persona\n" +
    "(en 16 días, para ser más precisa).\n\n" +
    "Te amo.\n" +
    "Te amo.\n" +
    "Te amo.\n\n" +
    "Siempre tuya,\n" +
    "Ana.";
  resetTypewriter();
}

// ----------------- UI DRAW HELPERS -----------------

function pad() {
  return max(18, baseFontSize * 1.1);
}

function drawPanel() {
  noStroke();
  fill(8, 12, 12);
  rect(panelX, panelY, panelW, panelH, 14);

  noFill();
  stroke(0, 255, 0, 120);
  rect(panelX, panelY, panelW, panelH, 14);
  noStroke();
}

function drawHeader(title) {
  fill(0, 255, 0);
  textSize(baseFontSize * 0.95);
  textAlign(LEFT, TOP);
  text(title, panelX, panelY - baseFontSize * 1.4);
  textSize(baseFontSize);
}

function hintBtnX() {
  return panelX + pad();
}
function hintBtnY() {
  return panelY + pad() + baseFontSize * 4.2;
}

function drawHintButton() {
  const x = hintBtnX();
  const y = hintBtnY();

  const isHover = overRect(x, y, hintBtnW, hintBtnH);

  if (!hintRevealed && isHover) {
    noStroke();
    fill(0, 255, 0, 25);
    rect(x, y, hintBtnW, hintBtnH, 10);
  }

  noFill();
  stroke(0, 255, 0, hintRevealed ? 70 : (isHover ? 255 : 160));
  rect(x, y, hintBtnW, hintBtnH, 10);
  noStroke();

  fill(0, 255, 0, hintRevealed ? 120 : 255);
  textAlign(LEFT, CENTER);
  text(hintRevealed ? "Pista revelada" : "Revelar pista", x + 18, y + hintBtnH / 2);
  textAlign(LEFT, TOP);
}

function contBtnX() {
  return panelX + pad();
}
function contBtnY() {
  return panelY + pad() + baseFontSize * 5.2;
}

function drawContinueButton() {
  const x = contBtnX();
  const y = contBtnY();

  const isHover = overRect(x, y, contBtnW, contBtnH);

  if (isHover) {
    noStroke();
    fill(0, 255, 0, 25);
    rect(x, y, contBtnW, contBtnH, 10);
  }

  noFill();
  stroke(0, 255, 0, isHover ? 255 : 160);
  rect(x, y, contBtnW, contBtnH, 10);
  noStroke();

  fill(0, 255, 0);
  textAlign(LEFT, CENTER);
  text("Continuar", x + 18, y + contBtnH / 2);
  textAlign(LEFT, TOP);
}

function drawInput() {
  const x = panelX + pad();
  const yBase = hintBtnY() + hintBtnH + baseFontSize * 2.4;
  const w = panelW - pad() * 2;

  const cursor = frameCount % 60 < 30 ? "▍" : "";
  const line = "> " + typed + cursor;

  noFill();
  stroke(0, 255, 0, 180);
  rect(x, yBase, w, 55, 10);
  noStroke();

  fill(0, 255, 0);
  textAlign(LEFT, TOP);
  text(line, x + 14, yBase + 12, w - 20, 60);

  const helpY = yBase + 70;

  if (errorTimer > 0) {
    fill(255, 120, 120);
    text(errorMsg, x, helpY, w, 120);
    errorTimer--;
  } else {
    fill(130);
    text("Escribe tu respuesta y presiona ENTER. BACKSPACE para borrar.", x, helpY, w, 120);
  }
}

function overRect(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

// ----------------- TYPEWRITER -----------------

function updateTypewriter() {
  if (twCount < twFull.length) {
    twFrameCounter++;
    if (twFrameCounter >= twDelay) {
      twCount++;
      twFrameCounter = 0;
    }
  }
}

function typeDone() {
  return twCount >= twFull.length;
}

function getTypedText() {
  return twFull.substring(0, twCount);
}

function resetTypewriter() {
  twCount = 0;
  twFrameCounter = 0;
}

// ----------------- NORMALIZE -----------------

function normalize(s) {
  s = (s || "").toLowerCase().trim();

  s = s
    .replaceAll("á", "a")
    .replaceAll("é", "e")
    .replaceAll("í", "i")
    .replaceAll("ó", "o")
    .replaceAll("ú", "u")
    .replaceAll("ü", "u")
    .replaceAll("ñ", "n");

  while (s.includes("  ")) s = s.replaceAll("  ", " ");
  return s;
}

function escapeHtml(s) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
