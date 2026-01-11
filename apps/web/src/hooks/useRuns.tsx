export function useRuns() {
  /**
   * Generates a public shared run ID for the given run ID.
   */
  const shareRun = async (runId: string): Promise<string | undefined> => {
    try {
      const res = await fetch("/api/runs/share", {
        method: "POST",
        body: JSON.stringify({ runId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to share run:", errorData);
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const { sharedRunURL } = await res.json();
      return sharedRunURL;
    } catch (error) {
      console.error("Error sharing run:", error);
      return undefined;
    }
  };

  return {
    shareRun,
  };
}
