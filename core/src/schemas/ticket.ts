import { z } from "zod";

export const TICKET_STATUSES = ["OPEN", "PENDING", "RESOLVED", "CLOSED"] as const;

export const ticketStatusSchema = z.enum(TICKET_STATUSES);

export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const TicketStatus = {
  OPEN: "OPEN",
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const satisfies Record<TicketStatus, TicketStatus>;

export const TICKET_SOURCES = ["EMAIL", "MANUAL"] as const;

export const ticketSourceSchema = z.enum(TICKET_SOURCES);

export type TicketSource = z.infer<typeof ticketSourceSchema>;

export const TicketSource = {
  EMAIL: "EMAIL",
  MANUAL: "MANUAL",
} as const satisfies Record<TicketSource, TicketSource>;

export const TICKET_CATEGORIES = [
  "GENERAL_QUESTION",
  "TECHNICAL_QUESTION",
  "REFUND_REQUEST",
] as const;

export const ticketCategorySchema = z.enum(TICKET_CATEGORIES);

export type TicketCategory = z.infer<typeof ticketCategorySchema>;

export const TicketCategory = {
  GENERAL_QUESTION: "GENERAL_QUESTION",
  TECHNICAL_QUESTION: "TECHNICAL_QUESTION",
  REFUND_REQUEST: "REFUND_REQUEST",
} as const satisfies Record<TicketCategory, TicketCategory>;

export const inboundEmailSchema = z.object({
  from: z.string().min(1, "from is required").email("Invalid sender email"),
  fromName: z.string().min(1, "fromName is required"),
  to: z.string().min(1, "to is required").email("Invalid recipient email"),
  subject: z.string().default(""),
  text: z.string().default(""),
  html: z.string().optional(),
  category: ticketCategorySchema.optional(),
  messageId: z.string().min(1).optional(),
});

export type InboundEmailInput = z.infer<typeof inboundEmailSchema>;
