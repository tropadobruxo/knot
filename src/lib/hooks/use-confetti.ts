import confetti from "canvas-confetti";

export function fireMatchConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ["#8b5cf6", "#ec4899", "#f59e0b"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ["#8b5cf6", "#ec4899", "#f59e0b"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  }

  frame();
}

export function fireSuperLikeConfetti() {
  confetti({
    particleCount: 30,
    spread: 70,
    startVelocity: 25,
    origin: { y: 0.8 },
    colors: ["#f59e0b", "#fbbf24", "#fcd34d"],
    shapes: ["star"],
  });
}

export function fireLikeConfetti() {
  confetti({
    particleCount: 12,
    spread: 40,
    startVelocity: 20,
    origin: { y: 0.7 },
    colors: ["#8b5cf6", "#ec4899"],
    gravity: 1.2,
    ticks: 80,
  });
}
