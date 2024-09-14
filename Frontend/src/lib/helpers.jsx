import React from "react";

export const GetHighlightedTranscript = (
  transcript, // string[]
  highlights // [[{start, end, type, meta}]
) => {
  const splitScript = [];

  let lastIndex = 0;
  const result = [];

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
          "border-2 border-green-500 bg-green-500 bg-opacity-50 rounded animate-bg-fade-green";
        break;
      case "false":
        className =
          "border-2 border-red-500 bg-red-500 bg-opacity-50 rounded animate-bg-fade-red";
        break;
      case "context":
        className =
          "border-2 border-blue-500 bg-blue-500 bg-opacity-50 rounded animate-bg-fade-blue";
        break;
      default:
        className = "";
    }

    result.push(
      <span key={index} className={className}>
        {highlightedText}
      </span>
    );

    lastIndex = highlight.end;
  });

  // Add any remaining non-highlighted text
  if (lastIndex < transcript.length) {
    result.push(transcript.slice(lastIndex));
  }
  console.log(result);
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
