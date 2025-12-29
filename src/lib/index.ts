import { MSG_TARGET_MAP } from "./constants";
import type { MsgKind, Msg, MsgPayload, MsgShape, MsgKey } from "./types";

export const getMsgHeader = <T extends MsgKind>(kind: T) => {
  return {
    type: kind,
    target: MSG_TARGET_MAP[kind],
  };
};

// validation
const objHasKeys = <K extends MsgKey>(o: unknown, keys: K[]): o is MsgShape<K> => {
  const keysActual = typeof o === "object" && o !== null ? Object.keys(o) : null;
  return !!keysActual && keys.every((k) => keysActual.includes(k));
};
export const isError = (raw: unknown): raw is Extract<MsgPayload, { error: string }> =>
  objHasKeys(raw, ["error"]) && typeof raw.error === "string";

const isData = (raw: unknown): raw is Extract<MsgPayload, { data: string }> =>
  objHasKeys(raw, ["data"]) && typeof raw.data === "string";

export const validMsgHeader = <T extends MsgKind>(raw: unknown, msgType: T): raw is Msg<T> => {
  return objHasKeys(raw, ["type", "target"]) && raw.type === msgType;
};

export const validMsg = <K extends MsgKind>(raw: unknown, k: K): raw is Msg<K> => {
  return validMsgHeader(raw, k) && (isError(raw) || isData(raw));
};
