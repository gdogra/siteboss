import axios from 'axios';
import { SlackConfig } from '../../types/enhanced';
import pool from '../../database/connection';

export class SlackIntegration {
  private config: SlackConfig;
  private baseURL = 'https://slack.com/api';

  constructor(config: SlackConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'POST', data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.config.bot_token}`,
          'Content-Type': 'application/json'
        },
        data
      });

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return response.data;
    } catch (error) {
      console.error('Slack API request failed:', error);
      throw error;
    }
  }

  // Send project notifications
  async sendProjectNotification(projectId: string, message: string, type: 'created' | 'updated' | 'completed' | 'delayed' = 'updated'): Promise<void> {
    try {
      if (!this.config.notification_types.includes('project_updates')) {
        return;
      }

      const projectQuery = `
        SELECT p.name, p.status, CONCAT(u.first_name, ' ', u.last_name) as project_manager
        FROM projects p
        LEFT JOIN users u ON p.project_manager_id = u.id
        WHERE p.id = $1
      `;
      
      const project = await pool.query(projectQuery, [projectId]);
      const projectData = project.rows[0];

      if (!projectData) return;

      const emoji = this.getEmojiForType(type);
      const color = this.getColorForType(type);

      const slackMessage = {
        channel: this.config.default_channel,
        text: `${emoji} Project ${type}: ${projectData.name}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji} *Project ${type.toUpperCase()}*\n*${projectData.name}*\n${message}`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Status:*\n${projectData.status.replace('_', ' ').toUpperCase()}`
              },
              {
                type: 'mrkdwn',
                text: `*Project Manager:*\n${projectData.project_manager || 'Unassigned'}`
              }
            ]
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Project'
                },
                url: `${process.env.FRONTEND_URL}/projects/${projectId}`,
                action_id: 'view_project'
              }
            ]
          }
        ],
        attachments: [
          {
            color,
            footer: 'SiteBoss Project Management',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      await this.makeRequest('chat.postMessage', 'POST', slackMessage);
      console.log(`Slack notification sent for project: ${projectData.name}`);
    } catch (error) {
      console.error('Failed to send Slack project notification:', error);
    }
  }

  // Send task notifications
  async sendTaskNotification(taskId: string, message: string, type: 'assigned' | 'completed' | 'overdue' = 'assigned'): Promise<void> {
    try {
      if (!this.config.notification_types.includes('task_updates')) {
        return;
      }

      const taskQuery = `
        SELECT t.title, t.status, t.priority, t.due_date,
               p.name as project_name,
               CONCAT(assigned.first_name, ' ', assigned.last_name) as assigned_to_name,
               assigned.external_slack_id
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        LEFT JOIN users assigned ON t.assigned_to = assigned.id
        WHERE t.id = $1
      `;
      
      const task = await pool.query(taskQuery, [taskId]);
      const taskData = task.rows[0];

      if (!taskData) return;

      const emoji = this.getEmojiForTaskType(type);
      const color = this.getColorForPriority(taskData.priority);

      // Send to assigned user if they have Slack ID, otherwise to default channel
      const channel = taskData.external_slack_id || this.config.default_channel;

      const slackMessage = {
        channel,
        text: `${emoji} Task ${type}: ${taskData.title}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji} *Task ${type.toUpperCase()}*\n*${taskData.title}*\n${message}`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Project:*\n${taskData.project_name}`
              },
              {
                type: 'mrkdwn',
                text: `*Priority:*\n${taskData.priority.toUpperCase()}`
              },
              {
                type: 'mrkdwn',
                text: `*Status:*\n${taskData.status.replace('_', ' ').toUpperCase()}`
              },
              {
                type: 'mrkdwn',
                text: `*Due Date:*\n${taskData.due_date ? new Date(taskData.due_date).toLocaleDateString() : 'Not set'}`
              }
            ]
          }
        ],
        attachments: [
          {
            color,
            footer: 'SiteBoss Task Management',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      await this.makeRequest('chat.postMessage', 'POST', slackMessage);
      console.log(`Slack notification sent for task: ${taskData.title}`);
    } catch (error) {
      console.error('Failed to send Slack task notification:', error);
    }
  }

  // Send budget alerts
  async sendBudgetAlert(projectId: string, alertType: 'warning' | 'critical', currentSpend: number, budgetLimit: number): Promise<void> {
    try {
      if (!this.config.notification_types.includes('budget_alerts')) {
        return;
      }

      const projectQuery = `
        SELECT name, total_budget, CONCAT(u.first_name, ' ', u.last_name) as project_manager
        FROM projects p
        LEFT JOIN users u ON p.project_manager_id = u.id
        WHERE p.id = $1
      `;
      
      const project = await pool.query(projectQuery, [projectId]);
      const projectData = project.rows[0];

      if (!projectData) return;

      const utilizationPercent = (currentSpend / budgetLimit) * 100;
      const emoji = alertType === 'critical' ? '🚨' : '⚠️';
      const color = alertType === 'critical' ? '#dc3545' : '#ffc107';

      const slackMessage = {
        channel: this.config.default_channel,
        text: `${emoji} Budget Alert: ${projectData.name}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji} *BUDGET ALERT - ${alertType.toUpperCase()}*\n*${projectData.name}*\nBudget utilization has reached ${utilizationPercent.toFixed(1)}%`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Current Spend:*\n$${currentSpend.toLocaleString()}`
              },
              {
                type: 'mrkdwn',
                text: `*Budget Limit:*\n$${budgetLimit.toLocaleString()}`
              },
              {
                type: 'mrkdwn',
                text: `*Remaining:*\n$${(budgetLimit - currentSpend).toLocaleString()}`
              },
              {
                type: 'mrkdwn',
                text: `*Project Manager:*\n${projectData.project_manager || 'Unassigned'}`
              }
            ]
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Budget'
                },
                url: `${process.env.FRONTEND_URL}/projects/${projectId}/budget`,
                action_id: 'view_budget'
              }
            ]
          }
        ],
        attachments: [
          {
            color,
            footer: 'SiteBoss Budget Management',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      await this.makeRequest('chat.postMessage', 'POST', slackMessage);
      console.log(`Slack budget alert sent for project: ${projectData.name}`);
    } catch (error) {
      console.error('Failed to send Slack budget alert:', error);
    }
  }

  // Send safety incident alerts
  async sendSafetyAlert(incidentId: string): Promise<void> {
    try {
      if (!this.config.notification_types.includes('safety_alerts')) {
        return;
      }

      const incidentQuery = `
        SELECT si.description, si.severity, si.incident_date, si.location,
               p.name as project_name,
               CONCAT(u.first_name, ' ', u.last_name) as reported_by
        FROM safety_incidents si
        JOIN projects p ON si.project_id = p.id
        LEFT JOIN users u ON si.reported_by = u.id
        WHERE si.id = $1
      `;
      
      const incident = await pool.query(incidentQuery, [incidentId]);
      const incidentData = incident.rows[0];

      if (!incidentData) return;

      const emoji = '🚨';
      const color = '#dc3545'; // Red for safety incidents

      const slackMessage = {
        channel: this.config.default_channel,
        text: `${emoji} Safety Incident Reported`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji} *SAFETY INCIDENT REPORTED*\n*${incidentData.project_name}*\n${incidentData.description}`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Severity:*\n${incidentData.severity.toUpperCase()}`
              },
              {
                type: 'mrkdwn',
                text: `*Location:*\n${incidentData.location || 'Not specified'}`
              },
              {
                type: 'mrkdwn',
                text: `*Date/Time:*\n${new Date(incidentData.incident_date).toLocaleString()}`
              },
              {
                type: 'mrkdwn',
                text: `*Reported By:*\n${incidentData.reported_by || 'Anonymous'}`
              }
            ]
          }
        ],
        attachments: [
          {
            color,
            footer: 'SiteBoss Safety Management',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      await this.makeRequest('chat.postMessage', 'POST', slackMessage);
      console.log(`Slack safety alert sent for incident: ${incidentId}`);
    } catch (error) {
      console.error('Failed to send Slack safety alert:', error);
    }
  }

  // Daily project summary
  async sendDailyProjectSummary(companyId: string): Promise<void> {
    try {
      if (!this.config.notification_types.includes('daily_summary')) {
        return;
      }

      // Get project stats for today
      const statsQuery = `
        SELECT 
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as new_projects_today,
          COUNT(CASE WHEN DATE(updated_at) = CURRENT_DATE AND status = 'completed' THEN 1 END) as completed_today
        FROM projects 
        WHERE company_id = $1
      `;

      const taskStatsQuery = `
        SELECT 
          COUNT(CASE WHEN status = 'completed' AND DATE(updated_at) = CURRENT_DATE THEN 1 END) as completed_tasks_today,
          COUNT(CASE WHEN due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_tasks
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE p.company_id = $1
      `;

      const [projectStats, taskStats] = await Promise.all([
        pool.query(statsQuery, [companyId]),
        pool.query(taskStatsQuery, [companyId])
      ]);

      const pStats = projectStats.rows[0];
      const tStats = taskStats.rows[0];

      const slackMessage = {
        channel: this.config.default_channel,
        text: '📊 Daily Project Summary',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📊 *Daily Project Summary - ${new Date().toLocaleDateString()}*`
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Active Projects:*\n${pStats.active_projects}`
              },
              {
                type: 'mrkdwn',
                text: `*New Projects Today:*\n${pStats.new_projects_today}`
              },
              {
                type: 'mrkdwn',
                text: `*Completed Today:*\n${pStats.completed_today} projects`
              },
              {
                type: 'mrkdwn',
                text: `*Tasks Completed:*\n${tStats.completed_tasks_today}`
              }
            ]
          }
        ]
      };

      // Add warning for overdue tasks
      if (parseInt(tStats.overdue_tasks) > 0) {
        slackMessage.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `⚠️ *${tStats.overdue_tasks} tasks are overdue*`
          }
        });
      }

      slackMessage.blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Open Dashboard'
            },
            url: `${process.env.FRONTEND_URL}/dashboard`,
            action_id: 'open_dashboard'
          }
        ]
      });

      await this.makeRequest('chat.postMessage', 'POST', slackMessage);
      console.log('Daily project summary sent to Slack');
    } catch (error) {
      console.error('Failed to send daily summary to Slack:', error);
    }
  }

  // Handle Slack slash commands
  async handleSlashCommand(command: string, text: string, userId: string, channelId: string): Promise<any> {
    try {
      switch (command) {
        case '/siteboss-status':
          return await this.handleStatusCommand(text, userId);
        case '/siteboss-create-task':
          return await this.handleCreateTaskCommand(text, userId);
        case '/siteboss-projects':
          return await this.handleProjectsCommand(userId);
        default:
          return {
            response_type: 'ephemeral',
            text: 'Unknown command. Try `/siteboss-status`, `/siteboss-projects`, or `/siteboss-create-task`'
          };
      }
    } catch (error) {
      console.error('Error handling Slack slash command:', error);
      return {
        response_type: 'ephemeral',
        text: 'Sorry, there was an error processing your command.'
      };
    }
  }

  private async handleStatusCommand(projectName: string, slackUserId: string): Promise<any> {
    const userQuery = `
      SELECT company_id FROM users 
      WHERE external_slack_id = $1
    `;
    
    const user = await pool.query(userQuery, [slackUserId]);
    if (user.rows.length === 0) {
      return {
        response_type: 'ephemeral',
        text: 'Your Slack account is not linked to SiteBoss. Please contact your administrator.'
      };
    }

    const projectQuery = `
      SELECT name, status, total_budget, start_date, end_date
      FROM projects 
      WHERE company_id = $1 AND name ILIKE $2
      LIMIT 1
    `;
    
    const project = await pool.query(projectQuery, [user.rows[0].company_id, `%${projectName}%`]);
    
    if (project.rows.length === 0) {
      return {
        response_type: 'ephemeral',
        text: `No project found matching "${projectName}"`
      };
    }

    const proj = project.rows[0];
    
    return {
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Project Status: ${proj.name}*`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Status:* ${proj.status.replace('_', ' ').toUpperCase()}`
            },
            {
              type: 'mrkdwn',
              text: `*Budget:* $${proj.total_budget?.toLocaleString() || 'Not set'}`
            }
          ]
        }
      ]
    };
  }

  private async handleProjectsCommand(slackUserId: string): Promise<any> {
    const userQuery = `
      SELECT company_id FROM users 
      WHERE external_slack_id = $1
    `;
    
    const user = await pool.query(userQuery, [slackUserId]);
    if (user.rows.length === 0) {
      return {
        response_type: 'ephemeral',
        text: 'Your Slack account is not linked to SiteBoss.'
      };
    }

    const projectsQuery = `
      SELECT name, status, total_budget
      FROM projects 
      WHERE company_id = $1 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const projects = await pool.query(projectsQuery, [user.rows[0].company_id]);
    
    if (projects.rows.length === 0) {
      return {
        response_type: 'ephemeral',
        text: 'No active projects found.'
      };
    }

    const projectList = projects.rows.map(p => 
      `• *${p.name}* - ${p.status.replace('_', ' ').toUpperCase()} - $${p.total_budget?.toLocaleString() || 'Budget TBD'}`
    ).join('\n');

    return {
      response_type: 'ephemeral',
      text: `*Active Projects:*\n${projectList}`
    };
  }

  private getEmojiForType(type: string): string {
    const emojiMap: { [key: string]: string } = {
      'created': '🎉',
      'updated': '📝',
      'completed': '✅',
      'delayed': '⚠️'
    };
    return emojiMap[type] || '📋';
  }

  private getEmojiForTaskType(type: string): string {
    const emojiMap: { [key: string]: string } = {
      'assigned': '👤',
      'completed': '✅',
      'overdue': '🚨'
    };
    return emojiMap[type] || '📋';
  }

  private getColorForType(type: string): string {
    const colorMap: { [key: string]: string } = {
      'created': '#28a745',
      'updated': '#007bff',
      'completed': '#28a745',
      'delayed': '#ffc107'
    };
    return colorMap[type] || '#6c757d';
  }

  private getColorForPriority(priority: string): string {
    const colorMap: { [key: string]: string } = {
      'low': '#28a745',
      'medium': '#ffc107',
      'high': '#fd7e14',
      'critical': '#dc3545'
    };
    return colorMap[priority] || '#6c757d';
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('auth.test', 'GET');
      return response.ok;
    } catch (error) {
      console.error('Slack connection test failed:', error);
      return false;
    }
  }

  // Get team info
  async getTeamInfo(): Promise<any> {
    try {
      const response = await this.makeRequest('team.info', 'GET');
      return response.team;
    } catch (error) {
      console.error('Error fetching team info:', error);
      return null;
    }
  }
}