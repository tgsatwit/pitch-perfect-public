"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PitchContext, Pitch } from '../../../pitches/types';
import { PresentationWorkflow } from '@/components/presentation/PresentationWorkflow';
import { AISlideContent } from '@/components/presentation/services/PresentationAIService';

interface PageParams {
  id: string;
}

export default function PresentationPage() {
  const params = useParams<PageParams>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pitchContext, setPitchContext] = useState<PitchContext | null>(null);

  useEffect(() => {
    const fetchPitchData = async () => {
      try {
        const pitchDoc = await getDoc(doc(db, 'pitches', params.id));
        if (!pitchDoc.exists()) {
          setError('Pitch not found');
          return;
        }

        const pitchData = pitchDoc.data() as Pitch;
        
        // Fetch competitors data
        const competitorsData = await Promise.all(
          Object.entries(pitchData.competitorsSelected || {})
            .filter(([_, selected]) => selected)
            .map(async ([competitorId]) => {
              const competitorDoc = await getDoc(doc(db, 'competitors', competitorId));
              if (!competitorDoc.exists()) return null;
              const data = competitorDoc.data();
              return {
                id: competitorDoc.id,
                name: data.name as string
              };
            })
        );

        const context: PitchContext = {
          problem: pitchData.problem || '',
          solution: pitchData.solution || '',
          market: pitchData.market || '',
          competitors: competitorsData.filter((c): c is Competitor => c !== null),
          clientName: pitchData.clientName,
          pitchStage: pitchData.pitchStage
        };

        setPitchContext(context);
      } catch (err) {
        console.error('Error fetching pitch data:', err);
        setError('Failed to load pitch data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPitchData();
    }
  }, [params.id]);

  const handleComplete = async (slides: AISlideContent[]) => {
    // TODO: Save the presentation data
    console.log('Presentation completed:', slides);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !pitchContext) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error || 'Failed to load pitch data'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">
        Create Presentation for {pitchContext.clientName}
      </h1>
      <PresentationWorkflow
        pitchContext={pitchContext}
        onComplete={handleComplete}
      />
    </div>
  );
} 