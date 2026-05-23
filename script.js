let botInterval = null;
let countdownInterval = null;
let countdown = 60;

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  msg.rate = 0.9;
  speechSynthesis.speak(msg);
}

function randomMarketData() {
  return {
    trend: Math.random() > 0.5 ? "UP" : "DOWN",
    rsi: Math.floor(Math.random() * 100),
    candle: Math.floor(Math.random() * 100),
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
    score += 30;
    reasons.push("Strong candle");
  }

  if (data.fakeSignal) {
    score -= 40;
    reasons.push("Fake signal risk");
  }

  score = Math.max(0, Math.min(score, 100));

  if (score < 75) {
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

  signal.className = "";

  if (result.direction === "BUY") {
    signal.classList.add("buy");
    speak("Buy signal detected. Expiry one minute.");
  } else if (result.direction === "SELL") {
    signal.classList.add("sell");
    speak("Sell signal detected. Expiry one minute.");
  } else {
    signal.classList.add("wait");
  }

  signal.innerText = result.direction;
  confidence.innerText = `Confidence: ${result.score}%`;
  reason.innerText = result.reason || "No clean setup";

  log.innerHTML =
    `[${new Date().toLocaleTimeString()}] ${result.direction} - ${result.score}%<br>` +
    log.innerHTML;
}

function runBot() {
  const data = randomMarketData();
  const result = calculateSignal(data);
  updateUI(result);
  countdown = 60;
}

function startTimer() {
  countdown = 60;
  document.getElementById("timer").innerText = countdown;

  countdownInterval = setInterval(() => {
    countdown--;
    document.getElementById("timer").innerText = countdown;

    if (countdown <= 0) {
      countdown = 60;
    }
  }, 1000);
}

function startBot() {
  if (botInterval) return;

  speak("Voice signal app started.");
  runBot();

  botInterval = setInterval(runBot, 60000);
  startTimer();
}

function stopBot() {
  clearInterval(botInterval);
  clearInterval(countdownInterval);

  botInterval = null;
  countdownInterval = null;

  speak("Voice signal app stopped.");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}