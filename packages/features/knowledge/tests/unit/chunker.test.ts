import { describe, expect, it } from "vitest";

import { chunkKnowledgeDocument } from "../../src/server/chunker";

describe("chunkKnowledgeDocument", () => {
  it("returns single chunk for empty body", () => {
    const chunks = chunkKnowledgeDocument({ title: "Test", body: "" });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.index).toBe(0);
    expect(chunks[0]?.title).toBe("Test");
  });

  it("returns single chunk when body is short", () => {
    const body = "This is a short policy document.";
    const chunks = chunkKnowledgeDocument({
      title: "Short doc",
      body,
      targetTokens: 512,
    });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.body).toBe(body);
  });

  it("splits long body into multiple chunks", () => {
    const words = Array.from({ length: 2000 }, (_, i) => `word${i}`);
    const body = words.join(" ");
    const chunks = chunkKnowledgeDocument({
      title: "Long doc",
      body,
      targetTokens: 128,
    });
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("is deterministic — same input produces same chunks", () => {
    const body = Array.from({ length: 800 }, (_, i) => `w${i}`).join(" ");
    const a = chunkKnowledgeDocument({ title: "X", body, targetTokens: 64 });
    const b = chunkKnowledgeDocument({ title: "X", body, targetTokens: 64 });
    expect(a).toEqual(b);
  });

  it("all chunks carry the document title", () => {
    const body = Array.from({ length: 800 }, (_, i) => `w${i}`).join(" ");
    const chunks = chunkKnowledgeDocument({
      title: "Policy A",
      body,
      targetTokens: 64,
    });
    for (const chunk of chunks) {
      expect(chunk.title).toBe("Policy A");
    }
  });

  it("chunk indices are sequential starting at 0", () => {
    const body = Array.from({ length: 1000 }, (_, i) => `w${i}`).join(" ");
    const chunks = chunkKnowledgeDocument({ title: "T", body, targetTokens: 64 });
    chunks.forEach((chunk, i) => {
      expect(chunk.index).toBe(i);
    });
  });

  it("overlap means consecutive chunks share words", () => {
    const words = Array.from({ length: 200 }, (_, i) => `word${i}`);
    const body = words.join(" ");
    const chunks = chunkKnowledgeDocument({
      title: "T",
      body,
      targetTokens: 64,
      overlapTokens: 16,
    });

    if (chunks.length >= 2) {
      const firstWords = new Set((chunks[0]?.body ?? "").split(" "));
      const secondWords = (chunks[1]?.body ?? "").split(" ");
      const overlap = secondWords.filter((w) => firstWords.has(w));
      expect(overlap.length).toBeGreaterThan(0);
    }
  });

  it("tokenCount is positive for non-empty chunks", () => {
    const body = "Hello world this is a sentence.";
    const chunks = chunkKnowledgeDocument({ title: "T", body });
    expect(chunks[0]?.tokenCount).toBeGreaterThan(0);
  });
});
