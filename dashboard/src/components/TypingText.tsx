import { useEffect, useState } from "react";

export function TypingText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    setVisible("");
    let index = 0;
    const timer = window.setInterval(() => {
      setVisible(text.slice(0, index + 1));
      index += 1;
      if (index >= text.length) window.clearInterval(timer);
    }, speed);
    return () => window.clearInterval(timer);
  }, [speed, text]);

  return (
    <span>
      {visible}
      <span className="animate-pulse text-sky-300">|</span>
    </span>
  );
}
