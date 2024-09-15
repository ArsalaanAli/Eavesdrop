import React from "react";

export const GetHighlightedTranscript = (
  transcript, // string[]
  highlights, // [[{start, end, type, meta}]
  setFocused
) => {
  if (!highlights) return
  const splitScript = [];

  let lastIndex = 0;
  const result = [];
  try {
    highlights.forEach((highlight) => {
      const start = transcript.indexOf(highlight.highlight);
      const end = start + highlight.highlight.length;
      highlight.start = start;
      highlight.end = end;
      highlight.type =
        highlight.truthiness < 0.33
          ? "false"
          : highlight.truthiness > 0.66
          ? "true"
          : "context";
    });

    highlights.sort((a, b) => a.start - b.start);
  } catch {
  }
  highlights.forEach((highlight, index) => {
    // Add non-highlighted text before the current highlight
    if (highlight.start > lastIndex) {
      result.push(transcript.slice(lastIndex, highlight.start));
    }

    // Add the highlighted text
    const highlightedText = transcript.slice(highlight.start, highlight.end);
    let className = "";

    switch (highlight.type) {
      case "true":
        className =
          "border-2 border-green-300 bg-green-200 bg-opacity-50 rounded animate-bg-fade-green cursor-pointer hover:bg-green-300";
        break;
      case "false":
        className =
          "border-2 border-red-300 bg-red-200 bg-opacity-50 rounded animate-bg-fade-red cursor-pointer hover:bg-red-300";
        break;
      case "context":
        className =
          "border-2 border-blue-300 bg-blue-200 bg-opacity-50 rounded animate-bg-fade-blue cursor-pointer hover:bg-blue-300";
        break;
      default:
        className = "";
    }

    result.push(
      <span
        key={index}
        className={className}
        onClick={() => setFocused(highlight.id)}
      >
        {highlightedText}
      </span>
    );

    lastIndex = highlight.end;
  });

  // Add any remaining non-highlighted text
  if (lastIndex < transcript.length) {
    result.push(transcript.slice(lastIndex));
  }
  return <div>{result}</div>;
};

const styles = {
  false: (
    <span class="border-2 border-red-500 bg-red-500 bg-opacity-50 rounded" />
  ),
  true: (
    <span class="border-2 border-green-500 bg-green-500 bg-opacity-50 rounded" />
  ),
  context: (
    <span class="border-2 border-blue-500 bg-blue-500 bg-opacity-50 rounded" />
  ),
};

const animatedStyles = {
  false: (
    <span className="border-2 border-red-500 bg-red-500 bg-opacity-50 rounded animate-bg-fade-red" />
  ),
  true: (
    <span className="border-2 border-green-500 bg-green-500 bg-opacity-50 rounded animate-bg-fade-green" />
  ),
  context: (
    <span className="border-2 border-blue-500 bg-blue-500 bg-opacity-50 rounded animate-bg-fade-blue" />
  ),
};
