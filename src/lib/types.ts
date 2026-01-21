import { BACKGROUND, OFFSCREEN, PROCESS_DOC, REL_TEXT_RES } from "./constants";

export type Sentence = {
  txt: string;
  level: typeof import("./constants").SENTENCE_IMPORTANCE[number];
};

type MsgMap = {
  [BACKGROUND]: {
    [OFFSCREEN]: {
      type: typeof PROCESS_DOC;
    } & Payload<string>;
  };
  [OFFSCREEN]: {
    [BACKGROUND]: {
      type: typeof REL_TEXT_RES;
    } & Payload<Sentence[]>;
  };
};

type Sender = keyof MsgMap;
type Receiver<T extends Sender> = keyof MsgMap[T];

export type Msg<
  From extends Sender,
  To extends Receiver<From> = Receiver<From>
> = MsgMap[From][To];

export type Payload<T> = { data: T; error?: null } | { data?: null; error: string };
export type ErrorPayload = Extract<Payload<unknown>, { error: string }>;
