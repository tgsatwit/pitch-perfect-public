import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  serverTimestamp,
  updateDoc,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { AISlideContent } from './PresentationAIService';

// Define presentation data structure
export interface PresentationData {
  id?: string;
  title: string;
  description?: string;
  clientName?: string;
  slides: AISlideContent[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userId: string;
  isTemplate?: boolean;
  tags?: string[];
  thumbnail?: string;
  lastEditedSlideIndex?: number;
}

// Define version history structure
export interface PresentationVersion {
  id: string;
  presentationId: string;
  versionNumber: number;
  slides: AISlideContent[];
  createdAt: Timestamp;
  userId: string;
  title: string;
  description?: string;
}

// Autosave configuration
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export class PresentationStorageService {
  private autosaveTimer: NodeJS.Timeout | null = null;
  private pendingChanges = false;
  private lastSaveTime = Date.now();
  private currentUserId: string;
  private currentPresentationId: string | null = null;
  
  constructor(userId: string) {
    this.currentUserId = userId;
  }
  
  // Save presentation data
  async savePresentation(presentationData: PresentationData): Promise<string> {
    try {
      const presentationsRef = collection(db, 'presentations');
      
      // Update timestamps
      const now = serverTimestamp();
      const dataToSave = {
        ...presentationData,
        updatedAt: now,
        userId: this.currentUserId
      };
      
      if (!presentationData.id) {
        // Create new presentation
        dataToSave.createdAt = now;
        const docRef = await addDoc(presentationsRef, dataToSave);
        
        // Store ID for autosave
        this.currentPresentationId = docRef.id;
        return docRef.id;
      } else {
        // Update existing presentation
        const presentationRef = doc(db, 'presentations', presentationData.id);
        await updateDoc(presentationRef, dataToSave);
        
        // Store ID for autosave
        this.currentPresentationId = presentationData.id;
        return presentationData.id;
      }
    } catch (error) {
      console.error('Error saving presentation:', error);
      throw error;
    }
  }
  
  // Load presentation data
  async loadPresentation(presentationId: string): Promise<PresentationData | null> {
    try {
      const presentationRef = doc(db, 'presentations', presentationId);
      const presentationSnap = await getDoc(presentationRef);
      
      if (presentationSnap.exists()) {
        const data = presentationSnap.data() as PresentationData;
        this.currentPresentationId = presentationId;
        return {
          ...data,
          id: presentationId
        };
      } else {
        console.error('Presentation not found');
        return null;
      }
    } catch (error) {
      console.error('Error loading presentation:', error);
      throw error;
    }
  }
  
  // Get all user presentations
  async getUserPresentations(): Promise<PresentationData[]> {
    try {
      const presentationsRef = collection(db, 'presentations');
      const q = query(
        presentationsRef,
        where('userId', '==', this.currentUserId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const presentations: PresentationData[] = [];
      
      querySnapshot.forEach(doc => {
        presentations.push({
          ...doc.data() as PresentationData,
          id: doc.id
        });
      });
      
      return presentations;
    } catch (error) {
      console.error('Error getting presentations:', error);
      throw error;
    }
  }
  
  // Delete presentation
  async deletePresentation(presentationId: string): Promise<void> {
    try {
      // Stop autosave if this is the current presentation
      if (this.currentPresentationId === presentationId) {
        this.stopAutosave();
        this.currentPresentationId = null;
      }
      
      // Delete the presentation
      const presentationRef = doc(db, 'presentations', presentationId);
      await deleteDoc(presentationRef);
      
      // Optionally, you could also delete all versions of this presentation
      // This would require a separate query to get all versions and then batch delete
    } catch (error) {
      console.error('Error deleting presentation:', error);
      throw error;
    }
  }
  
  // Save a version (for version history)
  async saveVersion(presentationData: PresentationData, versionDescription?: string): Promise<string> {
    try {
      if (!presentationData.id) {
        throw new Error('Cannot create version history for unsaved presentation');
      }
      
      // Get the latest version number
      const versionsRef = collection(db, 'presentation_versions');
      const q = query(
        versionsRef,
        where('presentationId', '==', presentationData.id),
        orderBy('versionNumber', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      let nextVersionNumber = 1;
      
      if (!querySnapshot.empty) {
        const latestVersion = querySnapshot.docs[0].data() as PresentationVersion;
        nextVersionNumber = latestVersion.versionNumber + 1;
      }
      
      // Create the new version
      const versionData: PresentationVersion = {
        presentationId: presentationData.id,
        versionNumber: nextVersionNumber,
        slides: presentationData.slides,
        createdAt: Timestamp.now(),
        userId: this.currentUserId,
        title: presentationData.title,
        description: versionDescription || `Version ${nextVersionNumber}`
      } as PresentationVersion;
      
      const docRef = await addDoc(versionsRef, versionData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving version:', error);
      throw error;
    }
  }
  
  // Get version history
  async getVersionHistory(presentationId: string): Promise<PresentationVersion[]> {
    try {
      const versionsRef = collection(db, 'presentation_versions');
      const q = query(
        versionsRef,
        where('presentationId', '==', presentationId),
        orderBy('versionNumber', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const versions: PresentationVersion[] = [];
      
      querySnapshot.forEach(doc => {
        versions.push({
          ...doc.data() as PresentationVersion,
          id: doc.id
        });
      });
      
      return versions;
    } catch (error) {
      console.error('Error getting version history:', error);
      throw error;
    }
  }
  
  // Restore from version
  async restoreFromVersion(versionId: string): Promise<PresentationData | null> {
    try {
      // Get the version data
      const versionRef = doc(db, 'presentation_versions', versionId);
      const versionSnap = await getDoc(versionRef);
      
      if (!versionSnap.exists()) {
        throw new Error('Version not found');
      }
      
      const versionData = versionSnap.data() as PresentationVersion;
      
      // Load the current presentation
      const presentationRef = doc(db, 'presentations', versionData.presentationId);
      const presentationSnap = await getDoc(presentationRef);
      
      if (!presentationSnap.exists()) {
        throw new Error('Original presentation not found');
      }
      
      const presentationData = presentationSnap.data() as PresentationData;
      
      // Update the presentation with slides from the version
      const updatedPresentation: PresentationData = {
        ...presentationData,
        slides: versionData.slides,
        updatedAt: serverTimestamp() as Timestamp
      };
      
      // Save the presentation
      await updateDoc(presentationRef, updatedPresentation);
      
      // Return the updated presentation
      return {
        ...updatedPresentation,
        id: versionData.presentationId
      };
    } catch (error) {
      console.error('Error restoring from version:', error);
      throw error;
    }
  }
  
  // Start autosave
  startAutosave(presentation: PresentationData, onSave?: (savedId: string) => void): void {
    // Store the presentation ID
    this.currentPresentationId = presentation.id || null;
    
    // Clear any existing timer
    this.stopAutosave();
    
    // Start a new timer
    this.autosaveTimer = setInterval(async () => {
      if (this.pendingChanges || (Date.now() - this.lastSaveTime > AUTOSAVE_INTERVAL * 3)) {
        try {
          if (this.currentPresentationId) {
            // Load latest data to ensure we have the most current version
            const presentationRef = doc(db, 'presentations', this.currentPresentationId);
            const presentationSnap = await getDoc(presentationRef);
            
            if (presentationSnap.exists()) {
              // Update with the latest changes
              await updateDoc(presentationRef, {
                slides: presentation.slides,
                updatedAt: serverTimestamp(),
                lastEditedSlideIndex: presentation.lastEditedSlideIndex
              });
              
              this.lastSaveTime = Date.now();
              this.pendingChanges = false;
              
              if (onSave) {
                onSave(this.currentPresentationId);
              }
            }
          } else if (presentation.title) {
            // If it's a new presentation and has a title, save it
            const savedId = await this.savePresentation(presentation);
            
            if (onSave) {
              onSave(savedId);
            }
          }
        } catch (error) {
          console.error('Autosave error:', error);
        }
      }
    }, AUTOSAVE_INTERVAL);
  }
  
  // Stop autosave
  stopAutosave(): void {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }
  
  // Mark changes pending (to trigger next autosave)
  markChangesPending(): void {
    this.pendingChanges = true;
  }
  
  // Force an immediate save
  async forceSave(presentation: PresentationData): Promise<string> {
    return await this.savePresentation(presentation);
  }
  
  // Dupliate a presentation
  async duplicatePresentation(presentationId: string, newTitle?: string): Promise<string> {
    try {
      // Load the presentation to duplicate
      const presentation = await this.loadPresentation(presentationId);
      
      if (!presentation) {
        throw new Error('Presentation not found');
      }
      
      // Create a new presentation with the same content
      const duplicatedPresentation: PresentationData = {
        ...presentation,
        id: undefined, // Remove the ID to create a new one
        title: newTitle || `${presentation.title} (Copy)`,
        createdAt: undefined, // Will be set on save
        updatedAt: undefined // Will be set on save
      };
      
      // Save the duplicated presentation
      return await this.savePresentation(duplicatedPresentation);
    } catch (error) {
      console.error('Error duplicating presentation:', error);
      throw error;
    }
  }
  
  // Create from template
  async createFromTemplate(templateId: string, newTitle: string): Promise<string> {
    try {
      // Load the template
      const template = await this.loadPresentation(templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      // Create a new presentation based on the template
      const newPresentation: PresentationData = {
        title: newTitle,
        description: template.description,
        clientName: '',
        slides: template.slides,
        userId: this.currentUserId,
        isTemplate: false
      };
      
      // Save the new presentation
      return await this.savePresentation(newPresentation);
    } catch (error) {
      console.error('Error creating from template:', error);
      throw error;
    }
  }
}

export default PresentationStorageService; 