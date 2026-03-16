import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Mock species database for Matsya responses
const speciesDatabase: Record<string, { species: string; scientificName: string; marketRate: string; status: string; description: string }> = {
  default: {
    species: 'Indian Mackerel',
    scientificName: 'Rastrelliger kanagurta',
    marketRate: '₹200/kg',
    status: 'Least Concern',
    description: 'Based on the dorsal fin structure and distinctive blue-green coloration with golden stripes, this is an Indian Mackerel. It is one of the most commercially important fish along the Indian coast.',
  },
  mackerel: {
    species: 'Indian Mackerel',
    scientificName: 'Rastrelliger kanagurta',
    marketRate: '₹200/kg',
    status: 'Least Concern',
    description: 'Based on the dorsal fin and coloration, this is an Indian Mackerel (Rastrelliger kanagurta). Current market rate is ₹200/kg. Status: Least Concern.',
  },
  pomfret: {
    species: 'Silver Pomfret',
    scientificName: 'Pampus argenteus',
    marketRate: '₹800/kg',
    status: 'Near Threatened',
    description: 'This is a Silver Pomfret, identified by its diamond-shaped body and forked tail. High-value fish in the Indian market.',
  },
  tuna: {
    species: 'Yellowfin Tuna',
    scientificName: 'Thunnus albacares',
    marketRate: '₹450/kg',
    status: 'Near Threatened',
    description: 'This appears to be a Yellowfin Tuna. Note the distinctive yellow dorsal fin. Regulated catch — check local quotas.',
  },
};

// POST /api/matsya/chat - Fisherman only (enforced in server.ts via RBAC middleware)
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, imageUrl } = req.body;
    const fishermanId = req.user!.userId;

    if (!message) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    // Determine response based on message content
    let responseData = speciesDatabase.default;
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('pomfret')) responseData = speciesDatabase.pomfret;
    else if (lowerMsg.includes('tuna')) responseData = speciesDatabase.tuna;
    else if (lowerMsg.includes('mackerel')) responseData = speciesDatabase.mackerel;

    const matsyaResponse = imageUrl
      ? `Based on the dorsal fin and coloration, this is an **${responseData.species}** (*${responseData.scientificName}*). Current market rate is **${responseData.marketRate}**. Conservation Status: **${responseData.status}**. ${responseData.description}`
      : `Namaste! I am Matsya, your fishing guide. ${message.includes('?') ? `For fish identification, please upload an image. I can identify species from their fin structure and coloration.` : `How can I help you today? You can ask me about fishing conditions, species identification, or market rates.`}`;

    // Log interaction to database
    const interaction = await prisma.chatbotInteraction.create({
      data: {
        fishermanId,
        userMessage: message,
        imageUrl: imageUrl || null,
        matsyaResponse,
        identifiedSpecies: imageUrl ? responseData.species : null,
        marketValue: imageUrl ? parseFloat(responseData.marketRate.replace(/[^0-9.]/g, '')) : null,
      },
    });

    res.json({
      id: interaction.id,
      response: matsyaResponse,
      identifiedSpecies: interaction.identifiedSpecies,
      marketValue: interaction.marketValue,
      timestamp: interaction.timestamp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Matsya encountered an error. Please try again.' });
  }
});

// GET /api/matsya/history - Fisherman chat history
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const fishermanId = req.user!.userId;
    const history = await prisma.chatbotInteraction.findMany({
      where: { fishermanId },
      orderBy: { timestamp: 'asc' },
      take: 50,
    });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
});

export default router;
