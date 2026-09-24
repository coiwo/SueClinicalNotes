-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "payer" TEXT NOT NULL,
    "primaryTreatmentArea" TEXT NOT NULL,
    "caseOpenedDate" TEXT NOT NULL,
    "archivedAt" DATETIME,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "date" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'follow_up',
    "painScore" INTEGER,
    "romData" JSONB NOT NULL DEFAULT '{}',
    "treatmentAreas" JSONB NOT NULL DEFAULT '[]',
    "cptCodes" JSONB NOT NULL DEFAULT '[]',
    "narrativeDelta" TEXT NOT NULL,
    "generatedNote" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "payerFlags" JSONB NOT NULL DEFAULT '[]',
    "finalizedAt" DATETIME,
    "addendumToId" TEXT,
    "correctionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Visit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Visit_encounterId_patientId_fkey" FOREIGN KEY ("encounterId", "patientId") REFERENCES "Encounter" ("id", "patientId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Visit_addendumToId_fkey" FOREIGN KEY ("addendumToId") REFERENCES "Visit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_identifier_key" ON "Patient"("identifier");

-- CreateIndex
CREATE INDEX "Encounter_patientId_idx" ON "Encounter"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_id_patientId_key" ON "Encounter"("id", "patientId");

-- CreateIndex
CREATE INDEX "Visit_patientId_date_idx" ON "Visit"("patientId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Visit_encounterId_version_key" ON "Visit"("encounterId", "version");

-- Clinical integrity guards (retained as part of this migration).
CREATE TRIGGER visit_validate_insert BEFORE INSERT ON Visit BEGIN
 SELECT CASE WHEN NEW.painScore IS NOT NULL AND (NEW.painScore < 0 OR NEW.painScore > 10) THEN RAISE(ABORT, 'Pain score must be 0 through 10') END;
 SELECT CASE WHEN NEW.version < 1 THEN RAISE(ABORT, 'Version must be positive') END;
 SELECT CASE WHEN NEW.status NOT IN ('draft','finalized') THEN RAISE(ABORT, 'Invalid note status') END;
 SELECT CASE WHEN (NEW.status = 'finalized' AND NEW.finalizedAt IS NULL) OR (NEW.status = 'draft' AND NEW.finalizedAt IS NOT NULL) THEN RAISE(ABORT, 'Finalization timestamp does not match status') END;
 SELECT CASE WHEN NEW.kind = 'addendum' AND (NEW.addendumToId IS NULL OR length(trim(coalesce(NEW.correctionReason,''))) = 0 OR NOT EXISTS (SELECT 1 FROM Visit v WHERE v.id = NEW.addendumToId AND v.status = 'finalized' AND v.encounterId = NEW.encounterId AND v.patientId = NEW.patientId)) THEN RAISE(ABORT, 'Addendum must reference a finalized note for the same encounter and include a reason') END;
 SELECT CASE WHEN NEW.kind != 'addendum' AND NEW.addendumToId IS NOT NULL THEN RAISE(ABORT, 'Only addenda can reference a corrected note') END;
END;
CREATE TRIGGER visit_preserve_finalized_update BEFORE UPDATE ON Visit WHEN OLD.status = 'finalized' BEGIN
 SELECT RAISE(ABORT, 'Finalized notes are immutable; append an addendum');
END;
CREATE TRIGGER visit_preserve_finalized_delete BEFORE DELETE ON Visit WHEN OLD.status = 'finalized' BEGIN
 SELECT RAISE(ABORT, 'Finalized notes cannot be deleted');
END;
CREATE TRIGGER visit_preserve_draft_content BEFORE UPDATE ON Visit WHEN OLD.status = 'draft' BEGIN
 SELECT CASE WHEN NEW.generatedNote != OLD.generatedNote OR NEW.patientId != OLD.patientId OR NEW.encounterId != OLD.encounterId OR NEW.date != OLD.date OR NEW.version != OLD.version OR NEW.kind != OLD.kind OR NEW.painScore IS NOT OLD.painScore OR NEW.romData != OLD.romData OR NEW.treatmentAreas != OLD.treatmentAreas OR NEW.cptCodes != OLD.cptCodes OR NEW.narrativeDelta != OLD.narrativeDelta OR NEW.payerFlags != OLD.payerFlags OR NEW.addendumToId IS NOT OLD.addendumToId OR NEW.correctionReason IS NOT OLD.correctionReason OR NEW.createdAt != OLD.createdAt OR NEW.id != OLD.id THEN RAISE(ABORT, 'Save changes as a new note version') END;
 SELECT CASE WHEN NEW.status NOT IN ('draft','finalized') OR (NEW.status = 'finalized' AND NEW.finalizedAt IS NULL) OR (NEW.status = 'draft' AND NEW.finalizedAt IS NOT NULL) THEN RAISE(ABORT, 'Invalid finalization') END;
END;
CREATE TRIGGER patient_archive_not_delete BEFORE DELETE ON Patient BEGIN
 SELECT RAISE(ABORT, 'Archive patients rather than deleting them');
END;
