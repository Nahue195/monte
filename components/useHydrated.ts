"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False during SSR and hydration, true after: avoids flashing "empty cart" before localStorage is read.
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
