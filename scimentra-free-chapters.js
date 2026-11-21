/*
 * SciMentra IIT & NEET Foundation - complimentary Teacher access
 * Replace the contents of scimentra-free-chapters.js with this file.
 * Only the listed mathematics chapters and Physics Assimilation 1 are free.
 * Physics Assimilation 2+ remains login-protected.
 */
window.SCIMENTRA_FREE_ACCESS = (() => {
  const mathFreeChapters = new Set([
    ["6th Class", "IIT & NEET Foundation", "Math IIT", "Inroduction to Algebra"].join("|"),
    ["7th Class", "IIT & NEET Foundation", "Math IIT", "Number System"].join("|"),
    ["8th Class", "IIT & NEET Foundation", "Math IIT", "Exponents & Powers; Square Roots & Cube Roots"].join("|"),
    ["9th Class", "IIT & NEET Foundation", "Math IIT", "Theory of Numbers - Basics"].join("|")
  ]);

  // Exact first-assimilation subtopic lists, retained from your existing file.
  const freePhysics = [
    {
      className: "6th Class",
      chapter: "Units and Measurements",
      subtopics: "Importance of Measurements, Physical Quantity and its Types, Unit"
    },
    {
      className: "7th Class",
      chapter: "Units and Measurements",
      subtopics: "Physical Quantity, Fundamental Physical Quantity, Derived Quantity, Unit, System of Units, Guidelines for Writing Units"
    },
    {
      className: "8th Class",
      chapter: "Units and Dimensions",
      subtopics: "Physical Quantities, Standards and Units, Definitions of Fundamental Units, Multiplication Factors of Units"
    },
    {
      className: "9th Class",
      chapter: "Basics",
      subtopics: "Physical Quantity, Multiples And Sub –Multiples, Dimensions Of A Physical Quantities, Rest and Motion, Speed And Velocity, Acceleration And Its Types, Equations Of Motion"
    }
  ];

  function clean(value) {
    return String(value == null ? "" : value).trim().replace(/\s+/g, " ");
  }

  // Normalize typographic dash differences without changing QR content.
  function comparable(value) {
    return clean(value)
      .replace(/[‐‑‒–—−]/g, "-")
      .replace(/\s*-\s*/g, "-")
      .toLowerCase();
  }

  function key(parts) {
    return parts.map(clean).join("|");
  }

  function subtopicList(value) {
    return String(value || "")
      .split(/\s*(?:\||;|,|\r?\n)\s*/)
      .map(comparable)
      .filter(Boolean)
      .sort();
  }

  function identicalSubtopics(actual, expected) {
    const a = subtopicList(actual);
    const b = subtopicList(expected);
    return a.length === b.length && a.every((part, i) => part === b[i]);
  }

  function isTeacherChapterFree(context = {}) {
    const className = clean(context.className || context.class);
    const board = clean(context.board);
    const subject = clean(context.subject);
    const rawChapter = clean(context.chapter);

    // Keep all four existing Mathematics complimentary chapters working.
    if (mathFreeChapters.has(key([className, board, subject, rawChapter]))) {
      return true;
    }

    if (board !== "IIT & NEET Foundation" || subject !== "Physics IIT & NEET") {
      return false;
    }

    // Match QR chapter forms such as:
    //   Units and Measurements
    //   Units and Measurements: Assimilation 1
    //   Units and Measurements (Assimilation 1)
    //   Units and Measurements: Assimilation 1 (Subtopics: ...)
    const assimilationMatch = rawChapter.match(
      /^(.*?)\s*(?::|\()\s*Assimilation\s*(\d+)\b/i
    );
    const baseChapter = clean(assimilationMatch ? assimilationMatch[1] : rawChapter);
    const explicitAssimilation = assimilationMatch ? Number(assimilationMatch[2]) : null;

    // Never make Assimilation 2, 3, etc. complimentary.
    if (explicitAssimilation !== null && explicitAssimilation !== 1) {
      return false;
    }

    const rule = freePhysics.find(item =>
      className === item.className && comparable(baseChapter) === comparable(item.chapter)
    );
    if (!rule) return false;

    // The QR may include the complete legacy label in chapter, or may
    // transmit the actual headings separately through subtopics.
    const params = new URLSearchParams(window.location.search);
    const urlSubtopics = clean(params.get("subtopics") || params.get("subtopic"));
    const embeddedMatch = rawChapter.match(/\(\s*Subtopics\s*:\s*(.*?)\)\s*$/i);
    const embeddedSubtopics = embeddedMatch ? embeddedMatch[1] : "";
    const topics = urlSubtopics || embeddedSubtopics;

    // If a QR explicitly identifies Assimilation 1, that designation is enough,
    // provided any accompanying headings agree with the free assimilation.
    if (explicitAssimilation === 1) {
      return !topics || identicalSubtopics(topics, rule.subtopics);
    }

    // With only the base chapter title, require the exact Assimilation 1
    // heading list. This prevents later assimilations from becoming free.
    return identicalSubtopics(topics, rule.subtopics);
  }

  return { isTeacherChapterFree };
})();
