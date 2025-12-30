import { prisma } from "@/lib/prisma";

export const logAudit = async ({
  entityType,
  entityId,
  action,
  details,
  userId,
}: {
  entityType: string;
  entityId: string;
  action: string;
  details: Record<string, unknown>;
  userId: string;
}) => {
  await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      action,
      detailsJson: JSON.stringify(details),
      userId,
    },
  });
};
