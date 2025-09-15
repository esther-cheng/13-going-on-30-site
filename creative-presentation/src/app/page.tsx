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
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const handleGoalsChange = (e: React.FormEvent<HTMLDivElement>) => {
    setGoals(parseText(e.currentTarget.innerText));
  };

  const handleValuesChange = (e: React.FormEvent<HTMLDivElement>) => {
    setValues(parseText(e.currentTarget.innerText));
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
    <main className={styles.container}>
      <h1 className={styles.title}>13 Going on 30</h1>

      <div className={styles.editors}>
        <div className={styles.editorBox}>
          <div className={styles.goals}>Goals</div>
          <input
            className={styles.editor}
            contentEditable
            onInput={handleGoalsChange}
            placeholder="Type your goals here..."
            suppressContentEditableWarning
          ></input>
        </div>
        <img src="img/house.png" className={styles.house}/>
        <div className={styles.editorBox}>
          <div className={styles.values}>Values</div>
          <input
            className={styles.editor}
            contentEditable
            onInput={handleValuesChange}
            placeholder="Type your values here..."
            suppressContentEditableWarning
          ></input>
        </div>
      </div>
      {/* <div className={styles.toggle}>
        <button onClick={() => setMode("goal")} className={mode === "goal" ? styles.activeButton : styles.button}>
          Add Goal
        </button>
        <button onClick={() => setMode("value")} className={mode === "value" ? styles.activeButton : styles.button}>
          Add Value
        </button>
      </div> */}

      {/* <div className={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "goal" ? "Enter a goal..." : "Enter a value..."}
          className={styles.input}
        />
        <button onClick={addItem} className={styles.addButton}>Add</button>
      </div> */}

      {/* <div className={styles.lists}>
        <div>
          <img src="img/goals.png" className={styles.goals}/>
          <div className={styles.goals}>Goals</div>
          <ul>{goals.map((g, i) => <li key={i}>{g}</li>)}</ul>
        </div>
        <div>
          <div className={styles.values}>Values</div>
          <ul>{values.map((v, i) => <li key={i}>{v}</li>)}</ul>
        </div>
      </div> */}

      <button onClick={analyze} className={styles.addButton} disabled={loading}>Align</button>

      {result && (
        <div className={styles.results}>
          <h2>Score: {result.score}%</h2>
          <p>{result.explanation}</p>
        </div>
      )}
    </main>
  );
}
