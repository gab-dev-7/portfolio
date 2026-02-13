const container = document.documentElement;
const throttleDelay = 50;
const scrollSpeedSensitivity = 1.6;

let isDragging = false;
let startY!: number;
let scrollTop!: number;
let lastY!: number;

function throttle(func: Function, delay: number) {
  let lastCall = 0;

  return function (...args: unknown[]) {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    return func(...args);
  };
}

container.addEventListener("mousedown", (e: MouseEvent) => {
  // Prevent dragging if clicking on interactive elements
  if (
    (e.target as HTMLElement).tagName === "A" ||
    (e.target as HTMLElement).tagName === "BUTTON" ||
    (e.target as HTMLElement).closest("a") ||
    (e.target as HTMLElement).closest("button")
  )
    return;

  isDragging = true;
  startY = e.pageY;
  lastY = e.pageY;
  scrollTop = container.scrollTop;
  container.style.cursor = "grabbing";
});

container.addEventListener(
  "mousemove",
  throttle((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    lastY = e.pageY;
    requestAnimationFrame(() => {
      const deltaY = lastY - startY;
      container.scrollTop = scrollTop - deltaY * scrollSpeedSensitivity;
    });
  }, throttleDelay),
);

container.addEventListener("mouseup", () => {
  isDragging = false;
  container.style.cursor = "auto"; // Reset to auto
});

container.addEventListener("mouseleave", () => {
  if (isDragging) {
    isDragging = false;
    container.style.cursor = "auto"; // Reset to auto
  }
});

container.style.scrollBehavior = "smooth";
container.style.cursor = "auto"; // Force auto on load

// --- Easter Egg: Developer Console Message ---
const consoleStyle1 = "color: #00f0ff; font-size: 18px; font-weight: bold;";
const consoleStyle2 = "color: #e0e6ed; font-size: 14px;";
console.log("%cLooking for a developer?", consoleStyle1);
console.log("%cI'm available for hire. You can find my CV at https://gabriel-windlin.ch/cv.pdf", consoleStyle2);

// --- Easter Egg: Konami Code ---
import { launchConfetti } from './confetti';

const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

function triggerKonamiEffect() {
  const profilePic = document.querySelector('.profile-picture');
  if (profilePic) {
    profilePic.classList.add('konami-spin');
    setTimeout(() => {
      profilePic.classList.remove('konami-spin');
    }, 1000); // Animation duration is 1s
  }
  launchConfetti();
}

document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      triggerKonamiEffect();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

// --- Easter Egg: Matrix Effect ---
import { startMatrixEffect, stopMatrixEffect } from './matrix';

let matrixActive = false;
document.addEventListener('ninjakeys-matrix', () => {
  if (matrixActive) {
    stopMatrixEffect();
    matrixActive = false;
  } else {
    startMatrixEffect();
    matrixActive = true;
  }
});

import { decryptAnimation } from './animations';

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      const h2 = entry.target.querySelector('h2');
      if (h2) {
        decryptAnimation(h2);
      }
    }
  });
});

const sections = document.querySelectorAll('section');
sections.forEach((section) => {
  observer.observe(section);
});
