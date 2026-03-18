function logInfo(message, meta = {}) {
  console.log(JSON.stringify({ level: 'info', message, ...meta }));
}

function logError(message, meta = {}) {
  console.error(JSON.stringify({ level: 'error', message, ...meta }));
}

module.exports = { logInfo, logError };
