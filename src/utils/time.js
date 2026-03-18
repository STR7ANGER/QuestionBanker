const config = require('../config');

function getDatePartsInTz(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const value = formatter.format(date); // YYYY-MM-DD
  return value;
}

function getTimePartsInTz(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: config.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const hour = Number(parts.find(p => p.type === 'hour').value);
  const minute = Number(parts.find(p => p.type === 'minute').value);
  return { hour, minute };
}

function isAfterCutoff(date = new Date()) {
  const { hour } = getTimePartsInTz(date);
  return hour >= 23;
}

function getYesterdayDateString(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return getDatePartsInTz(d);
}

module.exports = {
  getDatePartsInTz,
  getTimePartsInTz,
  isAfterCutoff,
  getYesterdayDateString
};
