import gsap from "gsap";

export function decryptAnimation(element: HTMLElement) {
  const originalText = element.dataset.text || element.innerText;
  element.dataset.text = originalText;
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  
  let iteration = 0;
  const interval = setInterval(() => {
    element.innerText = originalText
      .split("")
      .map((letter, index) => {
        if(index < iteration) {
          return originalText[index];
        }
        if (letter === " ") {
            return " ";
        }
        return chars[Math.floor(Math.random() * chars.length)]
      })
      .join("");
    if(iteration >= originalText.length){
      clearInterval(interval);
    }
    iteration += 1 / 2;
  }, 40);
}
