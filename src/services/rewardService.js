function computeRewards(solvedCount, totalQuestions = 5) {
  const solved = Math.max(0, Math.min(solvedCount, totalQuestions));
  const unsolved = totalQuestions - solved;
  const earnings = solved * 20;
  const penalty = unsolved * 20;
  const net = earnings - penalty;
  const points = solved * 0.5;
  return { solved, unsolved, earnings, penalty, net, points };
}

module.exports = { computeRewards };
