function parseSolvedInput(text) {
  if (!text) return [];
  const matches = text.match(/\d+/g);
  if (!matches) return [];
  const numbers = matches.map(n => Number(n)).filter(n => n >= 1 && n <= 5);
  const unique = Array.from(new Set(numbers));
  return unique;
}

module.exports = { parseSolvedInput };
