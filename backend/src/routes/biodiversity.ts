import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/biodiversity - RESEARCHER only
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { speciesName, molecularDataSequence, observationLat, observationLon, dateRecorded } = req.body;
    const researcherId = req.user!.userId;

    if (!speciesName || !molecularDataSequence || !observationLat || !observationLon || !dateRecorded) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    const record = await prisma.biodiversityRecord.create({
      data: {
        researcherId,
        speciesName,
        molecularDataSequence,
        observationLat: parseFloat(observationLat),
        observationLon: parseFloat(observationLon),
        dateRecorded: new Date(dateRecorded),
        isApproved: false,
      },
    });

    res.status(201).json({
      message: 'Biodiversity record submitted for admin approval.',
      record,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create biodiversity record.' });
  }
});

// GET /api/biodiversity - RESEARCHER/ADMIN
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { approved } = req.query;
    const where: Record<string, unknown> = {};
    if (approved !== undefined) where.isApproved = approved === 'true';

    const records = await prisma.biodiversityRecord.findMany({
      where,
      include: {
        researcher: { select: { fullName: true, email: true } },
      },
      orderBy: { dateRecorded: 'desc' },
    });

    res.json({ count: records.length, records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch biodiversity records.' });
  }
});

// POST /api/biodiversity/request-modification - Researcher requests modification
router.post('/request-modification', async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetRecordId, modificationType, requestReason } = req.body;
    const researcherId = req.user!.userId;

    const request = await prisma.dataModificationRequest.create({
      data: {
        researcherId,
        targetRecordId,
        modificationType,
        requestReason,
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Modification request submitted.', request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create modification request.' });
  }
});

export default router;
