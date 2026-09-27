/*
  AI FOUNDATION — COMPLIMENTARY TEACHER ACCESS

  This file controls which AI Foundation chapters can open
  Teacher AI Tools without a school login.

  Current complimentary chapter:
  Class 6 — Chapter 1: Thinking Like a Problem Solver

  Add future complimentary chapters only inside
  FREE_TEACHER_CHAPTERS below.
*/

window.AI_FOUNDATION_FREE_ACCESS = (() => {

  const FREE_TEACHER_CHAPTERS = new Set([
    [
      "6th Class",
      "AI Foundation",
      "Artificial Intelligence",
      "Thinking Like a Problem Solver"
    ].join("|")
  ]);

  function clean(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ");
  }

  function makeKey(context = {}) {

    const className =
      clean(
        context.className ||
        context.class ||
        ""
      );

    const programme =
      clean(
        context.board ||
        context.programme ||
        "AI Foundation"
      );

    const subject =
      clean(
        context.subject ||
        "Artificial Intelligence"
      );

    const chapter =
      clean(
        context.chapter ||
        ""
      );

    return [
      className,
      programme,
      subject,
      chapter
    ].join("|");
  }

  return {
    isTeacherChapterFree(context) {
      return FREE_TEACHER_CHAPTERS.has(
        makeKey(context)
      );
    }
  };

})();
