import type { Attr, Method, NoteTag, Roast } from "../catalog.ts";

export type Term =
  | { kind: "note"; value: NoteTag }
  | { kind: "method"; value: Method }
  | { kind: "roast"; value: Roast }
  | { kind: "origin"; value: string[] }
  | { kind: "level"; attr: Attr; dir: "up" | "down" }
  | { kind: "decaf" }
  | { kind: "cheap" }
  | { kind: "price-cue" }
  | { kind: "price"; max: number };

// Token positions of a recognized phrase; `end` is exclusive.
export type Hit = { term: Term; start: number; end: number };

export type Range = { min?: number; max?: number };

export type Query = {
  notes: NoteTag[];
  excludeNotes: NoteTag[];
  methods: Method[];
  roasts: Roast[];
  origins: string[];
  levels: Partial<Record<Attr, Range>>;
  maxPrice?: number;
  decaf: boolean;
  recognized: number;
};
