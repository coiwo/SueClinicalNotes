CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "squareAppointmentId" TEXT NOT NULL,
    "patientId" TEXT,
    "scheduledAt" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Appointment_squareAppointmentId_key" ON "Appointment"("squareAppointmentId");
CREATE INDEX "Appointment_scheduledAt_idx" ON "Appointment"("scheduledAt");
