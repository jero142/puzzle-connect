import React, { useEffect } from 'react';

const BubbleBackground = () => {

  useEffect(() => {
    const container = document.querySelector('.bubble-background');

    const bubbleMaker = () => {
      const bubble = document.createElement("span");
      bubble.classList.add("bubble");

      const size = Math.random() * 200 + 100 + "px";
      bubble.style.width = size;
      bubble.style.height = size;

      // Constrain within container height
      bubble.style.bottom = '-100px'; // start off-screen bottom
      bubble.style.left = Math.random() * 100 + "%";

      const plusMinus = Math.random() > 0.5 ? 1 : -1;
      bubble.style.setProperty('--left', Math.random() * 100 * plusMinus + "%");

      container.appendChild(bubble);

      setTimeout(() => {
        bubble.remove();
      }, 8000);
    };

    const interval = setInterval(bubbleMaker, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bubble-background" />
  );
};

export default BubbleBackground;