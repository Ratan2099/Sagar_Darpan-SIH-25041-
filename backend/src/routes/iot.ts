import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/iot/readings - RESEARCHER/ADMIN only
// Supports ?sensorId=&from=&to= query params
router.get('/readings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId, from, to, limit } = req.query;

    const where: Record<string, unknown> = {};
    if (sensorId) where.sensorId = sensorId as string;
    if (from || to) {
      where.timestamp = {
        ...(from ? { gte: new Date(from as string) } : {}),
        ...(to ? { lte: new Date(to as string) } : {}),
      };
    }

    const readings = await prisma.sensorReading.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
      include: {
        sensor: {
          select: { sensorName: true, latitude: true, longitude: true, status: true },
        },
      },
    });

    res.json({ count: readings.length, readings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch IoT readings.' });
  }
});

// GET /api/iot/sensors - List all sensors
router.get('/sensors', async (req: Request, res: Response): Promise<void> => {
  try {
    const sensors = await prisma.ioTSensor.findMany({
      include: {
        _count: { select: { readings: true } },
      },
    });
    res.json(sensors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sensors.' });
  }
});

export default router;
