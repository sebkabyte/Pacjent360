(function initPatient360Format(root, factory) {
  const format = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = format;
  }
  root.Patient360Format = format;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360Format() {
  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function pluralPl(count, one, few, many) {
    const absolute = Math.abs(toNumber(count));
    const mod10 = absolute % 10;
    const mod100 = absolute % 100;
    if (absolute === 1) return one;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
    return many;
  }

  function formatCount(count, one, few, many) {
    return `${toNumber(count)} ${pluralPl(count, one, few, many)}`;
  }

  function formatYears(age) {
    return formatCount(age, "rok", "lata", "lat");
  }

  function formatDocuments(count) {
    return formatCount(count, "dokument", "dokumenty", "dokumentów");
  }

  function formatResults(count) {
    return formatCount(count, "wynik", "wyniki", "wyników");
  }

  function formatQuestions(count) {
    return formatCount(count, "pytanie", "pytania", "pytań");
  }

  function formatGaps(count) {
    return formatCount(count, "brak", "braki", "braków");
  }

  function formatItems(count) {
    return formatCount(count, "element", "elementy", "elementów");
  }

  function formatEvents(count) {
    return formatCount(count, "zdarzenie", "zdarzenia", "zdarzeń");
  }

  function formatTracks(count) {
    return formatCount(count, "tor", "tory", "torów");
  }

  return Object.freeze({
    pluralPl,
    formatCount,
    formatYears,
    formatDocuments,
    formatResults,
    formatQuestions,
    formatGaps,
    formatItems,
    formatEvents,
    formatTracks
  });
});
