"use client";

/**
 * ThreadProvider.tsx
 * This file provides a React context for managing threads, including operations
 * such as creating, fetching, and deleting threads, as well as handling model configurations.
 */

import {
  ALL_MODEL_NAMES,
  ALL_MODELS,
  DEFAULT_MODEL_CONFIG,
  DEFAULT_MODEL_NAME,
} from "@opencanvas/shared/models";
import { CustomModelConfig } from "@opencanvas/shared/types";
import { Thread } from "@langchain/langgraph-sdk";
import { createClient } from "../hooks/utils";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useUserContext } from "./UserContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryState } from "nuqs";

type ThreadContentType = {
  threadId: string | null;
  userThreads: Thread[];
  isUserThreadsLoading: boolean;
  modelName: ALL_MODEL_NAMES;
  modelConfig: CustomModelConfig;
  modelConfigs: Record<ALL_MODEL_NAMES, CustomModelConfig>;
  createThreadLoading: boolean;
  getThread: (id: string) => Promise<Thread | undefined>;
  createThread: () => Promise<Thread | undefined>;
  getUserThreads: () => Promise<void>;
  deleteThread: (id: string, clearMessages: () => void) => Promise<void>;
  setThreadId: (id: string | null) => void;
  setModelName: (name: ALL_MODEL_NAMES) => void;
  setModelConfig: (
    modelName: ALL_MODEL_NAMES,
    config: CustomModelConfig
  ) => void;
};

const ThreadContext = createContext<ThreadContentType | undefined>(undefined);

export function ThreadProvider({ children }: { children: ReactNode }) {
  // Initialize context and state for managing threads and model configurations
  
  const { user, loading: userLoading } = useUserContext();
  // Retrieve current user from UserContext
  
  const { toast } = useToast();
  // Get toast function for showing notifications
  
  const [threadId, setThreadId] = useQueryState("threadId");
  const [userThreads, setUserThreads] = useState<Thread[]>([]);
  const [isUserThreadsLoading, setIsUserThreadsLoading] = useState(false);
  const [modelName, setModelName] =
    useState<ALL_MODEL_NAMES>(DEFAULT_MODEL_NAME);
  const [createThreadLoading, setCreateThreadLoading] = useState(false);

  // Set up state variables for thread management and model selection
  
  const [modelConfigs, setModelConfigs] = useState<
    Record<ALL_MODEL_NAMES, CustomModelConfig>
  >(() => {
    // Initialize default configurations for all available models using shared defaults
    const initialConfigs: Record<ALL_MODEL_NAMES, CustomModelConfig> =
      {} as Record<ALL_MODEL_NAMES, CustomModelConfig>;

    ALL_MODELS.forEach((model) => {
      const modelKey = model.modelName || model.name;

      initialConfigs[modelKey] = {
        ...model.config,
        provider: model.config.provider,
        temperatureRange: {
          ...(model.config.temperatureRange ||
            DEFAULT_MODEL_CONFIG.temperatureRange),
        },
        maxTokens: {
          ...(model.config.maxTokens || DEFAULT_MODEL_CONFIG.maxTokens),
        },
        ...(model.config.provider === "azure_openai" && {
          azureConfig: {
            azureOpenAIApiKey: process.env._AZURE_OPENAI_API_KEY || "",
            azureOpenAIApiInstanceName:
              process.env._AZURE_OPENAI_API_INSTANCE_NAME || "",
            azureOpenAIApiDeploymentName:
              process.env._AZURE_OPENAI_API_DEPLOYMENT_NAME || "",
            azureOpenAIApiVersion:
              process.env._AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
            azureOpenAIBasePath: process.env._AZURE_OPENAI_API_BASE_PATH,
          },
        }),
      };
    });
    return initialConfigs;
  });

  // Memoize the current model configuration based on the selected model name
  const modelConfig = useMemo(() => {
    // Try exact match first, then try without "azure/" or "groq/" prefixes
    return (
      modelConfigs[modelName] || modelConfigs[modelName.replace("azure/", "")]
    );
  }, [modelName, modelConfigs]);

  // Update the configuration for a specific model and merge with default settings
  const setModelConfig = (
    modelName: ALL_MODEL_NAMES,
    config: CustomModelConfig
  ) => {
    setModelConfigs((prevConfigs) => {
      if (!config || !modelName) {
        return prevConfigs;
      }
      return {
        ...prevConfigs,
        [modelName]: {
          ...config,
          provider: config.provider,
          temperatureRange: {
            ...(config.temperatureRange ||
              DEFAULT_MODEL_CONFIG.temperatureRange),
          },
          maxTokens: {
            ...(config.maxTokens || DEFAULT_MODEL_CONFIG.maxTokens),
          },
          ...(config.provider === "azure_openai" && {
            azureConfig: {
              ...config.azureConfig,
              azureOpenAIApiKey:
                config.azureConfig?.azureOpenAIApiKey ||
                process.env._AZURE_OPENAI_API_KEY ||
                "",
              azureOpenAIApiInstanceName:
                config.azureConfig?.azureOpenAIApiInstanceName ||
                process.env._AZURE_OPENAI_API_INSTANCE_NAME ||
                "",
              azureOpenAIApiDeploymentName:
                config.azureConfig?.azureOpenAIApiDeploymentName ||
                process.env._AZURE_OPENAI_API_DEPLOYMENT_NAME ||
                "",
              azureOpenAIApiVersion:
                config.azureConfig?.azureOpenAIApiVersion ||
                "2024-08-01-preview",
              azureOpenAIBasePath:
                config.azureConfig?.azureOpenAIBasePath ||
                process.env._AZURE_OPENAI_API_BASE_PATH,
            },
          }),
        },
      };
    });
  };

  // Create a new thread for the current user using the selected model configuration
  const createThread = async (): Promise<Thread | undefined> => {
    if (!user || userLoading) {
      toast({
        title: "Failed to create thread",
        description: userLoading ? "Waiting for user data..." : "User not found",
        duration: 5000,
        variant: "destructive",
      });
      return;
    }
    const client = createClient();
    setCreateThreadLoading(true);

    try {
      const thread = await client.threads.create({
        metadata: {
          supabase_user_id: user.id,
          customModelName: modelName,
          modelConfig: {
            ...modelConfig,
            // Ensure Azure config is included if needed
            ...(modelConfig.provider === "azure_openai" && {
              azureConfig: modelConfig.azureConfig,
            }),
          },
        },
      });
      setThreadId(thread.thread_id);
      // Fetch updated threads so the new thread is included.
      await getUserThreads();
      return thread;
    } catch (e) {
      console.error("Failed to create thread", e);
      toast({
        title: "Failed to create thread",
        description:
          "An error occurred while trying to create a new thread. Please try again.",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setCreateThreadLoading(false);
    }
  };

  // Fetch all threads associated with the current user
  const getUserThreads = async () => {
    if (!user || userLoading) {
      toast({
        title: "Failed to get threads",
        description: userLoading ? "Waiting for user data..." : "User not found",
        duration: 5000,
        variant: "destructive",
      });
      return;
    }

    setIsUserThreadsLoading(true);
    try {
      const client = createClient();

      const userThreads = await client.threads.search({
        metadata: {
          supabase_user_id: user.id,
        },
        limit: 100,
      });

      if (userThreads.length > 0) {
        const lastInArray = userThreads[0];
        const allButLast = userThreads.slice(1, userThreads.length);
        const filteredThreads = allButLast.filter(
          (thread) => thread.values && Object.keys(thread.values).length > 0
        );
        setUserThreads([...filteredThreads, lastInArray]);
      }
    } finally {
      setIsUserThreadsLoading(false);
    }
  };

  // Delete a thread by ID and handle UI updates if the deleted thread is the current one
  const deleteThread = async (id: string, clearMessages: () => void) => {
    setUserThreads((prevThreads) => {
      const newThreads = prevThreads.filter(
        (thread) => thread.thread_id !== id
      );
      return newThreads;
    });
    if (id === threadId) {
      clearMessages();
      // Create a new thread. Use .then to avoid blocking the UI.
      // Once completed, `createThread` will re-fetch all user
      // threads to update UI.
      void createThread();
    }
    const client = createClient();
    try {
      await client.threads.delete(id);
    } catch (e) {
      console.error(`Failed to delete thread with ID ${id}`, e);
    }
  };

  // Retrieve a specific thread by its ID
  const getThread = async (id: string): Promise<Thread | undefined> => {
    try {
      const client = createClient();
      return client.threads.get(id);
    } catch (e) {
      console.error("Failed to get thread by ID.", id, e);
      toast({
        title: "Failed to get thread",
        description: "An error occurred while trying to get a thread.",
        duration: 5000,
        variant: "destructive",
      });
    }

    return undefined;
  };

  // Prepare the context value with state and functions to be provided to consumers
  const contextValue: ThreadContentType = {
    threadId,
    userThreads,
    isUserThreadsLoading,
    modelName,
    modelConfig,
    modelConfigs,
    createThreadLoading,
    getThread,
    createThread,
    getUserThreads,
    deleteThread,
    setThreadId,
    setModelName,
    setModelConfig,
  };

  return (
    // Provide ThreadContext to all child components
    <ThreadContext.Provider value={contextValue}>
      {userLoading ? ( 
        // Optional: Render a loading indicator while user context loads
        <div className="flex items-center justify-center h-full w-full">
           {/* You can replace this with a spinner or skeleton loader */}
          <span>Loading user...</span>
        </div> 
      ) : (
        // Render children only when user context is loaded
        children 
      )}
    </ThreadContext.Provider>
  );
}

// Custom hook to access ThreadContext, ensuring it is used within a ThreadProvider
export function useThreadContext() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreadContext must be used within a ThreadProvider");
  }
  return context;
}
