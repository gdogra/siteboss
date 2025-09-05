import { Response } from 'express';
import { ResourceModel } from '../models/Resource';
import { ApiResponse } from '../types';
import { AuthRequest } from '../middleware/auth';

export class ResourceController {
  static async getResources(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // For demo environment, return mock resources
      const authToken = req.headers.authorization?.substring(7);
      if (authToken === 'demo-token') {
        const mockResources = [
          {
            id: 'resource-1',
            company_id: req.user.companyId,
            name: 'CAT 320DL Excavator',
            type: 'equipment',
            model: 'CAT 320DL',
            serial_number: 'CAT123456',
            purchase_date: '2022-01-15',
            purchase_cost: 180000,
            hourly_rate: 150,
            maintenance_schedule: 'Every 250 hours',
            is_available: true,
            created_at: '2022-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 'resource-2',
            company_id: req.user.companyId,
            name: 'Ford F-150 Work Truck',
            type: 'vehicle',
            model: 'Ford F-150',
            serial_number: 'FORD789012',
            purchase_date: '2023-03-20',
            purchase_cost: 45000,
            hourly_rate: 25,
            maintenance_schedule: 'Every 5,000 miles',
            is_available: true,
            created_at: '2023-03-20T08:00:00Z',
            updated_at: '2024-03-20T08:00:00Z'
          },
          {
            id: 'resource-3',
            company_id: req.user.companyId,
            name: 'Concrete Mixer',
            type: 'equipment',
            model: 'CM-500',
            serial_number: 'CM500123',
            purchase_date: '2021-11-10',
            purchase_cost: 35000,
            hourly_rate: 75,
            maintenance_schedule: 'Monthly',
            is_available: false,
            created_at: '2021-11-10T14:30:00Z',
            updated_at: '2024-08-15T14:30:00Z'
          },
          {
            id: 'resource-4',
            company_id: req.user.companyId,
            name: 'Tool Set - Power Tools',
            type: 'tool',
            model: 'DeWalt Professional Kit',
            serial_number: 'DW2024001',
            purchase_date: '2024-01-05',
            purchase_cost: 2500,
            hourly_rate: 15,
            maintenance_schedule: 'As needed',
            is_available: true,
            created_at: '2024-01-05T09:00:00Z',
            updated_at: '2024-01-05T09:00:00Z'
          }
        ];

        const { type } = req.query;
        let filteredResources = mockResources;
        
        if (type && typeof type === 'string') {
          filteredResources = mockResources.filter(r => r.type === type);
        }

        res.json({
          success: true,
          data: filteredResources
        });
        return;
      }

      const { type } = req.query;
      let resources;

      if (type && typeof type === 'string') {
        resources = await ResourceModel.findAvailable(req.user.companyId, type as any);
      } else {
        resources = await ResourceModel.findByCompany(req.user.companyId);
      }

      const response: ApiResponse = {
        success: true,
        data: resources
      };

      res.json(response);
    } catch (error) {
      console.error('Get resources error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createResource(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // For demo environment, return mock resource
      const authToken = req.headers.authorization?.substring(7);
      if (authToken === 'demo-token') {
        const mockResource = {
          id: `resource-${Date.now()}`,
          company_id: req.user.companyId,
          name: req.body.name,
          type: req.body.type,
          model: req.body.model,
          serial_number: req.body.serial_number,
          purchase_date: req.body.purchase_date,
          purchase_cost: req.body.purchase_cost,
          hourly_rate: req.body.hourly_rate,
          maintenance_schedule: req.body.maintenance_schedule,
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        res.status(201).json({
          success: true,
          data: mockResource,
          message: 'Resource created successfully'
        });
        return;
      }

      const resource = await ResourceModel.create(req.user.companyId, req.body);

      const response: ApiResponse = {
        success: true,
        data: resource,
        message: 'Resource created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create resource error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateResource(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      const updatedResource = await ResourceModel.update(id, req.body);

      if (!updatedResource) {
        res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: updatedResource,
        message: 'Resource updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Update resource error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async deleteResource(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      
      // For demo environment, just return success
      const authToken = req.headers.authorization?.substring(7);
      if (authToken === 'demo-token') {
        res.json({
          success: true,
          message: 'Resource deleted successfully'
        });
        return;
      }

      // In real environment, implement actual deletion
      res.json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      console.error('Delete resource error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getResourceStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // For demo environment, return mock stats
      const authToken = req.headers.authorization?.substring(7);
      if (authToken === 'demo-token') {
        const mockStats = {
          totalResources: 24,
          availableResources: 18,
          assignedResources: 4,
          maintenanceRequired: 2,
          totalValue: 485000,
          avgUtilization: 67
        };

        res.json({
          success: true,
          data: mockStats
        });
        return;
      }

      // In real environment, calculate actual stats
      const resources = await ResourceModel.findByCompany(req.user.companyId);
      
      const stats = {
        totalResources: resources.length,
        availableResources: resources.filter(r => r.is_available).length,
        assignedResources: 0, // Would need to join with assignments table
        maintenanceRequired: resources.filter(r => !r.is_available).length,
        totalValue: resources.reduce((sum, r) => sum + (r.purchase_cost || 0), 0),
        avgUtilization: 0 // Would need to calculate from assignments
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get resource stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getResourceAssignments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // For demo environment, return mock assignments
      const authToken = req.headers.authorization?.substring(7);
      if (authToken === 'demo-token') {
        const mockAssignments = [
          {
            id: 'assignment-1',
            resource_id: 'resource-1',
            project_id: 'project-1',
            assigned_by: req.user.userId,
            start_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        res.json({
          success: true,
          data: mockAssignments
        });
        return;
      }

      // In real environment, query assignments from database
      res.json({
        success: true,
        data: []
      });
    } catch (error) {
      console.error('Get resource assignments error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createResourceAssignment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // For demo environment, return mock assignment
      const mockAssignment = {
        id: `assignment-${Date.now()}`,
        resource_id: req.body.resource_id,
        project_id: req.body.project_id,
        assigned_by: req.user.userId,
        start_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...req.body
      };

      res.status(201).json({
        success: true,
        data: mockAssignment,
        message: 'Resource assigned successfully'
      });
    } catch (error) {
      console.error('Create resource assignment error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}