type MsgTargetMap = typeof import("./constants").MSG_TARGET_MAP;
export type MsgKey = "target" | "type" | "data" | "error";
type MsgValue = string;

export type MsgShape<K extends MsgKey = MsgKey, V = MsgValue> = {
  [k in K]: V;
};

export type MsgKind = keyof MsgTargetMap;

export type MsgPayload = { data?: null; error: string } | { data: string; error?: null };

export type MsgHeader<T extends MsgKind = MsgKind> = T extends MsgKind
  ? {
      target: MsgTargetMap[T];
      type: T;
    }
  : never;

export type Msg<T extends MsgKind = MsgKind> = MsgHeader<T> & MsgPayload;
