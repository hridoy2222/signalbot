let botInterval = null;
let countdownInterval = null;
let countdown = 60;

function getSelectedPair() {
  const pairSelect = document.getElementById("pairSelect");
  const otcMode = document.getElementById("otcMode");

  const pair = pairSelect ? pairSelect.value : "EUR/USD";
  const otc = otcMode ? otcMode.checked : true;

  return otc ? `${pair} OTC` : pair;
}

function updatePairName() {
  const pairName = document.getElementById("pairName");
  if (pairName) {
    pairName.innerText = getSelectedPair();
  }
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  msg.rate = 0.9;
  msg.pitch = 1;

  window.speechSynthesis.speak(msg);
}

function randomMarketData() {
  return {
    trend: Math.random() > 0.5 ? "UP" : "DOWN",
    rsi: Math.floor(Math.random() * 100),
    candle: Math.floor(Math.random() * 100),
    volatility: Math.floor(Math.random() * 100),
    fakeSignal: Math.random() < 0.25
  };
}

function calculateSignal(data) {
  let score = 0;
  let direction = "NO TRADE";
  let reasons = [];

  if (data.trend === "UP") {
    direction = "BUY";
    score += 30;
    reasons.push("Trend UP");
  } else {
    direction = "SELL";
    score += 30;
    reasons.push("Trend DOWN");
  }

  if (direction === "BUY" && data.rsi > 50 && data.rsi < 70) {
    score += 25;
    reasons.push("RSI BUY zone");
  }

  if (direction === "SELL" && data.rsi < 50 && data.rsi > 30) {
    score += 25;
    reasons.push("RSI SELL zone");
  }

  if (data.candle > 65) {
    score += 25;
    reasons.push("Strong candle");
  }

  if (data.volatility > 35 && data.volatility < 80) {
    score += 20;
    reasons.push("Good volatility");
  }

  if (data.fakeSignal) {
    score -= 40;
    reasons.push("Fake signal risk");
  }

  score = Math.max(0, Math.min(score, 100));

  if (score < 78) {
    direction = "NO TRADE";
  }

  return {
    direction,
    score,
    reason: reasons.join(", ")
  };
}

function updateUI(result) {
  const signal = document.getElementById("signal");
  const confidence = document.getElementById("confidence");
  const reason = document.getElementById("reason");
  const log = document.getElementById("log");

  const pair = getSelectedPair();

  if (!signal || !confidence || !reason || !log) return;

  signal.className = "";

  if (result.direction === "BUY") {
    signal.classList.add("buy");
    speak(`${pair}. Buy signal detected. Expiry one minute. Confidence ${result.score} percent.`);
  } else if (result.direction === "SELL") {
    signal.classList.add("sell");
    speak(`${pair}. Sell signal detected. Expiry one minute. Confidence ${result.score} percent.`);
  } else {
    signal.classList.add("wait");
  }

  signal.innerText = result.direction;
  confidence.innerText = `Confidence: ${result.score}%`;
  reason.innerText = result.reason || "No clean setup";

  log.innerHTML =
    `[${new Date().toLocaleTimeString()}] ${pair} → ${result.direction} - ${result.score}%<br>` +
    log.innerHTML;
}

function runBot() {
  updatePairName();

  const data = randomMarketData();
  const result = calculateSignal(data);

  updateUI(result);
  countdown = 60;
}

function startTimer() {
  clearInterval(countdownInterval);

  countdown = 60;

  const timer = document.getElementById("timer");
  if (timer) timer.innerText = countdown;

  countdownInterval = setInterval(() => {
    countdown--;

    const timer = document.getElementById("timer");
    if (timer) timer.innerText = countdown;

    if (countdown <= 0) {
      countdown = 60;
    }
  }, 1000);
}

function startBot() {
  if (botInterval) return;

  updatePairName();
  speak("Quantum voice signal app started.");

  runBot();

  botInterval = setInterval(runBot, 60000);
  startTimer();
}

function stopBot() {
  clearInterval(botInterval);
  clearInterval(countdownInterval);

  botInterval = null;
  countdownInterval = null;

  speak("Quantum voice signal app stopped.");
}

document.addEventListener("DOMContentLoaded", () => {
  updatePairName();

  const pairSelect = document.getElementById("pairSelect");
  const otcMode = document.getElementById("otcMode");

  if (pairSelect) {
    pairSelect.addEventListener("change", updatePairName);
  }

  if (otcMode) {
    otcMode.addEventListener("change", updatePairName);
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}