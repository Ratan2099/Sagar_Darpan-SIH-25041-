import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/analytics/population-models - RESEARCHER/ADMIN only
// Returns aggregated data for frontend AI statistical charts
router.get('/population-models', (req: Request, res: Response): void => {
  const years = [2020, 2021, 2022, 2023, 2024, 2025];

  // Coral reef biodiversity index: 15% decline over 5 years
  const coralBiodiversityIndex = [100, 98.2, 95.1, 91.4, 87.3, 85.0];
  const seaSurfaceTemperature = [28.0, 28.2, 28.5, 28.9, 29.1, 29.2];

  // Fish population vs salinity scatter data
  const fishSalinityScatter = Array.from({ length: 30 }, (_, i) => ({
    salinity: 30 + Math.random() * 10,
    population: Math.round(800 + Math.random() * 400 - i * 8),
    species: ['Mackerel', 'Sardine', 'Tuna', 'Pomfret', 'Hilsa'][Math.floor(Math.random() * 5)],
  }));

  // Climate risk heatmap data (regions x metrics)
  const climateRiskGrid = [
    { region: 'Arabian Sea North', temperatureRisk: 0.72, acidificationRisk: 0.65, biodiversityLoss: 0.58 },
    { region: 'Arabian Sea South', temperatureRisk: 0.68, acidificationRisk: 0.71, biodiversityLoss: 0.62 },
    { region: 'Bay of Bengal North', temperatureRisk: 0.80, acidificationRisk: 0.55, biodiversityLoss: 0.75 },
    { region: 'Bay of Bengal South', temperatureRisk: 0.74, acidificationRisk: 0.60, biodiversityLoss: 0.68 },
    { region: 'Lakshadweep Sea', temperatureRisk: 0.65, acidificationRisk: 0.80, biodiversityLoss: 0.72 },
    { region: 'Andaman Sea', temperatureRisk: 0.70, acidificationRisk: 0.68, biodiversityLoss: 0.66 },
  ];

  // Dissolved oxygen trends - declining
  const dissolvedOxygenTrend = years.map((year, i) => ({
    year,
    avgDO: parseFloat((7.2 - i * 0.18).toFixed(2)),
    minDO: parseFloat((5.8 - i * 0.15).toFixed(2)),
  }));

  // pH decline (ocean acidification)
  const phTrend = years.map((year, i) => ({
    year,
    avgPH: parseFloat((8.12 - i * 0.015).toFixed(3)),
  }));

  res.json({
    coralReefDecline: {
      labels: years,
      biodiversityIndex: coralBiodiversityIndex,
      seaSurfaceTemp: seaSurfaceTemperature,
      netDeclinePercent: 15,
      tempRise: 1.2,
    },
    fishSalinityScatter,
    climateRiskGrid,
    dissolvedOxygenTrend,
    phTrend,
    summary: {
      coralDeclinePct: 15,
      sstRiseDegC: 1.2,
      avgPhDrop: 0.075,
      speciesAtRisk: 8,
    },
  });
});

export default router;
