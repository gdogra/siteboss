import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { CompanyModel } from '../models/Company';
import { comparePassword, generateToken, generateRefreshToken } from '../utils/auth';
import { LoginRequest, CreateUserRequest, ApiResponse, AuthPayload } from '../types';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      await UserModel.updateLastLogin(user.id);

      const authPayload: AuthPayload = {
        userId: user.id,
        companyId: user.company_id,
        role: user.role,
        email: user.email
      };

      const token = generateToken(authPayload);
      const refreshToken = generateRefreshToken(user.id);

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            company_id: user.company_id,
            avatar_url: user.avatar_url
          },
          token,
          refreshToken
        },
        message: 'Login successful'
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;

      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        });
        return;
      }

      // Create company first
      const company = await CompanyModel.create({
        name: userData.company_name
      });

      // Create user with the company_id
      const userCreateData: Parameters<typeof UserModel.create>[0] = {
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        role: userData.role,
        company_id: company.id
      };

      const newUser = await UserModel.create(userCreateData);

      const authPayload: AuthPayload = {
        userId: newUser.id,
        companyId: newUser.company_id,
        role: newUser.role,
        email: newUser.email
      };

      const token = generateToken(authPayload);
      const refreshToken = generateRefreshToken(newUser.id);

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role,
            company_id: newUser.company_id
          },
          token,
          refreshToken
        },
        message: 'Registration successful'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          role: user.role,
          company_id: user.company_id,
          avatar_url: user.avatar_url,
          last_login: user.last_login
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const updates = req.body;
      const updatedUser = await UserModel.updateProfile(req.user.userId, updates);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          phone: updatedUser.phone,
          role: updatedUser.role,
          company_id: updatedUser.company_id,
          avatar_url: updatedUser.avatar_url
        },
        message: 'Profile updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async logout(req: AuthRequest, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
}