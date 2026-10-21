window.SCIMENTRA_FREE_ACCESS = (() => {

 
const freeTeacherChapters = new Set([
   
[
      "6th Class",
      "IIT & NEET Foundation",
      "Physics IIT & NEET",
      "Units and Measurements: Assimilation 1 (Subtopics: Importance of Measurements, Physical Quantity and its Types, Unit)"
    ].join("|"),

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
  const params = new URLSearchParams(
    window.location.search
  );

  const subtopics = (
    params.get("subtopics") || ""
  ).trim();

  const isPhysicsFreeAssimilation =
    makeKey(context) === [
      "6th Class",
      "IIT & NEET Foundation",
      "Physics IIT & NEET",
      "Units and Measurements"
    ].join("|") &&
    subtopics ===
      "Importance of Measurements, Physical Quantity and its Types, Unit";

  return (
    freeTeacherChapters.has(makeKey(context)) ||
    isPhysicsFreeAssimilation
  );
}

  };

})();
