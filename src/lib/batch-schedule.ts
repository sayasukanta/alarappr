import { prisma } from "@/lib/prisma";

export interface BatchScheduleStatus {
  hasRegistration: boolean;
  registrationStatus: string | null;
  isOpen: boolean;
  isLocked: boolean;
  startTime: string | null;
  endTime: string | null;
  remainingMinutes: number;
  statusMessage: string;
  batchName: string | null;
  registrationId?: number;
}

export async function getUserBatchScheduleStatus(userId: number): Promise<BatchScheduleStatus> {
  const userRegistration = await prisma.registration.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      batch: {
        include: {
          training: true,
        },
      },
    },
  });

  const now = new Date();

  if (!userRegistration) {
    return {
      hasRegistration: false,
      registrationStatus: null,
      isOpen: false,
      isLocked: true,
      startTime: null,
      endTime: null,
      remainingMinutes: 0,
      statusMessage: "Anda belum terdaftar dalam batch pelatihan manapun. Silakan mendaftar batch terlebih dahulu.",
      batchName: null,
    };
  }

  const b = userRegistration.batch;
  const batchName = b ? `Batch ${b.batchNumber} - ${b.training.title}` : null;

  if (userRegistration.registrationStatus !== "APPROVED") {
    return {
      hasRegistration: true,
      registrationStatus: userRegistration.registrationStatus,
      isOpen: false,
      isLocked: true,
      startTime: null,
      endTime: null,
      remainingMinutes: 0,
      statusMessage:
        userRegistration.registrationStatus === "MENUNGGU_VERIFIKASI"
          ? "Pendaftaran batch Anda masih dalam proses verifikasi admin. Fitur ini akan aktif setelah disetujui."
          : "Pendaftaran batch Anda belum disetujui.",
      batchName,
      registrationId: userRegistration.id,
    };
  }

  // Check tryout / exam schedule of the batch
  const isTimeValid =
    b.tryoutOpen &&
    b.tryoutEndTime !== null &&
    now <= b.tryoutEndTime &&
    (!b.tryoutStartTime || now >= b.tryoutStartTime);

  if (isTimeValid) {
    const remainingMs = Math.max(0, b.tryoutEndTime!.getTime() - now.getTime());
    const remMin = Math.max(1, Math.ceil(remainingMs / 60000));
    return {
      hasRegistration: true,
      registrationStatus: userRegistration.registrationStatus,
      isOpen: true,
      isLocked: false,
      startTime: b.tryoutStartTime?.toISOString() || null,
      endTime: b.tryoutEndTime?.toISOString() || null,
      remainingMinutes: remMin,
      statusMessage: `Sesi aktif (${b.training.title}) hingga pukul ${b.tryoutEndTime!.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB.`,
      batchName,
      registrationId: userRegistration.id,
    };
  }

  if (b.tryoutEndTime && now > b.tryoutEndTime) {
    return {
      hasRegistration: true,
      registrationStatus: userRegistration.registrationStatus,
      isOpen: false,
      isLocked: true,
      startTime: b.tryoutStartTime?.toISOString() || null,
      endTime: b.tryoutEndTime?.toISOString() || null,
      remainingMinutes: 0,
      statusMessage: "Waktu pelaksanaan ujian / sesi batch Anda telah berakhir dan ditutup secara otomatis oleh sistem.",
      batchName,
      registrationId: userRegistration.id,
    };
  }

  return {
    hasRegistration: true,
    registrationStatus: userRegistration.registrationStatus,
    isOpen: false,
    isLocked: true,
    startTime: b.tryoutStartTime?.toISOString() || null,
    endTime: b.tryoutEndTime?.toISOString() || null,
    remainingMinutes: 0,
    statusMessage: "Sesi ujian / praktikum untuk batch Anda saat ini belum dibuka oleh Admin / Pengawas.",
    batchName,
    registrationId: userRegistration.id,
  };
}
