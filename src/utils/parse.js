function parseSolvedInput(text) {
  if (!text) return null;
  const matches = text.match(/\d+/g);
  if (!matches) return null;
  if (matches.length !== 1) return null;
  const value = Number(matches[0]);
  if (!Number.isInteger(value) || value < 0 || value > 5) return null;
  return value;
}

module.exports = { parseSolvedInput };
