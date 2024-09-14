export const GetHighlightedTranscript = (transcript, highlights) => {
  var offset = 0;
  const styles = {
    false:
      '<span class="border-2 border-red-500 bg-red-500 bg-opacity-50 rounded animate-fade-in">',
    true: '<span class="border-2 border-red-500 bg-red-500 bg-opacity-50 rounded animate-fade-in">',
  };
  highlights.forEach((high) => {
    const startIndex = high.start + offset;
    const endIndex = high.end + offset;
    transcript = [
      transcript.slice(0, startIndex),
      '<span class="border-2 border-red-500 bg-red-500 bg-opacity-50 rounded animate-fade-in">',
      transcript.slice(startIndex, endIndex),
      "</span>",
      transcript.slice(endIndex),
    ].join("");
    offset +=
      '<span class="border-2 border-red-500 bg-red-500 bg-opacity-50 rounded animate-fade-in">'
        .length + 7;
  });
  console.log(transcript);
  return transcript;
};
