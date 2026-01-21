type Limits = [startIndex: number, endIndex: number] | [-1, 0];

const INVISIBLE_SPACE = "\uFEFF";
const MAX_DISTANCE = 1;

const sameLetter = (c1: string, c2: string) =>
  c1 === c2 ? true : c1.toLowerCase() === c2.toLowerCase();

export const getFuzzyLimits = (q: string, content: string, offset = 0): Limits => {
  let len = 0,
    track = 0,
    startIndex = -1,
    endIndex = 0,
    errorDistance = 0;

  for (track = offset; len < q.length && track < content.length; ) {
    if (sameLetter(q[len], content[track])) {
      len++;
      endIndex++;
      errorDistance = 0;

      if (startIndex === -1) {
        startIndex = track;
      }
    } else if (len > 0) {
      if (errorDistance >= MAX_DISTANCE && content[track] !== INVISIBLE_SPACE) {
        len = 0;
        startIndex = -1;
        endIndex = 0;
        errorDistance = 0;
        track--;
      } else {
        errorDistance++;
        endIndex++;
      }
    }

    track++;
  }

  return len === q.length ? [startIndex, endIndex] : [-1, 0];
};
