"use client";

import { ORDER_KEY, parseOrder, type Order } from "@/lib/order";
import { createPersisted } from "@/lib/persisted";

export const orderStore = createPersisted<Order | null>(ORDER_KEY, parseOrder, null);
