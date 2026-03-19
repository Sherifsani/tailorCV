import fs from 'fs';
import pdfParse from 'pdf-parse';
import { prisma } from '../lib/prisma';

export async function uploadResume(userId: string, file: Express.Multer.File) {
  const dataBuffer = fs.readFileSync(file.path);
  const pdfData = await pdfParse(dataBuffer);
  const parsedText = pdfData.text.trim();

  const resume = await prisma.resume.create({
    data: {
      userId,
      filename: file.originalname,
      storagePath: file.path,
      parsedText,
    },
  });

  return resume;
}

export async function listResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    select: { id: true, filename: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getResume(id: string, userId: string) {
  const resume = await prisma.resume.findFirst({ where: { id, userId } });
  if (!resume) throw new Error('Resume not found');
  return resume;
}

export async function deleteResume(id: string, userId: string) {
  const resume = await prisma.resume.findFirst({ where: { id, userId } });
  if (!resume) throw new Error('Resume not found');

  if (fs.existsSync(resume.storagePath)) {
    fs.unlinkSync(resume.storagePath);
  }

  await prisma.resume.delete({ where: { id } });
}
