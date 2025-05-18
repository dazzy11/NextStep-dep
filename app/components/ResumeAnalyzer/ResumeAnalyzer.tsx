"use client";

import React, { useState } from "react";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import Groq from "groq-sdk";
import styles from "./ResumeAnalyzer.module.css";

export default function ResumeAnalyser() {
  const [pdfText, setPdfText] = useState<string>("");
  const [roleDescription, setRoleDescription] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    try {
      const text = await extractTextFromPDF(file);
      setPdfText(text || "No text found in PDF");
    } catch (err) {
      console.error(err);
      setError("Error extracting text from PDF.");
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const data = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ") + "\n";
    }
    return text;
  };

  const analyzeResume = async () => {
    if (!pdfText || !roleDescription) {
      setError("Please upload a resume and enter a role description.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const userPrompt = `Analyze this resume for the role:\n\n${roleDescription}\n\nResume content:\n${pdfText}`;
      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [
          { role: "system",
      content:
        "You are a career coach. Analyze the given resume against the provided role description and identify skill matches, gaps, and recommendations. Respond in clear, professional plain text without any markdown formatting, bullet points, lists, or code blocks." },
          { role: "user", content: userPrompt },
        ],
      });
      setAnalysis(response.choices[0]?.message?.content || "No analysis received.");
    } catch (err) {
      console.error(err);
      setError("Error analyzing resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Resume Analyzer & Role Matcher</h1>
      <div className={styles.uploadSection}>
        <input type="file" accept="application/pdf" onChange={handleFileUpload} />
        {fileName && <p>Uploaded: {fileName}</p>}
      </div>

      <textarea
        className={styles.textArea}
        placeholder="Enter the job or role description here..."
        value={roleDescription}
        onChange={(e) => setRoleDescription(e.target.value)}
        rows={4}
      />

      <button onClick={analyzeResume} disabled={loading} className={styles.button}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {error && <p className={styles.error}>{error}</p>}
      {analysis && (
        <div className={styles.analysisSection}>
          <h2>Analysis & Feedback</h2>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
}
