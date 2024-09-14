export const GetHighlightedTranscript = (
  transcript,
  highlights,
  curIteration
) => {
  var offset = 0;
  const styles = {
    false:
      '<span class="border-2 border-red-500 bg-red-500 bg-opacity-50 rounded">',
    true: '<span class="border-2 border-green-500 bg-green-500 bg-opacity-50 rounded">',
    context:
      '<span class="border-2 border-blue-500 bg-blue-500 bg-opacity-50 rounded">',
  };
  const animatedStyles = {
    false:
      '<span class="border-2 border-red-500 bg-red-500 bg-opacity-50 rounded animate-bg-fade-red">',
    true: '<span class="border-2 border-green-500 bg-green-500 bg-opacity-50 rounded animate-bg-fade-green">',
    context:
      '<span class="border-2 border-blue-500 bg-blue-500 bg-opacity-50 rounded animate-bg-fade-blue">',
  };
  highlights.forEach((high) => {
    const startIndex = high.start + offset;
    const endIndex = high.end + offset;
    const curStyle =
      high.iteration === curIteration.current
        ? animatedStyles[high.type]
        : styles[high.type];
    transcript = [
      transcript.slice(0, startIndex),
      curStyle,
      transcript.slice(startIndex, endIndex),
      "</span>",
      transcript.slice(endIndex),
    ].join("");
    offset += curStyle.length + 7;
  });
  return transcript;
};
