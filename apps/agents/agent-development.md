# Agent Development Framework

This document outlines the standard framework for developing new agents that integrate with the existing system. Following these guidelines ensures a consistent approach across all agents and smooth integration with the platform.

## Agent Structure

All agents should follow this standard directory structure:

```
apps/agents/src/[agent-name]/
├── index.ts         # Main entry point and graph definition
├── state.ts         # State schema and annotations
├── types.ts         # Type definitions (optional)
├── prompts.ts       # System prompts and templates (optional)
├── nodes/           # Individual node implementations (for complex agents)
│   ├── node1.ts
│   ├── node2.ts
│   └── ...
└── test.ts          # Test cases (optional)
```

## 1. State Definition

Define your agent's state in `state.ts` using LangGraph annotations:

```typescript
import { Annotation } from "@langchain/langgraph";
import { YourInputType, YourOutputType } from "./types";

export const YourAgentAnnotation = Annotation.Root({
  // Input state
  input: Annotation<YourInputType>,
  
  // Output state
  output: Annotation<YourOutputType | undefined>,
  
  // Error handling
  error: Annotation<string | undefined>,
  
  // Add any additional state properties needed
  // ...
});

export type YourAgentReturnType = Partial<typeof YourAgentAnnotation.State>;
```

## 2. Type Definitions

Define input and output types in `types.ts`:

```typescript
export interface YourAgentInput {
  // Required parameters
  requiredParam: string;
  
  // Optional parameters
  optionalParam?: string;
}

export interface YourAgentOutput {
  // Define the structure of your agent's results
  result: string;
  // Additional output fields
  additionalData?: Record<string, any>;
}
```

## 3. Node Implementation

For simple agents, implement all logic in the `index.ts` file. For complex agents, break down functionality into separate node files in the `nodes/` directory.

Each node should:

1. Accept the current state and configuration
2. Perform a specific task
3. Return a partial state update

Example:

```typescript
export async function yourNode(
  state: typeof YourAgentAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<YourAgentReturnType> {
  try {
    // Node implementation logic
    
    return {
      // Return updated state properties
    };
  } catch (error) {
    console.error("Error in yourNode:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
```

## 4. Graph Definition

In `index.ts`, define your agent's graph structure:

```typescript
// Import dependencies
import { StateGraph, START } from "@langchain/langgraph";
import { YourAgentAnnotation } from "./state";
import { yourNode } from "./nodes/yourNode";

// Build the graph
const builder = new StateGraph(YourAgentAnnotation)
  .addNode("yourNode", yourNode)
  .addEdge(START, "yourNode");

// For simple linear flows
// .addEdge(START, "firstNode")
// .addEdge("firstNode", "secondNode")
// .addEdge("secondNode", END);

// For conditional edges
// .addConditionalEdges("routerNode", conditionalFunction, [
//   "option1Node",
//   "option2Node",
//   END
// ])

// Compile the graph
export const graph = builder.compile();

// Expose the agent to be used by the LangGraph CLI and API routes
export const your_agent = {
  name: "your_agent",
  metadata: {
    description: "Description of your agent's purpose"
  },
  invoke: async (input: any) => {
    console.log("Agent invoked with input:", input);
    const result = await graph.invoke({
      input: input.input || input
    });
    return result;
  },
  // Add stream method required by LangGraph CLI
  stream: async function* (input?: any) {
    const result = await graph.invoke({
      input: input?.input || input || {}
    });
    yield result;
  }
};
```

## 5. Model Initialization

Use the shared utility functions for model initialization:

```typescript
import { getModelConfig, getModelFromConfig } from "../../utils";

// Within your node function:
const modelConfig = getModelConfig(config);
const model = await getModelFromConfig(config, {
  temperature: 0,
  maxTokens: 1000
});
```

## 6. LLM Prompting

When working with LLMs, follow these best practices:

1. Define system prompts in a separate `prompts.ts` file
2. Use structured output when possible
3. Handle errors gracefully
4. Set appropriate temperature (0 for deterministic tasks, 0.7-1.0 for creative tasks)

Example:

```typescript
import { z } from "zod";

const outputSchema = z.object({
  analysis: z.string().describe("Detailed analysis based on the input"),
  recommendations: z.array(z.string()).describe("List of recommendations")
});

const response = await model
  .withStructuredOutput(outputSchema)
  .invoke([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userQuery }
  ]);
```

## 7. Register Your Agent

Add your agent to `langgraph.json` in the project root:

```json
{
  "graphs": {
    "existing_agent": "./apps/agents/src/existing-agent/index.ts:graph",
    "your_agent": "./apps/agents/src/your-agent/index.ts:graph"
  }
}
```

## 8. API Route Integration

Create a corresponding API route in `apps/web/src/app/api/agents/your-agent/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { your_agent } from "@/../../agents/src/your-agent";
import type { YourAgentInput } from "@/../../agents/src/your-agent/types";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate input
    if (!body.requiredParam) {
      return NextResponse.json(
        { error: "Required parameter is missing" },
        { status: 400 }
      );
    }
    
    // Prepare the input
    const input: YourAgentInput = {
      requiredParam: body.requiredParam,
      optionalParam: body.optionalParam,
    };
    
    // Call the agent
    console.log("Calling your-agent with input:", input);
    const result = await your_agent.invoke(input);
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in your-agent API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
```

## 9. Testing

Write tests for your agent in `test.ts`:

```typescript
import { graph } from "./index";

async function testAgent() {
  const result = await graph.invoke({
    input: {
      requiredParam: "test value",
      optionalParam: "optional test value"
    }
  });
  
  console.log("Test result:", result);
}

testAgent().catch(console.error);
```

## 10. Error Handling

Implement consistent error handling across all nodes:

1. Wrap node logic in try/catch blocks
2. Log errors with descriptive messages
3. Return error state that can be handled by the client
4. For critical errors, include enough context for debugging

## 11. Documentation

Each agent and node should include JSDoc comments:

```typescript
/**
 * Your Agent
 * 
 * This agent [describe what the agent does and its purpose].
 * 
 * @param state - Current state of the agent
 * @param config - LangGraph runtime configuration
 * @returns Updated state with results or error
 */
```

## Best Practices

1. **Modularity**: Break complex logic into separate node functions
2. **State Management**: Only update the parts of the state that have changed
3. **Error Handling**: Always handle errors gracefully and provide meaningful messages
4. **Configuration**: Use the provided config object for runtime settings
5. **Prompts**: Keep prompts in separate files for easier maintenance
6. **Types**: Use strong typing for all inputs, outputs, and state
7. **Testing**: Include tests for your agent's functionality
8. **Logging**: Use console.log for important events, but avoid excessive logging

## Integration with Shared Resources

Leverage these shared utilities:

- `utils.ts`: Contains helper functions for model initialization, content formatting, etc.
- Shared types from `@opencanvas/shared/types`
- Constants from `@opencanvas/shared/constants`

By following this framework, your agents will integrate seamlessly with the existing infrastructure and maintain consistency across the codebase.

## Cursor Implementation Rules

To ensure consistent agent development and proper integration with the platform, follow these cursor rules when implementing new agents:

### 1. Agent Creation Checklist

When creating a new agent, use this checklist to ensure all required components are implemented:

- [ ] Create agent directory: `apps/agents/src/[agent-name]/`
- [ ] Define state schema in `state.ts`
- [ ] Define input/output types in `types.ts`
- [ ] Create main graph definition in `index.ts`
- [ ] Implement node functions (either in `index.ts` or `nodes/` directory)
- [ ] Register agent in `langgraph.json`
- [ ] Add API route in `apps/web/src/app/api/agents/`
- [ ] Add basic test case

### 2. LangGraph Best Practices

Reference these sections from the LangGraph documentation when implementing specific features:

- For basic graph structure: [Learn the basics](https://langchain-ai.github.io/langgraph/tutorials/introduction/)
- For agent architectures: [Agent architectures](https://langchain-ai.github.io/langgraph/concepts/agentic_concepts/)
- For human-in-the-loop functionality: [Human-in-the-loop](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/)
- For memory implementation: [Memory](https://langchain-ai.github.io/langgraph/concepts/memory/)
- For multi-agent systems: [Multi-agent Systems](https://langchain-ai.github.io/langgraph/concepts/multi_agent/)
- For tool calling implementation: [How to call tools using ToolNode](https://langchain-ai.github.io/langgraph/how-tos/tool-calling/)

### 3. Code Snippets

#### Basic Agent Structure (VSCode snippet)

```json
{
  "New LangGraph Agent": {
    "prefix": "newagent",
    "body": [
      "/**",
      " * ${1:Agent Name} Agent",
      " * ",
      " * ${2:Brief description of what this agent does}",
      " */",
      "",
      "import {",
      "  type LangGraphRunnableConfig,",
      "  START,",
      "  StateGraph,",
      "} from \"@langchain/langgraph\";",
      "import { ${3:AgentName}Annotation, type ${3:AgentName}ReturnType } from \"./state\";",
      "",
      "/**",
      " * Main function for ${1:Agent Name} agent",
      " */",
      "export const ${4:functionName} = async (",
      "  state: typeof ${3:AgentName}Annotation.State,",
      "  config: LangGraphRunnableConfig",
      "): Promise<${3:AgentName}ReturnType> => {",
      "  try {",
      "    // Implementation logic",
      "    $0",
      "    ",
      "    return {",
      "      // Return updated state",
      "    };",
      "  } catch (error) {",
      "    console.error(\"Error in ${4:functionName}:\", error);",
      "    return {",
      "      error: error instanceof Error ? error.message : \"Unknown error\"",
      "    };",
      "  }",
      "};",
      "",
      "// Build the graph",
      "const builder = new StateGraph(${3:AgentName}Annotation)",
      "  .addNode(\"${5:nodeName}\", ${4:functionName})",
      "  .addEdge(START, \"${5:nodeName}\");",
      "",
      "export const graph = builder.compile();",
      "",
      "// Export the agent interface",
      "export const ${6:agent_name} = {",
      "  name: \"${6:agent_name}\",",
      "  metadata: {",
      "    description: \"${7:Agent description}\"",
      "  },",
      "  invoke: async (input: any) => {",
      "    console.log(\"${1:Agent Name} invoked with input:\", input);",
      "    const result = await graph.invoke({",
      "      input: input.input || input",
      "    });",
      "    return result;",
      "  },",
      "  stream: async function* (input?: any) {",
      "    const result = await graph.invoke({",
      "      input: input?.input || input || {}",
      "    });",
      "    yield result;",
      "  }",
      "};",
      ""
    ],
    "description": "Creates a new LangGraph agent structure"
  }
}
```

#### State Definition (VSCode snippet)

```json
{
  "LangGraph State Definition": {
    "prefix": "lgstate",
    "body": [
      "import { Annotation } from \"@langchain/langgraph\";",
      "import { ${1:AgentName}Input, ${1:AgentName}Output } from \"./types\";",
      "",
      "export const ${1:AgentName}Annotation = Annotation.Root({",
      "  /**",
      "   * The input parameters",
      "   */",
      "  input: Annotation<${1:AgentName}Input>,",
      "  ",
      "  /**",
      "   * The output result",
      "   */",
      "  output: Annotation<${1:AgentName}Output | undefined>,",
      "  ",
      "  /**",
      "   * Any errors that occurred",
      "   */",
      "  error: Annotation<string | undefined>,",
      "  $0",
      "});",
      "",
      "export type ${1:AgentName}ReturnType = Partial<",
      "  typeof ${1:AgentName}Annotation.State",
      ">;"
    ],
    "description": "Create a LangGraph state definition with annotations"
  }
}
```

#### Node Function (VSCode snippet)

```json
{
  "LangGraph Node Function": {
    "prefix": "lgnode",
    "body": [
      "/**",
      " * ${1:Node description}",
      " */",
      "export async function ${2:nodeName}(",
      "  state: typeof ${3:AgentName}Annotation.State,",
      "  config: LangGraphRunnableConfig",
      "): Promise<${3:AgentName}ReturnType> {",
      "  try {",
      "    // Node implementation",
      "    $0",
      "    ",
      "    return {",
      "      // Return updated state properties",
      "    };",
      "  } catch (error) {",
      "    console.error(\"Error in ${2:nodeName}:\", error);",
      "    return {",
      "      error: error instanceof Error ? error.message : \"Unknown error occurred\"",
      "    };",
      "  }",
      "}"
    ],
    "description": "Create a LangGraph node function with error handling"
  }
}
```

### 4. Implementation Guidelines

When implementing different agent features, follow these guidelines based on the LangGraph documentation:

#### Tool Calling

As described in the [How to call tools using ToolNode](https://langchain-ai.github.io/langgraph/how-tos/tool-calling/) documentation:

1. Use the `ToolNode` component for tool calling when possible
2. Handle tool errors properly as described in [How to handle tool calling errors](https://langchain-ai.github.io/langgraph/how-tos/tool-calling-errors/)
3. For updating state from tools, follow [How to update graph state from tools](https://langchain-ai.github.io/langgraph/how-tos/update-state-from-tools/)

#### Human-in-the-Loop

For agents that require human intervention:

1. Implement breakpoints as described in [How to edit graph state](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/edit-graph-state/)
2. Use the `interrupt()` function to pause execution for user input
3. For reviewing tool calls, follow the pattern in [How to Review Tool Calls](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/review-tool-calls/)

#### Memory Implementation

For agents that need memory:

1. Use the `MemorySaver` checkpointer for thread-level persistence
2. Implement cross-thread persistence when needed using `InMemoryStore`
3. Consider adding a summary of conversation history for longer interactions
4. Reference [How to add thread-level memory to a ReAct Agent](https://langchain-ai.github.io/langgraph/how-tos/create-react-agent-memory/)

#### Streaming

For streaming responses:

1. Use the appropriate streaming mode based on your needs: values, updates, custom, messages, or debug
2. When streaming from tools, follow [How to stream data from within a tool](https://langchain-ai.github.io/langgraph/how-tos/streaming-events-from-within-tools/)
3. For filtering token streaming, implement as shown in [How to stream LLM tokens from specific nodes](https://langchain-ai.github.io/langgraph/how-tos/streaming-specific-nodes/)

By following these cursor rules and implementation guidelines, you'll ensure consistent agent development that aligns with the established patterns and best practices from the LangGraph documentation.
