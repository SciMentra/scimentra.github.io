// SciMentra complimentary teacher access: first chapters only.
// Matches the chapter formats used by both the original and updated QR codes.
window.SCIMENTRA_FREE_ACCESS = (() => {
  const freeMathChapters = [
    ["6th Class", "Inroduction to Algebra"],
    ["7th Class", "Number System"],
    ["8th Class", "Exponents & Powers; Square Roots & Cube Roots"],
    ["9th Class", "Theory of Numbers - Basics"]
  ];

  const firstPhysicsAssimilations = [
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

  function normal(value) {
    return String(value == null ? "" : value)
      .replace(/[‐‑‒–—−]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function normalTopics(value) {
    return normal(value).replace(/[^a-z0-9]+/g, " ").trim();
  }

  function isTeacherChapterFree(context = {}) {
    const cls = normal(context.className || context.class);
    const board = normal(context.board);
    const subject = normal(context.subject);
    const chapter = String(context.chapter || "").trim();

    if (board !== normal("IIT & NEET Foundation")) return false;

    if (subject === normal("Math IIT")) {
      return freeMathChapters.some(([c, title]) =>
        cls === normal(c) && normal(chapter) === normal(title)
      );
    }

    if (subject !== normal("Physics IIT & NEET")) return false;

    // The QR chapter can be either:
    // "Units and Measurements (Assimilation 1)"
    // "Units and Measurements: Assimilation 1 (Subtopics: ...)"
    // or the bare chapter title with subtopics in a separate URL parameter.
    const match = chapter.match(
      /^(.*?)\s*(?::|\()\s*Assimilation\s*(\d+)\b/i
    );
    const baseChapter = match ? match[1].trim() : chapter;
    const assimilationNumber = match ? Number(match[2]) : null;

    const rule = firstPhysicsAssimilations.find(item =>
      cls === normal(item.className) && normal(baseChapter) === normal(item.chapter)
    );
    if (!rule) return false;

    // Assimilation 2 and later are never complimentary.
    if (assimilationNumber !== null) {
      return assimilationNumber === 1;
    }

    // For older QR codes without an assimilation label, verify their
    // exact first-assimilation subtopics to avoid freeing Assimilation 2.
    const params = new URLSearchParams(window.location.search);
    const separate = params.get("subtopics") || params.get("subtopic") || "";
    const embedded = chapter.match(/\(\s*Subtopics\s*:\s*(.*?)\)\s*$/i);
    const topics = separate || (embedded ? embedded[1] : "");

    return !!topics && normalTopics(topics) === normalTopics(rule.subtopics);
  }

  return { isTeacherChapterFree };
})();
