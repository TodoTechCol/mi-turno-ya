"use client";

import { motion, type Variants } from "framer-motion";
import type { AppointmentWithDetails } from "@/types/app.types";
import AppointmentCard from "./appointment-card";
import { CalendarX2 } from "lucide-react";

interface Props {
  appointments: AppointmentWithDetails[];
  organizationId: string;
  emptyMessage?: string;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export default function AppointmentList({
  appointments,
  emptyMessage = "No hay turnos.",
}: Props) {
  if (appointments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-16 text-pizarra-300"
      >
        <CalendarX2 className="w-12 h-12 mb-3" />
        <p className="text-sm">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid gap-3 sm:grid-cols-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {appointments.map((apt) => (
        <motion.div key={apt.id} variants={item}>
          <AppointmentCard appointment={apt} />
        </motion.div>
      ))}
    </motion.div>
  );
}
