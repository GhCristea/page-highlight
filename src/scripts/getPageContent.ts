const getPageContent = async () => {
  const clone = document.body.cloneNode(true) as HTMLElement;

  const elementsToRemove = clone.querySelectorAll(
    "script, style, noscript, svg, img, video, audio, iframe, canvas"
  );
  elementsToRemove.forEach((el) => el.remove());

  return clone.innerHTML;
};

export default getPageContent;
