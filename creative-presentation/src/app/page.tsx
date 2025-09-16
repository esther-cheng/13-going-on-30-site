"use client";
import { useState } from "react";
import styles from "./styles.module.css";

export default function Home() {
  const [goals, setGoals] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number; explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Convert raw text from editable div → array of trimmed lines
  const parseText = (text: string) => {
    return text
      .split("\n")
      .map((line) => line.trim().replace(/^•\s*/, "")) // Remove bullet points
      .filter((line) => line.length > 0);
  };

  const handleGoalsChange = (e: React.FormEvent<HTMLDivElement>) => {
    setGoals(parseText(e.currentTarget.innerText));
  };

  const handleValuesChange = (e: React.FormEvent<HTMLDivElement>) => {
    setValues(parseText(e.currentTarget.innerText));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      if (range) {
        const br = document.createElement('br');
        const textNode = document.createTextNode('• ');
        range.deleteContents();
        range.insertNode(br);
        range.collapse(false);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  const analyze = async () => {
    setLoading(true);
    console.log(goals);
    console.log(values);
    const resp = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals, values }),
    });
    console.log(goals);
    console.log(values);
    const data = await resp.json();
    console.log(data);
    setResult(data);
    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        backgroundImage: "url('/img/sky.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <h1 className={styles.title}>13 Going on 30</h1>

      <div className={styles.editors}>
        <div className={styles.editorBox}>
          <div className={styles.goals}>Goals</div>
          <div
            className={styles.editor}
            contentEditable
            onInput={handleGoalsChange}
            onKeyDown={handleKeyDown}
            data-placeholder="• Enter your goals here..."
            suppressContentEditableWarning
            id={styles.goalEditor}
          />
        </div>
        
        {!result ? (
          <div className={styles.houseContainer}>
            <img src="img/house.png" className={styles.house} />
            {loading && (
              <div className={styles.sparkles}>
                {Array.from({ length: 50 }).map((_, i) => (
                  <span
                    key={i}
                    className={styles.sparkle}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random() * 1.5}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.resultBox}>
            <div className={styles.scoreDisplay}>Score: {result.score}%</div>
            <p className={styles.explanation}>{result.explanation}</p>
          </div>
        )}
        
        <div className={styles.editorBox}>
          <div className={styles.values}>Values</div>
          <div
            className={styles.editor}
            contentEditable
            onInput={handleValuesChange}
            onKeyDown={handleKeyDown}
            data-placeholder="• Enter your values here..."
            suppressContentEditableWarning
            id={styles.valueEditor}
          />
        </div>
      </div>

      <button onClick={analyze} className={styles.addButton} disabled={loading}>
        {loading ? "Aligning..." : "Align"}
      </button>

      {/* Remove the old results display since we're showing it in place of the house */}
    </main>
  );
}