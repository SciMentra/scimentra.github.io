window.SCIMENTRA_FREE_ACCESS = (() => {

  const freeTeacherChapters = new Set([
    [
      "6th Class",
      "IIT & NEET Foundation",
      "Math IIT",
      "Inroduction to Algebra"
    ].join("|"),

    [
      "7th Class",
      "IIT & NEET Foundation",
      "Math IIT",
      "Number System"
    ].join("|"),

    [
      "8th Class",
      "IIT & NEET Foundation",
      "Math IIT",
      "Exponents & Powers; Square Roots & Cube Roots"
    ].join("|"),

    [
      "9th Class",
      "IIT & NEET Foundation",
      "Math IIT",
      "Theory of Numbers - Basics"
    ].join("|")
  ]);

  function makeKey(context) {
    return [
      context.className,
      context.board,
      context.subject,
      context.chapter
    ]
      .map(value => String(value || "").trim())
      .join("|");
  }

  return {
    isTeacherChapterFree(context) {
      return freeTeacherChapters.has(
        makeKey(context)
      );
    }
  };

})();
