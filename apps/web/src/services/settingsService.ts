import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  PitchStage,
  SlideStructure,
  KeyPrinciple,
  PitchStageDocument,
  SlideStructureDocument,
  KeyPrincipleDocument,
  CreatePitchStageRequest,
  UpdatePitchStageRequest,
  CreateSlideStructureRequest,
  UpdateSlideStructureRequest,
  CreateKeyPrincipleRequest,
  UpdateKeyPrincipleRequest,
  OutlineGeneratorSettings
} from '@/types/settings';

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

// Pitch Stages CRUD
export const pitchStagesService = {
  async getAll(): Promise<PitchStage[]> {
    const q = query(
      collection(db, PITCH_STAGES_COLLECTION),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as PitchStageDocument;
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });
  },

  async getById(id: string): Promise<PitchStage | null> {
    const docRef = doc(db, PITCH_STAGES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data() as PitchStageDocument;
    return {
      ...data,
      id: docSnap.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    };
  },

  async create(data: CreatePitchStageRequest): Promise<string> {
    const docData = {
      ...data,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, PITCH_STAGES_COLLECTION), docData);
    return docRef.id;
  },

  async update(id: string, data: UpdatePitchStageRequest): Promise<void> {
    const docRef = doc(db, PITCH_STAGES_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, PITCH_STAGES_COLLECTION, id);
    await deleteDoc(docRef);
  },

  async getActive(): Promise<PitchStage[]> {
    const q = query(
      collection(db, PITCH_STAGES_COLLECTION),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as PitchStageDocument;
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });
  }
};

// Slide Structures CRUD
export const slideStructuresService = {
  async getAll(): Promise<SlideStructure[]> {
    const q = query(
      collection(db, SLIDE_STRUCTURES_COLLECTION),
      orderBy('pitchStageId', 'asc'),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as SlideStructureDocument;
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });
  },

  async getByPitchStageId(pitchStageId: string): Promise<SlideStructure[]> {
    const q = query(
      collection(db, SLIDE_STRUCTURES_COLLECTION),
      where('pitchStageId', '==', pitchStageId),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as SlideStructureDocument;
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });
  },

  async getById(id: string): Promise<SlideStructure | null> {
    const docRef = doc(db, SLIDE_STRUCTURES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data() as SlideStructureDocument;
    return {
      ...data,
      id: docSnap.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    };
  },

  async create(data: CreateSlideStructureRequest): Promise<string> {
    const docData = {
      ...data,
      isRequired: data.isRequired ?? true,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, SLIDE_STRUCTURES_COLLECTION), docData);
    return docRef.id;
  },

  async update(id: string, data: UpdateSlideStructureRequest): Promise<void> {
    const docRef = doc(db, SLIDE_STRUCTURES_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, SLIDE_STRUCTURES_COLLECTION, id);
    await deleteDoc(docRef);
  },

  async deleteByPitchStageId(pitchStageId: string): Promise<void> {
    const q = query(
      collection(db, SLIDE_STRUCTURES_COLLECTION),
      where('pitchStageId', '==', pitchStageId)
    );
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
};

// Key Principles CRUD
export const keyPrinciplesService = {
  async getAll(): Promise<KeyPrinciple[]> {
    const q = query(
      collection(db, KEY_PRINCIPLES_COLLECTION),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as KeyPrincipleDocument;
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });
  },

  async getById(id: string): Promise<KeyPrinciple | null> {
    const docRef = doc(db, KEY_PRINCIPLES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data() as KeyPrincipleDocument;
    return {
      ...data,
      id: docSnap.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    };
  },

  async create(data: CreateKeyPrincipleRequest): Promise<string> {
    const docData = {
      ...data,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, KEY_PRINCIPLES_COLLECTION), docData);
    return docRef.id;
  },

  async update(id: string, data: UpdateKeyPrincipleRequest): Promise<void> {
    const docRef = doc(db, KEY_PRINCIPLES_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, KEY_PRINCIPLES_COLLECTION, id);
    await deleteDoc(docRef);
  },

  async getActive(): Promise<KeyPrinciple[]> {
    const q = query(
      collection(db, KEY_PRINCIPLES_COLLECTION),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as KeyPrincipleDocument;
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });
  }
};

// Combined service for getting all settings
export const settingsService = {
  async getAllSettings(): Promise<OutlineGeneratorSettings> {
    const [pitchStages, allSlideStructures, keyPrinciples] = await Promise.all([
      pitchStagesService.getActive(),
      slideStructuresService.getAll(),
      keyPrinciplesService.getActive()
    ]);

    // Group slide structures by pitch stage ID
    const slideStructures: Record<string, SlideStructure[]> = {};
    allSlideStructures
      .filter(slide => slide.isActive)
      .forEach(slide => {
        if (!slideStructures[slide.pitchStageId]) {
          slideStructures[slide.pitchStageId] = [];
        }
        slideStructures[slide.pitchStageId].push(slide);
      });

    return {
      pitchStages,
      slideStructures,
      keyPrinciples
    };
  },

  async getSettingsForPitchStage(pitchStageId: string): Promise<{
    pitchStage: PitchStage | null;
    slideStructures: SlideStructure[];
    keyPrinciples: KeyPrinciple[];
  }> {
    const [pitchStage, slideStructures, keyPrinciples] = await Promise.all([
      pitchStagesService.getById(pitchStageId),
      slideStructuresService.getByPitchStageId(pitchStageId),
      keyPrinciplesService.getActive()
    ]);

    return {
      pitchStage,
      slideStructures,
      keyPrinciples
    };
  }
}; 