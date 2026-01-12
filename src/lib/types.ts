type MsgTargetMap = typeof import("./constants").MSG_TARGET_MAP;

export type SentenceData = { sentence: string; importance: number };
export type MsgKind = keyof MsgTargetMap;

type MsgData = {
  "process-document": string;
  "relevant-text-result": SentenceData[];
};

export type MsgPayload<T extends MsgKind> =
  | { data?: null; error: string }
  | { data: MsgData[T]; error?: null };

export type MsgHeader<T extends MsgKind = MsgKind> = T extends MsgKind
  ? {
      target: MsgTargetMap[T];
      type: T;
    }
  : never;

export type Msg<T extends MsgKind = MsgKind> = MsgHeader<T> & MsgPayload<T>;
