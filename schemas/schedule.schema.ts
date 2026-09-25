import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const scheduleDaySchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    is_active: z.boolean(),
    start_time: z.string().regex(timeRegex, "Formato HH:mm"),
    end_time: z.string().regex(timeRegex, "Formato HH:mm"),
  })
  .refine((d) => d.start_time < d.end_time, {
    message: "El horario de inicio debe ser antes que el de fin",
    path: ["end_time"],
  });

export const weekScheduleSchema = z.array(scheduleDaySchema).length(7);
export type WeekScheduleInput = z.infer<typeof weekScheduleSchema>;
