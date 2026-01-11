import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { PitchOutlineAnnotation, type PitchOutlineReturnType } from "../state";
import { db } from "../../lib/firebase";

/**
 * Node to retrieve client and competitor data from Firebase
 */
export async function retrieveDataNode(
  state: typeof PitchOutlineAnnotation.State
): Promise<PitchOutlineReturnType> {
  console.log("[retrieveDataNode] Starting data retrieval");
  
  try {
    // Check if input has everything we need
    if (!state.input.clientId && !state.input.clientName) {
      throw new Error("Client information missing. Need either clientId or clientName.");
    }
    
    let clientData = null;
    let competitorData: Record<string, any> = {};
    
    // Retrieve client data
    if (state.input.clientId) {
      console.log(`[retrieveDataNode] Retrieving client data for ID: ${state.input.clientId}`);
      const clientDocRef = doc(db, "clients", state.input.clientId);
      const clientSnapshot = await getDoc(clientDocRef);
      
      if (clientSnapshot.exists()) {
        clientData = {
          id: clientSnapshot.id,
          ...clientSnapshot.data()
        };
        console.log("[retrieveDataNode] Client data retrieved successfully");
      } else {
        console.log(`[retrieveDataNode] Client data not found for ID: ${state.input.clientId}`);
      }
    } else if (state.input.clientName) {
      console.log(`[retrieveDataNode] Searching for client by name: ${state.input.clientName}`);
      const clientsCollection = collection(db, "clients");
      const clientQuery = query(clientsCollection, where("name", "==", state.input.clientName));
      const querySnapshot = await getDocs(clientQuery);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        clientData = {
          id: doc.id,
          ...doc.data()
        };
        console.log("[retrieveDataNode] Client data retrieved successfully by name");
      } else {
        console.log(`[retrieveDataNode] Client data not found for name: ${state.input.clientName}`);
      }
    }
    
    // Retrieve competitor data for selected competitors
    if (state.input.competitorsSelected && Object.keys(state.input.competitorsSelected).length > 0) {
      console.log("[retrieveDataNode] Retrieving competitor data");
      
      // Filter out competitors with `manual-` prefix
      const competitorIds = Object.entries(state.input.competitorsSelected)
        .filter(([id, selected]) => selected && !id.startsWith("manual-"))
        .map(([id]) => id);
      
      // Get data for each competitor
      for (const competitorId of competitorIds) {
        try {
          const competitorDocRef = doc(db, "competitors", competitorId);
          const competitorSnapshot = await getDoc(competitorDocRef);
          
          if (competitorSnapshot.exists()) {
            competitorData[competitorId] = {
              id: competitorSnapshot.id,
              ...competitorSnapshot.data()
            };
          }
        } catch (error) {
          console.error(`[retrieveDataNode] Error retrieving competitor data for ID ${competitorId}:`, error);
        }
      }
      
      // Add manually entered competitors
      const manualCompetitors = Object.entries(state.input.competitorsSelected)
        .filter(([id, selected]) => selected && id.startsWith("manual-"))
        .map(([id]) => id.replace("manual-", ""));
      
      for (const competitorName of manualCompetitors) {
        competitorData[`manual-${competitorName}`] = {
          id: `manual-${competitorName}`,
          name: competitorName
        };
      }
      
      console.log(`[retrieveDataNode] Retrieved data for ${Object.keys(competitorData).length} competitors`);
    }
    
    // Use any research data if available
    if (state.input.clientDetails) {
      clientData = { ...clientData, ...state.input.clientDetails };
    }
    
    if (state.input.competitorDetails) {
      competitorData = { ...competitorData, ...state.input.competitorDetails };
    }
    
    return {
      clientData,
      competitorData
    };
  } catch (error) {
    console.error("[retrieveDataNode] Error:", error);
    return {
      error: `Data retrieval error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 