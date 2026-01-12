import { MSG_TARGET_MAP } from "./constants";
import type { MsgKind, Msg, SentenceData } from "./types";

export const getMsgHeader = <T extends MsgKind>(kind: T) => {
  return {
    type: kind,
    target: MSG_TARGET_MAP[kind],
  };
};

// validation
const objHasKeys = <K extends string>(o: unknown, keys: K[]): o is { [k in K]: unknown } => {
  const keysActual = typeof o === "object" && o !== null ? Object.keys(o) : null;
  return !!keysActual && keys.every((k) => keysActual.includes(k));
};

export const validMsgHeader = <T extends MsgKind>(raw: unknown, msgType: T): raw is Msg<T> => {
  return (
    objHasKeys(raw, ["type", "target"]) &&
    raw.type === msgType &&
    raw.target === MSG_TARGET_MAP[msgType]
  );
};

export const isSentenceData = (data: unknown): data is SentenceData[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (el) =>
        objHasKeys(el, ["importance", "sentence"]) &&
        typeof el.importance === "number" &&
        typeof el.sentence === "string"
    )
  );
};
