import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/User';
import { AppDataSource } from '../config/database';
import axios from 'axios';

export class AdminController {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role = '',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const queryBuilder = this.userRepository.createQueryBuilder('user');

      if (search) {
        queryBuilder.where(
          'user.email LIKE :search OR user.discordUsername LIKE :search',
          { search: `%${search}%` }
        );
      }

      if (role) {
        queryBuilder.andWhere('user.role = :role', { role });
      }

      queryBuilder
        .orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC')
        .skip(skip)
        .take(limitNum);

      const [users, total] = await queryBuilder.getManyAndCount();

      const usersWithoutPassword = users.map(user => {
        const { password, twoFactorSecret, resetPasswordToken, ...userWithoutSensitive } = user;
        return userWithoutSensitive;
      });

      res.json({
        users: usersWithoutPassword,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      console.error('[AdminController] Error getting users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({
        where: { id }
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const { password, twoFactorSecret, resetPasswordToken, ...userWithoutSensitive } = user;

      res.json({ user: userWithoutSensitive });
    } catch (error: any) {
      console.error('[AdminController] Error getting user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !Object.values(UserRole).includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id }
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const currentUserId = (req as any).userId;
      if (user.id === currentUserId) {
        res.status(400).json({ error: 'Cannot modify your own role' });
        return;
      }

      user.role = role;
      await this.userRepository.save(user);

      const { password, twoFactorSecret, resetPasswordToken, ...userWithoutSensitive } = user;

      res.json({
        message: 'User role updated successfully',
        user: userWithoutSensitive
      });
    } catch (error: any) {
      console.error('[AdminController] Error updating role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({
        where: { id }
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const currentUserId = (req as any).userId;
      if (user.id === currentUserId) {
        res.status(400).json({ error: 'Cannot delete your own account' });
        return;
      }

      const k8sServiceUrl = process.env.K8S_SERVICE_URL || 'http://k8s-service:3003';

      try {
        await axios.delete(`${k8sServiceUrl}/api/v1/bots/user/${id}`);
      } catch (error: any) {
        console.error('[AdminController] Error deleting user bots:', error.message);
        if (error.response?.status !== 404) {
          res.status(500).json({ error: 'Failed to delete user bots' });
          return;
        }
      }

      await this.userRepository.delete({ id });

      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('[AdminController] Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };

  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const totalUsers = await this.userRepository.count();
      const adminUsers = await this.userRepository.count({
        where: { role: UserRole.ADMIN }
      });
      const regularUsers = await this.userRepository.count({
        where: { role: UserRole.USER }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newUsersToday = await this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :today', { today })
        .getCount();

      const usersWithDiscord = await this.userRepository.count({
        where: { discordId: Not(null) } as any
      });

      const usersWithEmail = await this.userRepository.count({
        where: { email: Not(null) } as any
      });

      const usersWith2FA = await this.userRepository.count({
        where: { twoFactorEnabled: true }
      });

      res.json({
        total: totalUsers,
        admins: adminUsers,
        users: regularUsers,
        newToday: newUsersToday,
        withDiscord: usersWithDiscord,
        withEmail: usersWithEmail,
        with2FA: usersWith2FA
      });
    } catch (error: any) {
      console.error('[AdminController] Error getting stats:', error);
      res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  };
}

function Not(value: null): any {
  return { $ne: value };
}
