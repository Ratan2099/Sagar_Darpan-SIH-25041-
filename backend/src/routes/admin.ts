import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/users - Admin only
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, fullName: true, role: true, createdAt: true,
        _count: { select: { biodiversityRecords: true, chatbotInteractions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ count: users.length, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// PUT /api/admin/roles/:userId - Admin only
router.put('/roles/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const validRoles = ['ADMIN', 'RESEARCHER', 'FISHERMAN', 'GENERAL'];

    if (!validRoles.includes(role)) {
      res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, fullName: true, role: true },
    });

    res.json({ message: 'Role updated successfully.', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update role.' });
  }
});

// POST /api/admin/users - Admin creates a new user
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const bcrypt = await import('bcryptjs');
    const { email, fullName, password, role } = req.body;

    const passwordHash = await bcrypt.hash(password || 'password123', 12);
    const user = await prisma.user.create({
      data: { email, fullName, passwordHash, role: role || 'GENERAL' },
      select: { id: true, email: true, fullName: true, role: true },
    });

    res.status(201).json({ message: 'User created.', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

// DELETE /api/admin/users/:userId - Admin removes a user
router.delete('/users/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (userId === req.user!.userId) {
      res.status(400).json({ error: 'Cannot delete your own admin account.' });
      return;
    }
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// GET /api/admin/requests - Admin fetches all modification requests
router.get('/requests', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const requests = await prisma.dataModificationRequest.findMany({
      where,
      include: {
        researcher: { select: { fullName: true, email: true } },
        resolvedByAdmin: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ count: requests.length, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
});

// POST /api/admin/requests/:requestId/resolve - Approve or reject
router.post('/requests/:requestId/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'APPROVED' or 'REJECTED'
    const adminId = req.user!.userId;

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      res.status(400).json({ error: 'Action must be APPROVED or REJECTED.' });
      return;
    }

    const request = await prisma.dataModificationRequest.update({
      where: { id: requestId },
      data: {
        status: action,
        resolvedByAdminId: adminId,
        resolvedAt: new Date(),
      },
    });

    // If approved and it's a DELETE request, remove the target record
    if (action === 'APPROVED' && request.modificationType === 'DELETE') {
      try {
        await prisma.biodiversityRecord.delete({ where: { id: request.targetRecordId } });
      } catch {
        // Record may already be deleted
      }
    }

    res.json({ message: `Request ${action.toLowerCase()}.`, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve request.' });
  }
});

export default router;
