import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/weather/insights - Public/Fisherman accessible
router.get('/insights', (req: Request, res: Response): void => {
  const insights = {
    timestamp: new Date().toISOString(),
    currentConditions: {
      condition: 'Approaching Cyclone',
      windSpeed: 45,
      windUnit: 'knots',
      tideLevel: 2.8,
      tideLevelUnit: 'meters',
      seaSurfaceTemperature: 29.4,
      temperatureUnit: '°C',
      visibility: 'Poor',
      waveHeight: 4.2,
      waveUnit: 'meters',
      humidity: 89,
      advisory: 'DANGER: Do not venture into the deep sea. Coastal regions expect heavy rainfall.',
      advisoryLevel: 'RED',
    },
    catchInsights: {
      bestZones: [
        { zone: 'Coastal Zone A (Near Karwar)', probability: 15, reason: 'Rough seas - avoid' },
        { zone: 'Coastal Zone B (Mangaluru)', probability: 12, reason: 'Storm surge expected' },
      ],
      expectedCatch: [
        { species: 'Indian Mackerel', probabilityPct: 10, note: 'Schooling near surface but dangerous' },
        { species: 'Sardine', probabilityPct: 8, note: 'Storm displacing schools' },
      ],
      overallCatchProbability: 5,
      recommendation: 'Stay ashore. Cyclone Tej expected to make landfall in 18 hours.',
    },
    forecast: [
      { day: 'Today', condition: 'Cyclone Warning', wind: 45, waveHeight: 4.2, advisory: 'Red' },
      { day: 'Tomorrow', condition: 'Heavy Rain', wind: 30, waveHeight: 2.8, advisory: 'Orange' },
      { day: 'Day 3', condition: 'Moderately Rough', wind: 18, waveHeight: 1.5, advisory: 'Yellow' },
      { day: 'Day 4', condition: 'Partly Cloudy', wind: 12, waveHeight: 0.8, advisory: 'Green' },
      { day: 'Day 5', condition: 'Clear', wind: 8, waveHeight: 0.5, advisory: 'Green' },
    ],
  };

  res.json(insights);
});

export default router;
