const getPageContent = async () => {
  const clone = document.body.cloneNode(true) as HTMLElement;

  const elementsToRemove = clone.querySelectorAll(
    "script, style, noscript, svg, img, video, audio, iframe, canvas, " +
    "nav, header, footer, aside, form, button, input, select, textarea, " +
    "embed, object, applet, area, map, track, source"
  );

  elementsToRemove.forEach((el) => el.remove());

  const negativePatterns = /(comment|meta|footer|footnote|ad|advertisement|sidebar|menu|navigation|nav|social|share|widget)/i;
  const allElements = clone.querySelectorAll("*");
  allElements.forEach((el) => {
    const className = el.className?.toString() || "";
    const id = el.id || "";
    if (negativePatterns.test(className) || negativePatterns.test(id)) {
      el.remove();
    }
  });

  return clone.innerHTML;
};

export default getPageContent;
