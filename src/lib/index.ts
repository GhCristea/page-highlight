import { ErrorPayload } from "./types";

export const objHasKeys = <K extends string>(
  o: unknown,
  keys: K[]
): o is { [k in K]: unknown } => {
  const keysActual = typeof o === "object" && o !== null ? Object.keys(o) : null;
  return !!keysActual && keys.every((k) => keysActual.includes(k));
};

export const isString = (s: unknown) => typeof s === "string";

export const isError = (msg: unknown): msg is ErrorPayload =>
  objHasKeys(msg, ["error"]) && isString(msg.error);
