import { 
  pitchStagesService, 
  slideStructuresService, 
  keyPrinciplesService 
} from './settingsService';
import {
  CreatePitchStageRequest,
  CreateSlideStructureRequest,
  CreateKeyPrincipleRequest
} from '@/types/settings';

// Current hardcoded pitch stage names from the code
const CURRENT_PITCH_STAGES: CreatePitchStageRequest[] = [
  {
    name: "Initial Engagement / Prospecting",
    description: "Early stage relationship building and opportunity identification",
    order: 1
  },
  {
    name: "Needs Assessment / Exploration", 
    description: "Understanding client requirements and pain points",
    order: 2
  },
  {
    name: "RFP Response",
    description: "Formal response to Request for Proposal",
    order: 3
  },
  {
    name: "Proposal / Pitch Presentation",
    description: "Formal presentation of proposed solution",
    order: 4
  },
  {
    name: "Evaluation / Negotiation",
    description: "Final evaluation and contract negotiation phase",
    order: 5
  }
];

// Current hardcoded slide structure from generateOutline.ts
const CURRENT_SLIDE_STRUCTURES: Omit<CreateSlideStructureRequest, 'pitchStageId'>[] = [
  {
    title: "Title & Introduction",
    description: "Personalized for client with clear value proposition",
    order: 1,
    isRequired: true
  },
  {
    title: "Executive Summary",
    description: "Concise overview of proposal and key benefits",
    order: 2,
    isRequired: true
  },
  {
    title: "Client Background & Understanding",
    description: "Demonstrate deep knowledge of client's business and challenges",
    order: 3,
    isRequired: true
  },
  {
    title: "Our Understanding of Your Needs",
    description: "Show you've listened and truly understand their priorities",
    order: 4,
    isRequired: true
  },
  {
    title: "Proposed Solution Overview",
    description: "High-level solution with clear alignment to client needs",
    order: 5,
    isRequired: true
  },
  {
    title: "Solution Details",
    description: "Specifics of your proposed banking/financial services",
    order: 6,
    isRequired: true
  },
  {
    title: "Implementation Approach",
    description: "How your solution will be delivered seamlessly",
    order: 7,
    isRequired: true
  },
  {
    title: "Our Team & Expertise",
    description: "Showcase the relationship team and specialists",
    order: 8,
    isRequired: true
  },
  {
    title: "Case Studies & Credentials",
    description: "Relevant success stories with similar clients",
    order: 9,
    isRequired: true
  },
  {
    title: "Competitive Differentiation",
    description: "Why your solution is superior to alternatives",
    order: 10,
    isRequired: true
  },
  {
    title: "Pricing & Value",
    description: "Clear economics with focus on value, not just cost",
    order: 11,
    isRequired: true
  },
  {
    title: "Risk Management & Compliance",
    description: "How you ensure security and regulatory compliance",
    order: 12,
    isRequired: true
  },
  {
    title: "ESG & Sustainability Considerations",
    description: "Alignment with client's ESG priorities",
    order: 13,
    isRequired: false
  },
  {
    title: "Next Steps",
    description: "Clear implementation timeline and actions",
    order: 14,
    isRequired: true
  }
];

// Current hardcoded key principles from generateOutline.ts
const CURRENT_KEY_PRINCIPLES: CreateKeyPrincipleRequest[] = [
  {
    title: "Relationship-First Approach",
    description: "Emphasize long-term partnership over transactional relationship. Show commitment at senior levels and how you'll provide ongoing value.",
    order: 1
  },
  {
    title: "Customization & Client Focus",
    description: "The entire pitch must feel tailor-made. Use the client's terminology, reference their specific challenges, and align with their strategic goals.",
    order: 2
  },
  {
    title: "Data-Driven Insights",
    description: "Provide valuable benchmarking or insights the client may not have heard elsewhere. Show how your analysis of their situation uncovers opportunities.",
    order: 3
  },
  {
    title: "Memorable Differentiation",
    description: "For each key area, articulate a clear, memorable differentiator that separates you from competitors. Focus on what makes your approach unique.",
    order: 4
  },
  {
    title: "Proof Points & Credentials",
    description: "Support claims with evidence - market rankings, case studies, testimonials, or relevant experience. Emphasize track record with similar clients.",
    order: 5
  },
  {
    title: "Solution Over Products",
    description: "Focus on outcomes and solutions rather than product features. Frame everything in terms of client benefits and addressing their specific challenges.",
    order: 6
  },
  {
    title: "Consultative Stance",
    description: "Position as a trusted advisor bringing expertise, not just selling services. Demonstrate understanding of the client's industry and strategic direction.",
    order: 7
  },
  {
    title: "Technology & Innovation",
    description: "Showcase digital capabilities and innovative approaches that improve client experience, efficiency, or insights.",
    order: 8
  },
  {
    title: "Risk & Compliance Expertise",
    description: "Highlight your risk management capabilities and how you ensure compliance with regulations.",
    order: 9
  },
  {
    title: "Implementation Excellence",
    description: "Address the client's potential concerns about transition and demonstrate your proven ability to execute seamlessly.",
    order: 10
  },
  {
    title: "Team Chemistry",
    description: "Emphasize the strength of the team that will serve the client, highlighting the client-centric service model and how relationships will be managed.",
    order: 11
  },
  {
    title: "ESG & Values Alignment",
    description: "Where relevant, show alignment with the client's sustainability goals and values, demonstrating shared purpose beyond transactions.",
    order: 12
  },
  {
    title: "Visual Impact",
    description: "Recommend strong visuals that simplify complex ideas and make the pitch memorable. Suggest creative ways to make your pitch stand out.",
    order: 13
  }
];

export class SettingsInitializer {
  /**
   * Initialize all settings collections with current hardcoded values
   * This should be run once to migrate from hardcoded to configurable system
   */
  static async initializeAllSettings(): Promise<{
    pitchStagesCreated: number;
    slideStructuresCreated: number;
    keyPrinciplesCreated: number;
  }> {
    console.log('Starting settings initialization...');
    
    // Check if data already exists
    const existingPitchStages = await pitchStagesService.getAll();
    const existingKeyPrinciples = await keyPrinciplesService.getAll();
    
    if (existingPitchStages.length > 0 || existingKeyPrinciples.length > 0) {
      console.log('Settings already exist. Skipping initialization.');
      return {
        pitchStagesCreated: 0,
        slideStructuresCreated: 0,
        keyPrinciplesCreated: 0
      };
    }

    let pitchStagesCreated = 0;
    let slideStructuresCreated = 0;
    let keyPrinciplesCreated = 0;

    try {
      // 1. Create pitch stages and collect their IDs
      console.log('Creating pitch stages...');
      const pitchStageIds: string[] = [];
      
      for (const stageData of CURRENT_PITCH_STAGES) {
        const stageId = await pitchStagesService.create(stageData);
        pitchStageIds.push(stageId);
        pitchStagesCreated++;
        console.log(`Created pitch stage: ${stageData.name} (ID: ${stageId})`);
      }

      // 2. Create slide structures for each pitch stage
      console.log('Creating slide structures...');
      
      for (const pitchStageId of pitchStageIds) {
        for (const slideData of CURRENT_SLIDE_STRUCTURES) {
          const slideStructureData: CreateSlideStructureRequest = {
            ...slideData,
            pitchStageId
          };
          
          const slideId = await slideStructuresService.create(slideStructureData);
          slideStructuresCreated++;
          console.log(`Created slide structure: ${slideData.title} for stage ${pitchStageId} (ID: ${slideId})`);
        }
      }

      // 3. Create key principles
      console.log('Creating key principles...');
      
      for (const principleData of CURRENT_KEY_PRINCIPLES) {
        const principleId = await keyPrinciplesService.create(principleData);
        keyPrinciplesCreated++;
        console.log(`Created key principle: ${principleData.title} (ID: ${principleId})`);
      }

      console.log('Settings initialization completed successfully!');
      console.log(`Summary: ${pitchStagesCreated} pitch stages, ${slideStructuresCreated} slide structures, ${keyPrinciplesCreated} key principles created.`);

      return {
        pitchStagesCreated,
        slideStructuresCreated,
        keyPrinciplesCreated
      };

    } catch (error) {
      console.error('Error during settings initialization:', error);
      throw error;
    }
  }

  /**
   * Initialize only pitch stages
   */
  static async initializePitchStages(): Promise<string[]> {
    const pitchStageIds: string[] = [];
    
    for (const stageData of CURRENT_PITCH_STAGES) {
      const stageId = await pitchStagesService.create(stageData);
      pitchStageIds.push(stageId);
      console.log(`Created pitch stage: ${stageData.name} (ID: ${stageId})`);
    }
    
    return pitchStageIds;
  }

  /**
   * Initialize slide structures for a specific pitch stage
   */
  static async initializeSlideStructuresForStage(pitchStageId: string): Promise<string[]> {
    const slideIds: string[] = [];
    
    for (const slideData of CURRENT_SLIDE_STRUCTURES) {
      const slideStructureData: CreateSlideStructureRequest = {
        ...slideData,
        pitchStageId
      };
      
      const slideId = await slideStructuresService.create(slideStructureData);
      slideIds.push(slideId);
      console.log(`Created slide structure: ${slideData.title} for stage ${pitchStageId} (ID: ${slideId})`);
    }
    
    return slideIds;
  }

  /**
   * Initialize only key principles
   */
  static async initializeKeyPrinciples(): Promise<string[]> {
    const principleIds: string[] = [];
    
    for (const principleData of CURRENT_KEY_PRINCIPLES) {
      const principleId = await keyPrinciplesService.create(principleData);
      principleIds.push(principleId);
      console.log(`Created key principle: ${principleData.title} (ID: ${principleId})`);
    }
    
    return principleIds;
  }

  /**
   * Reset all settings (delete everything and reinitialize)
   * WARNING: This will delete all existing settings data
   */
  static async resetAllSettings(): Promise<{
    pitchStagesCreated: number;
    slideStructuresCreated: number;
    keyPrinciplesCreated: number;
  }> {
    console.log('WARNING: Resetting all settings data...');
    
    // Get all existing data
    const [existingPitchStages, existingSlideStructures, existingKeyPrinciples] = await Promise.all([
      pitchStagesService.getAll(),
      slideStructuresService.getAll(),
      keyPrinciplesService.getAll()
    ]);

    // Delete all existing data
    console.log('Deleting existing data...');
    
    for (const stage of existingPitchStages) {
      await pitchStagesService.delete(stage.id);
    }
    
    for (const slide of existingSlideStructures) {
      await slideStructuresService.delete(slide.id);
    }
    
    for (const principle of existingKeyPrinciples) {
      await keyPrinciplesService.delete(principle.id);
    }

    console.log('Existing data deleted. Reinitializing...');
    
    // Reinitialize with current values
    return await this.initializeAllSettings();
  }
} 