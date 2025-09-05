import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }

    // Use Joi-parsed value so defaults and coercions apply
    req.body = value;
    next();
  };
};

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('company_admin', 'project_manager', 'foreman', 'worker', 'client').optional(),
  company_name: Joi.string().required()
});

export const createProjectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  address: Joi.string().required(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  estimated_duration: Joi.number().positive().optional(),
  total_budget: Joi.number().positive().optional(),
  contract_value: Joi.number().positive().optional(),
  client_id: Joi.string().uuid().optional(),
  project_manager_id: Joi.string().uuid().optional()
});

export const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  project_id: Joi.string().uuid().required(),
  phase_id: Joi.string().uuid().optional(),
  parent_task_id: Joi.string().uuid().optional(),
  assigned_to: Joi.string().uuid().optional(),
  start_date: Joi.date().optional(),
  due_date: Joi.date().optional(),
  estimated_hours: Joi.number().positive().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium')
});

export const createExpenseSchema = Joi.object({
  project_id: Joi.string().uuid().required(),
  budget_category_id: Joi.string().uuid().optional(),
  vendor_name: Joi.string().optional(),
  description: Joi.string().required(),
  amount: Joi.number().positive().required(),
  expense_date: Joi.date().required()
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  address: Joi.string().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  estimated_duration: Joi.number().positive().optional(),
  status: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled').optional(),
  total_budget: Joi.number().positive().optional(),
  contract_value: Joi.number().positive().optional(),
  profit_margin: Joi.number().optional()
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  assigned_to: Joi.string().uuid().optional(),
  start_date: Joi.date().optional(),
  due_date: Joi.date().optional(),
  estimated_hours: Joi.number().positive().optional(),
  actual_hours: Joi.number().min(0).optional(),
  status: Joi.string().valid('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  completion_percentage: Joi.number().min(0).max(100).optional()
});

export const createSubcontractorAssignmentSchema = Joi.object({
  subcontractor_id: Joi.string().uuid().optional(),
  business_name: Joi.string().when('subcontractor_id', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
  project_id: Joi.string().uuid().optional(),
  project_name: Joi.string().when('project_id', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  contract_amount: Joi.number().min(0).optional(),
  work_description: Joi.string().optional(),
  payment_terms: Joi.string().optional()
});

export const createSubcontractorSchema = Joi.object({
  business_name: Joi.string().min(2).max(255).required(),
  contact_name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  license_number: Joi.string().optional(),
  specialty: Joi.string().optional(),
  hourly_rate: Joi.number().min(0).optional(),
  insurance_expires: Joi.date().optional()
});
