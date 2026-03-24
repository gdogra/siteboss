export interface FinancialProduct {
  id: string;
  type: 'project_loan' | 'equipment_financing' | 'working_capital' | 'invoice_factoring' | 'line_of_credit';
  provider: FinancialProvider;
  interestRate: number;
  termMonths: number;
  maxAmount: number;
  minAmount: number;
  requirements: LoanRequirement[];
  features: string[];
  processingTime: number; // days
  fees: LoanFees;
  approval: {
    preApprovalAvailable: boolean;
    averageApprovalTime: number; // days
    approvalRate: number; // 0-1
  };
  rating: {
    customerRating: number; // 1-5
    reviewCount: number;
    trustScore: number; // 0-1
  };
}

export interface FinancialProvider {
  id: string;
  name: string;
  type: 'traditional_bank' | 'credit_union' | 'online_lender' | 'fintech' | 'construction_specialist';
  establishedYear: number;
  headquarters: string;
  licenses: string[];
  specializations: string[];
  customerSupport: {
    phone: string;
    email: string;
    hours: string;
    languages: string[];
  };
  partnershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface LoanRequirement {
  type: 'credit_score' | 'annual_revenue' | 'time_in_business' | 'collateral' | 'guarantor' | 'documentation';
  description: string;
  minimumValue?: number;
  required: boolean;
  alternativeOptions?: string[];
}

export interface LoanFees {
  originationFee: number; // percentage
  processingFee: number; // flat amount
  earlyPaymentPenalty: number; // percentage
  latePaymentFee: number; // flat amount
  annualFee?: number; // flat amount
}

export interface FinancingRequest {
  projectId: string;
  requestId: string;
  amount: number;
  purpose: 'equipment_purchase' | 'working_capital' | 'project_funding' | 'expansion' | 'emergency';
  timeline: {
    needByDate: Date;
    projectStartDate: Date;
    projectEndDate: Date;
  };
  applicant: {
    businessName: string;
    ein: string;
    yearsInBusiness: number;
    annualRevenue: number;
    creditScore: number;
    location: string;
  };
  project: {
    type: string;
    value: number;
    duration: number;
    contracts: ContractInfo[];
  };
  collateral?: CollateralInfo[];
}

export interface ContractInfo {
  clientName: string;
  contractValue: number;
  startDate: Date;
  completionDate: Date;
  paymentTerms: string;
  verified: boolean;
}

export interface CollateralInfo {
  type: 'equipment' | 'real_estate' | 'inventory' | 'accounts_receivable';
  description: string;
  estimatedValue: number;
  location: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface FinancingRecommendation {
  product: FinancialProduct;
  matchScore: number; // 0-100
  approvalProbability: number; // 0-1
  estimatedRate: number;
  monthlyPayment: number;
  totalCost: number;
  advantages: string[];
  disadvantages: string[];
  riskFactors: string[];
  nextSteps: string[];
  preApprovalUrl?: string;
}

export interface MarketplaceAnalytics {
  averageRates: {
    projectLoans: number;
    equipmentFinancing: number;
    workingCapital: number;
  };
  marketTrends: {
    rateDirection: 'rising' | 'falling' | 'stable';
    popularProducts: string[];
    seasonalFactors: string[];
  };
  competitiveAnalysis: {
    bestRates: FinancialProduct[];
    fastestApproval: FinancialProduct[];
    highestApproval: FinancialProduct[];
  };
}

export interface ApplicationStatus {
  applicationId: string;
  status: 'submitted' | 'under_review' | 'approved' | 'declined' | 'pending_documents';
  provider: string;
  submittedDate: Date;
  lastUpdated: Date;
  estimatedDecisionDate?: Date;
  requiredDocuments: string[];
  notes: string[];
  contactInfo: {
    representative: string;
    phone: string;
    email: string;
  };
}

export interface PaymentProcessing {
  providerId: string;
  capabilities: string[];
  transactionFees: {
    creditCard: number; // percentage
    bankTransfer: number; // flat fee
    check: number; // flat fee
  };
  settlementTime: {
    creditCard: number; // days
    bankTransfer: number; // days
  };
  integration: {
    apiAvailable: boolean;
    webhookSupport: boolean;
    mobileApp: boolean;
  };
}

class FinancialMarketplaceService {
  private financialProducts: Map<string, FinancialProduct> = new Map();
  private providers: Map<string, FinancialProvider> = new Map();
  private applications: Map<string, ApplicationStatus[]> = new Map();
  private marketData: MarketplaceAnalytics | null = null;

  constructor() {
    this.initializeMarketplace();
  }

  private initializeMarketplace() {
    // Initialize sample financial providers and products
    this.initializeProviders();
    this.initializeProducts();
    this.updateMarketData();
  }

  private initializeProviders() {
    const sampleProviders: FinancialProvider[] = [
      {
        id: 'construction-capital',
        name: 'Construction Capital Partners',
        type: 'construction_specialist',
        establishedYear: 2015,
        headquarters: 'Atlanta, GA',
        licenses: ['NMLS-12345', 'Georgia Department of Banking'],
        specializations: ['construction_loans', 'equipment_financing', 'bridge_loans'],
        customerSupport: {
          phone: '1-800-BUILD-NOW',
          email: 'support@constructioncapital.com',
          hours: 'Mon-Fri 8AM-6PM EST',
          languages: ['English', 'Spanish']
        },
        partnershipLevel: 'platinum'
      },
      {
        id: 'rapid-funding',
        name: 'RapidFunding Solutions',
        type: 'fintech',
        establishedYear: 2018,
        headquarters: 'San Francisco, CA',
        licenses: ['California DFI License', 'Multi-state licenses'],
        specializations: ['working_capital', 'quick_approval', 'online_lending'],
        customerSupport: {
          phone: '1-888-RAPID-01',
          email: 'help@rapidfunding.com',
          hours: '24/7 Chat Support',
          languages: ['English', 'Spanish', 'French']
        },
        partnershipLevel: 'gold'
      },
      {
        id: 'first-national-construction',
        name: 'First National Construction Bank',
        type: 'traditional_bank',
        establishedYear: 1952,
        headquarters: 'Dallas, TX',
        licenses: ['FDIC Insured', 'OCC Charter'],
        specializations: ['large_projects', 'established_contractors', 'comprehensive_banking'],
        customerSupport: {
          phone: '1-800-FNC-BANK',
          email: 'commercial@fncbank.com',
          hours: 'Mon-Fri 9AM-5PM CST',
          languages: ['English']
        },
        partnershipLevel: 'silver'
      }
    ];

    sampleProviders.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  private initializeProducts() {
    const sampleProducts: FinancialProduct[] = [
      {
        id: 'cc-project-loan-1',
        type: 'project_loan',
        provider: this.providers.get('construction-capital')!,
        interestRate: 8.5,
        termMonths: 24,
        maxAmount: 2000000,
        minAmount: 50000,
        requirements: [
          {
            type: 'credit_score',
            description: 'Minimum credit score of 680',
            minimumValue: 680,
            required: true
          },
          {
            type: 'time_in_business',
            description: 'At least 2 years in construction business',
            minimumValue: 2,
            required: true
          },
          {
            type: 'annual_revenue',
            description: 'Minimum annual revenue of $500K',
            minimumValue: 500000,
            required: true
          }
        ],
        features: [
          'Interest-only payments during construction',
          'Flexible draw schedule',
          'No prepayment penalties',
          'Dedicated project manager'
        ],
        processingTime: 5,
        fees: {
          originationFee: 1.5,
          processingFee: 500,
          earlyPaymentPenalty: 0,
          latePaymentFee: 150
        },
        approval: {
          preApprovalAvailable: true,
          averageApprovalTime: 3,
          approvalRate: 0.78
        },
        rating: {
          customerRating: 4.6,
          reviewCount: 245,
          trustScore: 0.89
        }
      },
      {
        id: 'rf-working-capital-1',
        type: 'working_capital',
        provider: this.providers.get('rapid-funding')!,
        interestRate: 12.9,
        termMonths: 12,
        maxAmount: 500000,
        minAmount: 10000,
        requirements: [
          {
            type: 'credit_score',
            description: 'Minimum credit score of 550',
            minimumValue: 550,
            required: true
          },
          {
            type: 'time_in_business',
            description: 'At least 6 months in business',
            minimumValue: 0.5,
            required: true
          },
          {
            type: 'annual_revenue',
            description: 'Minimum annual revenue of $100K',
            minimumValue: 100000,
            required: true
          }
        ],
        features: [
          'Fast 24-hour approval',
          'No collateral required',
          'Flexible repayment terms',
          'Online application'
        ],
        processingTime: 1,
        fees: {
          originationFee: 3.0,
          processingFee: 0,
          earlyPaymentPenalty: 0,
          latePaymentFee: 75
        },
        approval: {
          preApprovalAvailable: true,
          averageApprovalTime: 1,
          approvalRate: 0.65
        },
        rating: {
          customerRating: 4.2,
          reviewCount: 892,
          trustScore: 0.82
        }
      },
      {
        id: 'fnc-equipment-loan-1',
        type: 'equipment_financing',
        provider: this.providers.get('first-national-construction')!,
        interestRate: 6.9,
        termMonths: 60,
        maxAmount: 5000000,
        minAmount: 25000,
        requirements: [
          {
            type: 'credit_score',
            description: 'Minimum credit score of 700',
            minimumValue: 700,
            required: true
          },
          {
            type: 'time_in_business',
            description: 'At least 3 years in business',
            minimumValue: 3,
            required: true
          },
          {
            type: 'collateral',
            description: 'Equipment serves as collateral',
            required: true
          }
        ],
        features: [
          'Competitive rates',
          '100% equipment financing',
          'Tax advantages',
          'Relationship banking benefits'
        ],
        processingTime: 7,
        fees: {
          originationFee: 1.0,
          processingFee: 750,
          earlyPaymentPenalty: 2.0,
          latePaymentFee: 200
        },
        approval: {
          preApprovalAvailable: false,
          averageApprovalTime: 7,
          approvalRate: 0.85
        },
        rating: {
          customerRating: 4.4,
          reviewCount: 156,
          trustScore: 0.92
        }
      }
    ];

    sampleProducts.forEach(product => {
      this.financialProducts.set(product.id, product);
    });
  }

  async getFinancingRecommendations(request: FinancingRequest): Promise<FinancingRecommendation[]> {
    try {
      const suitableProducts = await this.findSuitableProducts(request);
      const recommendations: FinancingRecommendation[] = [];

      for (const product of suitableProducts) {
        const matchScore = this.calculateMatchScore(product, request);
        const approvalProbability = this.estimateApprovalProbability(product, request);
        const estimatedRate = this.calculateEstimatedRate(product, request);
        const monthlyPayment = this.calculateMonthlyPayment(request.amount, estimatedRate, product.termMonths);
        const totalCost = monthlyPayment * product.termMonths;

        const recommendation: FinancingRecommendation = {
          product,
          matchScore,
          approvalProbability,
          estimatedRate,
          monthlyPayment,
          totalCost,
          advantages: this.getProductAdvantages(product, request),
          disadvantages: this.getProductDisadvantages(product, request),
          riskFactors: this.identifyRiskFactors(product, request),
          nextSteps: this.getNextSteps(product),
          preApprovalUrl: product.approval.preApprovalAvailable ? 
            `https://api.siteboss.com/financing/preapproval/${product.id}/${request.requestId}` : undefined
        };

        recommendations.push(recommendation);
      }

      // Sort by match score
      return recommendations.sort((a, b) => b.matchScore - a.matchScore);

    } catch (error) {
      console.error('Error generating financing recommendations:', error);
      throw new Error('Failed to generate financing recommendations');
    }
  }

  private async findSuitableProducts(request: FinancingRequest): Promise<FinancialProduct[]> {
    const suitable: FinancialProduct[] = [];

    for (const product of this.financialProducts.values()) {
      if (this.meetsBasicCriteria(product, request)) {
        suitable.push(product);
      }
    }

    return suitable;
  }

  private meetsBasicCriteria(product: FinancialProduct, request: FinancingRequest): boolean {
    // Check amount range
    if (request.amount < product.minAmount || request.amount > product.maxAmount) {
      return false;
    }

    // Check basic requirements
    for (const requirement of product.requirements) {
      if (requirement.required) {
        switch (requirement.type) {
          case 'credit_score':
            if (request.applicant.creditScore < (requirement.minimumValue || 0)) {
              return false;
            }
            break;
          case 'annual_revenue':
            if (request.applicant.annualRevenue < (requirement.minimumValue || 0)) {
              return false;
            }
            break;
          case 'time_in_business':
            if (request.applicant.yearsInBusiness < (requirement.minimumValue || 0)) {
              return false;
            }
            break;
        }
      }
    }

    return true;
  }

  private calculateMatchScore(product: FinancialProduct, request: FinancingRequest): number {
    let score = 0;

    // Purpose match (25% weight)
    const purposeMatch = this.getPurposeMatch(product.type, request.purpose);
    score += purposeMatch * 25;

    // Amount appropriateness (20% weight)
    const amountScore = this.getAmountScore(product, request.amount);
    score += amountScore * 20;

    // Speed match (20% weight)
    const speedScore = this.getSpeedScore(product, request.timeline);
    score += speedScore * 20;

    // Approval probability (15% weight)
    score += product.approval.approvalRate * 15;

    // Customer rating (10% weight)
    score += (product.rating.customerRating / 5) * 10;

    // Provider specialization (10% weight)
    const specializationScore = this.getSpecializationScore(product.provider, request);
    score += specializationScore * 10;

    return Math.round(score);
  }

  private getPurposeMatch(productType: string, requestPurpose: string): number {
    const matches: Record<string, string[]> = {
      'project_loan': ['project_funding', 'expansion'],
      'working_capital': ['working_capital', 'emergency'],
      'equipment_financing': ['equipment_purchase'],
      'line_of_credit': ['working_capital', 'emergency', 'expansion']
    };

    return matches[productType]?.includes(requestPurpose) ? 1 : 0.3;
  }

  private getAmountScore(product: FinancialProduct, amount: number): number {
    const range = product.maxAmount - product.minAmount;
    const position = (amount - product.minAmount) / range;
    
    // Optimal range is 20%-80% of max amount
    if (position >= 0.2 && position <= 0.8) {
      return 1;
    } else if (position < 0.2) {
      return position / 0.2;
    } else {
      return 1 - ((position - 0.8) / 0.2);
    }
  }

  private getSpeedScore(product: FinancialProduct, timeline: FinancingRequest['timeline']): number {
    const daysNeeded = Math.ceil((timeline.needByDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    
    if (product.processingTime <= daysNeeded) {
      return 1;
    } else {
      return Math.max(0, 1 - ((product.processingTime - daysNeeded) / daysNeeded));
    }
  }

  private getSpecializationScore(provider: FinancialProvider, request: FinancingRequest): number {
    if (provider.type === 'construction_specialist') {
      return 1;
    } else if (provider.specializations.some(spec => 
      spec.includes('construction') || spec.includes('contractor'))) {
      return 0.8;
    } else {
      return 0.5;
    }
  }

  private estimateApprovalProbability(product: FinancialProduct, request: FinancingRequest): number {
    let baseProbability = product.approval.approvalRate;
    
    // Adjust based on applicant strength
    const creditScoreReq = product.requirements.find(r => r.type === 'credit_score');
    if (creditScoreReq && creditScoreReq.minimumValue) {
      const creditOverage = request.applicant.creditScore - creditScoreReq.minimumValue;
      if (creditOverage > 0) {
        baseProbability += Math.min(0.15, creditOverage / 1000); // Max 15% boost
      }
    }

    const revenueReq = product.requirements.find(r => r.type === 'annual_revenue');
    if (revenueReq && revenueReq.minimumValue) {
      const revenueRatio = request.applicant.annualRevenue / revenueReq.minimumValue;
      if (revenueRatio > 1.5) {
        baseProbability += Math.min(0.1, (revenueRatio - 1) / 10); // Max 10% boost
      }
    }

    return Math.min(0.95, baseProbability);
  }

  private calculateEstimatedRate(product: FinancialProduct, request: FinancingRequest): number {
    let baseRate = product.interestRate;
    
    // Adjust based on risk factors
    const creditScoreReq = product.requirements.find(r => r.type === 'credit_score');
    if (creditScoreReq && creditScoreReq.minimumValue) {
      const creditOverage = request.applicant.creditScore - creditScoreReq.minimumValue;
      if (creditOverage < 50) {
        baseRate += 0.5; // Higher rate for marginal credit
      } else if (creditOverage > 100) {
        baseRate -= 0.25; // Lower rate for excellent credit
      }
    }

    // Amount-based pricing
    if (request.amount > product.maxAmount * 0.7) {
      baseRate -= 0.15; // Volume discount
    }

    return Math.max(baseRate, product.interestRate * 0.8); // Min 80% of posted rate
  }

  private calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                   (Math.pow(1 + monthlyRate, termMonths) - 1);
    return Math.round(payment);
  }

  private getProductAdvantages(product: FinancialProduct, request: FinancingRequest): string[] {
    const advantages: string[] = [...product.features];

    if (product.interestRate < 10) {
      advantages.push('Competitive interest rate');
    }

    if (product.processingTime <= 3) {
      advantages.push('Fast processing time');
    }

    if (product.approval.preApprovalAvailable) {
      advantages.push('Pre-approval available');
    }

    if (product.rating.customerRating >= 4.5) {
      advantages.push('Excellent customer reviews');
    }

    if (product.provider.partnershipLevel === 'platinum') {
      advantages.push('Preferred SiteBoss partner');
    }

    return advantages;
  }

  private getProductDisadvantages(product: FinancialProduct, request: FinancingRequest): string[] {
    const disadvantages: string[] = [];

    if (product.interestRate > 12) {
      disadvantages.push('Higher interest rate');
    }

    if (product.processingTime > 7) {
      disadvantages.push('Longer processing time');
    }

    if (product.fees.originationFee > 2) {
      disadvantages.push('High origination fee');
    }

    if (product.approval.approvalRate < 0.7) {
      disadvantages.push('Lower approval rate');
    }

    const collateralReq = product.requirements.find(r => r.type === 'collateral' && r.required);
    if (collateralReq) {
      disadvantages.push('Collateral required');
    }

    return disadvantages;
  }

  private identifyRiskFactors(product: FinancialProduct, request: FinancingRequest): string[] {
    const risks: string[] = [];

    // Check if applicant is close to minimum requirements
    for (const requirement of product.requirements) {
      if (requirement.required && requirement.minimumValue) {
        switch (requirement.type) {
          case 'credit_score':
            if (request.applicant.creditScore < requirement.minimumValue + 50) {
              risks.push('Credit score is close to minimum requirement');
            }
            break;
          case 'annual_revenue':
            if (request.applicant.annualRevenue < requirement.minimumValue * 1.5) {
              risks.push('Revenue may be tight for approval');
            }
            break;
        }
      }
    }

    if (request.amount > request.applicant.annualRevenue * 0.5) {
      risks.push('Loan amount is high relative to annual revenue');
    }

    if (product.provider.type === 'fintech' && request.amount > 250000) {
      risks.push('Large loan amount with newer lender type');
    }

    return risks;
  }

  private getNextSteps(product: FinancialProduct): string[] {
    const steps: string[] = [];

    if (product.approval.preApprovalAvailable) {
      steps.push('Click "Get Pre-Approval" to start the application');
      steps.push('Pre-approval decision typically within 24 hours');
    } else {
      steps.push('Contact lender directly to discuss your project');
      steps.push('Prepare required documentation');
    }

    steps.push('Review terms and conditions carefully');
    steps.push('Compare with other offers before deciding');

    return steps;
  }

  private updateMarketData() {
    this.marketData = {
      averageRates: {
        projectLoans: 8.2,
        equipmentFinancing: 7.1,
        workingCapital: 11.5
      },
      marketTrends: {
        rateDirection: 'rising',
        popularProducts: ['Working Capital', 'Equipment Financing'],
        seasonalFactors: ['Spring construction season', 'Year-end equipment purchases']
      },
      competitiveAnalysis: {
        bestRates: Array.from(this.financialProducts.values()).sort((a, b) => a.interestRate - b.interestRate).slice(0, 3),
        fastestApproval: Array.from(this.financialProducts.values()).sort((a, b) => a.processingTime - b.processingTime).slice(0, 3),
        highestApproval: Array.from(this.financialProducts.values()).sort((a, b) => b.approval.approvalRate - a.approval.approvalRate).slice(0, 3)
      }
    };
  }

  async submitApplication(productId: string, request: FinancingRequest): Promise<ApplicationStatus> {
    const product = this.financialProducts.get(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const applicationId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const estimatedDecisionDate = new Date();
    estimatedDecisionDate.setDate(estimatedDecisionDate.getDate() + product.approval.averageApprovalTime);

    const application: ApplicationStatus = {
      applicationId,
      status: 'submitted',
      provider: product.provider.name,
      submittedDate: new Date(),
      lastUpdated: new Date(),
      estimatedDecisionDate,
      requiredDocuments: [
        'Business financial statements (2 years)',
        'Tax returns (2 years)',
        'Bank statements (3 months)',
        'Construction contracts',
        'Insurance certificates'
      ],
      notes: [
        'Application submitted successfully',
        'Initial review in progress'
      ],
      contactInfo: {
        representative: 'Jane Smith',
        phone: product.provider.customerSupport.phone,
        email: product.provider.customerSupport.email
      }
    };

    // Store application
    const projectApplications = this.applications.get(request.projectId) || [];
    projectApplications.push(application);
    this.applications.set(request.projectId, projectApplications);

    return application;
  }

  async getApplications(projectId: string): Promise<ApplicationStatus[]> {
    return this.applications.get(projectId) || [];
  }

  async getMarketAnalytics(): Promise<MarketplaceAnalytics> {
    return this.marketData!;
  }

  async getAllProducts(): Promise<FinancialProduct[]> {
    return Array.from(this.financialProducts.values());
  }

  async getProductById(productId: string): Promise<FinancialProduct | undefined> {
    return this.financialProducts.get(productId);
  }

  async getAllProviders(): Promise<FinancialProvider[]> {
    return Array.from(this.providers.values());
  }

  // Payment processing integration
  async processPayment(amount: number, method: 'credit_card' | 'bank_transfer', metadata: Record<string, unknown>): Promise<{ transactionId: string; status: string; fees: number }> {
    // Simulate payment processing
    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fees = method === 'credit_card' ? amount * 0.029 : 1.50; // 2.9% for CC, $1.50 for bank transfer
    
    return {
      transactionId,
      status: 'completed',
      fees
    };
  }

  // Revenue sharing calculation for SiteBoss
  calculateRevenueShare(loanAmount: number, providerPartnershipLevel: string): number {
    const baseRate = 0.005; // 0.5% base
    const multipliers = {
      'bronze': 1.0,
      'silver': 1.2,
      'gold': 1.5,
      'platinum': 2.0
    };

    return loanAmount * baseRate * (multipliers[providerPartnershipLevel as keyof typeof multipliers] || 1.0);
  }
}

export const financialMarketplaceService = new FinancialMarketplaceService();