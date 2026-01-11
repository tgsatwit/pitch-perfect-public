import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// Firebase configuration
import { db } from '../lib/firebase';

// Types for settings
export interface PitchStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface SlideStructure {
  id: string;
  pitchStageId: string;
  title: string;
  description: string;
  order: number;
  isRequired: boolean;
  isActive: boolean;
}

export interface KeyPrinciple {
  id: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

export interface OutlineGeneratorSettings {
  pitchStages: PitchStage[];
  slideStructures: Record<string, SlideStructure[]>; // Keyed by pitchStageId
  keyPrinciples: KeyPrinciple[];
}

// Collection names
const PITCH_STAGES_COLLECTION = 'pitchStages';
const SLIDE_STRUCTURES_COLLECTION = 'slideStructures';
const KEY_PRINCIPLES_COLLECTION = 'keyPrinciples';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

export class SettingsService {
  /**
   * Get all active pitch stages
   */
  static async getActivePitchStages(): Promise<PitchStage[]> {
    try {
      const q = query(
        collection(db, PITCH_STAGES_COLLECTION),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          order: data.order,
          isActive: data.isActive,
        };
      });
    } catch (error) {
      console.error('Error fetching pitch stages from Firebase:', error);
      return this.getFallbackPitchStages();
    }
  }

  /**
   * Get slide structures for a specific pitch stage
   */
  static async getSlideStructuresForStage(pitchStageId: string): Promise<SlideStructure[]> {
    try {
      const q = query(
        collection(db, SLIDE_STRUCTURES_COLLECTION),
        where('pitchStageId', '==', pitchStageId),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          pitchStageId: data.pitchStageId,
          title: data.title,
          description: data.description,
          order: data.order,
          isRequired: data.isRequired,
          isActive: data.isActive,
        };
      });
    } catch (error) {
      console.error('Error fetching slide structures from Firebase:', error);
      return this.getFallbackSlideStructures();
    }
  }

  /**
   * Get all active key principles
   */
  static async getActiveKeyPrinciples(): Promise<KeyPrinciple[]> {
    try {
      const q = query(
        collection(db, KEY_PRINCIPLES_COLLECTION),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          order: data.order,
          isActive: data.isActive,
        };
      });
    } catch (error) {
      console.error('Error fetching key principles from Firebase:', error);
      return this.getFallbackKeyPrinciples();
    }
  }

  /**
   * Get settings for a specific pitch stage
   */
  static async getSettingsForPitchStage(pitchStageId: string): Promise<{
    pitchStage: PitchStage | null;
    slideStructures: SlideStructure[];
    keyPrinciples: KeyPrinciple[];
  }> {
    const [pitchStages, slideStructures, keyPrinciples] = await Promise.all([
      this.getActivePitchStages(),
      this.getSlideStructuresForStage(pitchStageId),
      this.getActiveKeyPrinciples()
    ]);

    const pitchStage = pitchStages.find(stage => stage.id === pitchStageId) || null;

    return {
      pitchStage,
      slideStructures,
      keyPrinciples
    };
  }

  /**
   * Get pitch stage by legacy stage key (e.g., 'stage1', 'stage2')
   */
  static async getPitchStageByLegacyKey(legacyKey: string): Promise<PitchStage | null> {
    const pitchStages = await this.getActivePitchStages();
    
    // Map legacy keys to stage names
    const legacyKeyMap: Record<string, string> = {
      'stage1': 'Initial Engagement / Prospecting',
      'stage2': 'Needs Assessment / Exploration',
      'stage3': 'RFP Response',
      'stage4': 'Proposal / Pitch Presentation',
      'stage5': 'Evaluation / Negotiation'
    };

    const targetName = legacyKeyMap[legacyKey];
    if (!targetName) return null;

    return pitchStages.find(stage => stage.name === targetName) || null;
  }

  // Fallback methods for when Firebase is not available
  public static getFallbackPitchStages(): PitchStage[] {
    return [
      {
        id: 'stage1',
        name: 'Initial Engagement / Prospecting',
        description: 'Early stage relationship building and opportunity identification',
        order: 1,
        isActive: true
      },
      {
        id: 'stage2',
        name: 'Needs Assessment / Exploration',
        description: 'Understanding client requirements and pain points',
        order: 2,
        isActive: true
      },
      {
        id: 'stage3',
        name: 'RFP Response',
        description: 'Formal response to Request for Proposal',
        order: 3,
        isActive: true
      },
      {
        id: 'stage4',
        name: 'Proposal / Pitch Presentation',
        description: 'Formal presentation of proposed solution',
        order: 4,
        isActive: true
      },
      {
        id: 'stage5',
        name: 'Evaluation / Negotiation',
        description: 'Final evaluation and contract negotiation phase',
        order: 5,
        isActive: true
      }
    ];
  }

  public static getFallbackSlideStructures(): SlideStructure[] {
    return [
      {
        id: '1',
        pitchStageId: 'fallback',
        title: 'Title & Introduction',
        description: 'Personalized for client with clear value proposition',
        order: 1,
        isRequired: true,
        isActive: true
      },
      {
        id: '2',
        pitchStageId: 'fallback',
        title: 'Executive Summary',
        description: 'Concise overview of proposal and key benefits',
        order: 2,
        isRequired: true,
        isActive: true
      },
      {
        id: '3',
        pitchStageId: 'fallback',
        title: 'Client Background & Understanding',
        description: 'Demonstrate deep knowledge of client\'s business and challenges',
        order: 3,
        isRequired: true,
        isActive: true
      },
      {
        id: '4',
        pitchStageId: 'fallback',
        title: 'Our Understanding of Your Needs',
        description: 'Show you\'ve listened and truly understand their priorities',
        order: 4,
        isRequired: true,
        isActive: true
      },
      {
        id: '5',
        pitchStageId: 'fallback',
        title: 'Proposed Solution Overview',
        description: 'High-level solution with clear alignment to client needs',
        order: 5,
        isRequired: true,
        isActive: true
      },
      {
        id: '6',
        pitchStageId: 'fallback',
        title: 'Solution Details',
        description: 'Specifics of your proposed banking/financial services',
        order: 6,
        isRequired: true,
        isActive: true
      },
      {
        id: '7',
        pitchStageId: 'fallback',
        title: 'Implementation Approach',
        description: 'How your solution will be delivered seamlessly',
        order: 7,
        isRequired: true,
        isActive: true
      },
      {
        id: '8',
        pitchStageId: 'fallback',
        title: 'Our Team & Expertise',
        description: 'Showcase the relationship team and specialists',
        order: 8,
        isRequired: true,
        isActive: true
      },
      {
        id: '9',
        pitchStageId: 'fallback',
        title: 'Case Studies & Credentials',
        description: 'Relevant success stories with similar clients',
        order: 9,
        isRequired: true,
        isActive: true
      },
      {
        id: '10',
        pitchStageId: 'fallback',
        title: 'Competitive Differentiation',
        description: 'Why your solution is superior to alternatives',
        order: 10,
        isRequired: true,
        isActive: true
      },
      {
        id: '11',
        pitchStageId: 'fallback',
        title: 'Pricing & Value',
        description: 'Clear economics with focus on value, not just cost',
        order: 11,
        isRequired: true,
        isActive: true
      },
      {
        id: '12',
        pitchStageId: 'fallback',
        title: 'Risk Management & Compliance',
        description: 'How you ensure security and regulatory compliance',
        order: 12,
        isRequired: true,
        isActive: true
      },
      {
        id: '13',
        pitchStageId: 'fallback',
        title: 'ESG & Sustainability Considerations',
        description: 'Alignment with client\'s ESG priorities',
        order: 13,
        isRequired: false,
        isActive: true
      },
      {
        id: '14',
        pitchStageId: 'fallback',
        title: 'Next Steps',
        description: 'Clear implementation timeline and actions',
        order: 14,
        isRequired: true,
        isActive: true
      }
    ];
  }

  public static getFallbackKeyPrinciples(): KeyPrinciple[] {
    return [
      {
        id: '1',
        title: 'Relationship-First Approach',
        description: 'Emphasize long-term partnership over transactional relationship. Show commitment at senior levels and how you\'ll provide ongoing value.',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        title: 'Customization & Client Focus',
        description: 'The entire pitch must feel tailor-made. Use the client\'s terminology, reference their specific challenges, and align with their strategic goals.',
        order: 2,
        isActive: true
      },
      {
        id: '3',
        title: 'Data-Driven Insights',
        description: 'Provide valuable benchmarking or insights the client may not have heard elsewhere. Show how your analysis of their situation uncovers opportunities.',
        order: 3,
        isActive: true
      },
      {
        id: '4',
        title: 'Memorable Differentiation',
        description: 'For each key area, articulate a clear, memorable differentiator that separates you from competitors. Focus on what makes your approach unique.',
        order: 4,
        isActive: true
      },
      {
        id: '5',
        title: 'Proof Points & Credentials',
        description: 'Support claims with evidence - market rankings, case studies, testimonials, or relevant experience. Emphasize track record with similar clients.',
        order: 5,
        isActive: true
      },
      {
        id: '6',
        title: 'Solution Over Products',
        description: 'Focus on outcomes and solutions rather than product features. Frame everything in terms of client benefits and addressing their specific challenges.',
        order: 6,
        isActive: true
      },
      {
        id: '7',
        title: 'Consultative Stance',
        description: 'Position as a trusted advisor bringing expertise, not just selling services. Demonstrate understanding of the client\'s industry and strategic direction.',
        order: 7,
        isActive: true
      },
      {
        id: '8',
        title: 'Technology & Innovation',
        description: 'Showcase digital capabilities and innovative approaches that improve client experience, efficiency, or insights.',
        order: 8,
        isActive: true
      },
      {
        id: '9',
        title: 'Risk & Compliance Expertise',
        description: 'Highlight your risk management capabilities and how you ensure compliance with regulations.',
        order: 9,
        isActive: true
      },
      {
        id: '10',
        title: 'Implementation Excellence',
        description: 'Address the client\'s potential concerns about transition and demonstrate your proven ability to execute seamlessly.',
        order: 10,
        isActive: true
      },
      {
        id: '11',
        title: 'Team Chemistry',
        description: 'Emphasize the strength of the team that will serve the client, highlighting the client-centric service model and how relationships will be managed.',
        order: 11,
        isActive: true
      },
      {
        id: '12',
        title: 'ESG & Values Alignment',
        description: 'Where relevant, show alignment with the client\'s sustainability goals and values, demonstrating shared purpose beyond transactions.',
        order: 12,
        isActive: true
      },
      {
        id: '13',
        title: 'Visual Impact',
        description: 'Recommend strong visuals that simplify complex ideas and make the pitch memorable. Suggest creative ways to make your pitch stand out.',
        order: 13,
        isActive: true
      }
    ];
  }
} 