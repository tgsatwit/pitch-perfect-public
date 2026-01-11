# Setting up a TypeScript Monorepo for a LangGraph-Powered Enterprise App

This guide walks through creating a unified **TypeScript monorepo** that integrates multiple LangGraph-based templates for an Institutional Banking app. We will **combine existing components** (Open Canvas, LangGraph agents, RAG retrieval, etc.) into one maintainable repository. Key focus areas include **monorepo structure**, migrating a Python agent to TypeScript, connecting the front-end (Open Canvas) to LangGraph agents via API routes, and deploying agents as AWS Lambda functions with persistent storage (DynamoDB). 

**Templates to be integrated:**

- **Open Canvas** (TypeScript): Next.js front-end for agent collaboration.  
- **LangGraph Deep Researcher** (Python): Replace with TS-based LangGraph equivalent (for deep company research).  
- **LangGraph Data Enrichment** (TypeScript): Agent template for company profile research.  
- **Internal Retrieval (RAG agent)**: Retrieving internal knowledge for context.  
- **Gen UI in Chat**: Chat-based enhancements or feedback collection in UI.  
- **LangGraph Multi-Agent Supervisor**: Orchestrator for multi-agent workflows.  
- **Agent Inbox**: For managing long-running jobs or queued pitch generation.

---

## 1. Monorepo Structure and Setup

We’ll use a **monorepo** so all pieces live in one repository, simplifying dependency sharing and cross-component changes. **Turborepo with pnpm** or **Nx** are great options, but here we’ll go with **Turborepo + pnpm workspaces** for its caching and parallelization benefits.

**Directory Layout:**

```
monorepo-root/
├─ apps/
│   ├─ web/             # Next.js (Open Canvas UI, Next 13+)
│   ├─ agents/          # LangGraph agent services (AWS Lambda handlers)
│   ├─ api/             # Additional backend API routes or BFF if needed
│   └─ ... (other apps)
├─ packages/
│   ├─ shared/          # Shared utilities, types, config (TS)
│   ├─ langgraph-graphs/ # LangGraph graph definitions (exported JSON or TS)
│   └─ ui-components/   # Shared UI components (if separate from web)
├─ infrastructure/
│   ├─ cdk/             # (Optional) AWS CDK/Terraform IaC for Lambdas & DynamoDB
│   └─ ... 
├─ turbo.json           # Turborepo configuration for build pipelines
├─ package.json         # Root package.json with workspaces
├─ tsconfig.json        # Base TS config extended by packages/apps
└─ .env.example         # Example env variables for entire monorepo
```

**Folder Descriptions:**

- **`apps/web`** – Next.js Open Canvas front-end. Houses pages for Dashboard, Company Profiles, Pitches, etc. (likely under `pages` or Next 13’s `app` directory). Uses Tailwind CSS and shadcn UI components as per the base template.
- **`apps/agents`** – LangGraph agents packaged as Node.js serverless functions. Each agent might be a sub-folder or file (e.g., `researcher.ts`, `enricher.ts`) exposing a handler function compatible with AWS Lambda (exported handler or specific signature).
- **`apps/api`** – (Optional) If using a BFF (Backend-for-Frontend) approach aside from direct Lambda usage. Alternatively, our Next.js app might call Lambdas directly using AWS SDK or HTTP endpoints.
- **`packages/shared`** – Common code (TypeScript) used by both front-end and agents: data models, Type definitions (e.g., Company profile schema, Pitch schema), utility functions (formatting, logging).
- **`packages/langgraph-graphs`** – If using LangGraph’s JSON graph definitions, store them here. For example, include `companyResearch.graph.json` (converted from the Python deep researcher) and `dataEnrichment.graph.json` from LangGraph Studio. These can be loaded by LangGraph at runtime.
- **`packages/ui-components`** – If you plan to reuse UI components or create a design system (could also be part of `shared`).
- **`infrastructure/cdk`** – Infrastructure-as-Code definitions (optional). For example, AWS CDK or Terraform for defining DynamoDB tables, Lambda deployments, etc. (Not required if deploying Lambdas manually or via serverless framework).

**Monorepo Configuration:**

- **pnpm Workspaces:** Configure `package.json` at the root:

  ```json
  {
    "name": "enterprise-monorepo",
    "private": true,
    "workspaces": [
      "apps/*",
      "packages/*"
    ],
    "devDependencies": {
      "turbo": "latest",
      "typescript": "5.x",
      // ... other dev tools
    }
  }
  ```

- **Turborepo Pipeline:** Add `turbo.json` to orchestrate builds:

  ```json
  {
    "$schema": "https://turbo.build/schema.json",
    "pipeline": {
      "build": {
        "dependsOn": ["^build"],
        "outputs": ["dist/**", ".next/**"]
      },
      "dev": {
        "cache": false
      }
      // etc.
    }
  }
  ```

- **TypeScript Config:** Create a base `tsconfig.json` at root, then extend it in each package/app. For example, in `packages/tsconfig.json` (if you have one) and each app’s tsconfig, reference the base. Ensure `paths` in tsconfig map to packages (for nice imports like `@enterprise/shared`).

**Install Dependencies:**

Each integrated module will bring in some dependencies:

- In `apps/web`: Next.js, React, Tailwind, shadcn UI, plus LangGraph client (for interacting with the LangGraph backend, if needed).
- In `apps/agents`: LangGraph JS/TS library (`langgraph` or related packages), AWS SDK v3 for DynamoDB and Lambda, any specific tools (e.g., if using the `@langchain/google` or `@langchain/webScraper` etc. for agent tools).
- In `packages/shared`: likely no external deps, just internal types/utilities.
- Use **pnpm** to install to the workspace, ensuring the right package is installed in the correct subfolder (pnpm will hoist as needed). For example:

  ```bash
  # From monorepo root
  pnpm install next react react-dom @langchain/langgraph @aws-sdk/client-dynamodb @aws-sdk/client-lambda @aws-sdk/lib-dynamodb
  # etc.
  ```

  *Tip:* The `open-canvas` repo uses Yarn, but pnpm can handle workspaces similarly. Adjust to your preferred tool.

**Cloning Template Code:**

We will **copy or clone key pieces** from each template into our monorepo:

- Open Canvas front-end: Use it as a base for `apps/web`. E.g., clone the `open-canvas` repo, then copy the `apps/web` directory into our `apps/web`. Also copy any global configs (tailwind, postcss, etc.) and relevant parts of `packages/shared` (particularly model configuration in `packages/shared/src/models.ts` if needed).
- LangGraph Data Enrichment: If the repo is TS-based (likely includes a `langgraph.json` or TS code for an enrichment agent), bring in the **graph definition** and any specialized code. E.g., copy `src/enrichment_agent` (or the exported `langgraph.json`) into `packages/langgraph-graphs/enrichment.graph.json` or similar. We will use LangGraph’s ability to register and load graphs via JSON.
- LangGraph Deep Researcher: Since it’s in Python, we need to **reimplement in TS**. The easiest path: export the graph from LangGraph Studio (if available) or read the Python logic to create an equivalent TS agent. If a JSON graph is obtainable from LangGraph Studio, use that as a starting point (placing it in `packages/langgraph-graphs/deepResearch.graph.json`). Otherwise, code the agent in TS using LangGraph’s JS API.
- Multi-Agent Supervisor: This might come as either a pattern or library. Check if LangGraph JS has a supervisor utility (like `createAgentSupervisor`). We will integrate the *pattern* rather than code: possibly in our “pitch generation” flow, which involves multiple agents. If the multi-agent orchestration is complex, consider designing a LangGraph graph in Studio, then exporting it. For now, plan to coordinate agents in a single LangGraph graph using the supervisor node pattern.
- Agent Inbox: Likely more of a concept (queue management). We might implement this by having a DynamoDB table (or SQS) track job statuses, and a simple Next.js page for “Inbox” that shows running/completed tasks. The “Inbox” can poll a status endpoint or subscribe via WebSockets (if advanced).
- Gen UI in Chat: Use Open Canvas’s chat interface for collecting user feedback or additional instructions, integrated into the Pitch flow. Possibly this is just a front-end component that we ensure is accessible in our UI.

After copying/cloning, **refactor namespaces** to use our monorepo’s scope. For example, update imports from open-canvas’s `@langchain/anthropic` as needed, ensure environment variables are centralized, etc.

---

## 2. Standardizing Environment Configuration

Managing environment variables across a monorepo can get tricky. We want a **single source of truth** for config like API keys, model settings, and AWS credentials:

- **Root `.env`**: Keep a root `.env` (not committed) for shared secrets (LLM API keys, AWS creds, etc.). As in Open Canvas, we might have one `.env` for LangGraph server and one for frontend. In our case, since Lambdas will be separate processes, we’ll likely have:
  - **`.env` at root**: For development, used by LangGraph agents when running locally (via LangGraph CLI or Node processes). Include keys like `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc., plus AWS creds if needed locally.
  - **`.env.local` in `apps/web`** (or `apps/web/.env`): For Next.js frontend-specific vars. E.g., `NEXT_PUBLIC_SUPABASE_URL` if using Supabase for auth (Open Canvas suggests this), and perhaps a `NEXT_PUBLIC_API_BASE_URL` if front-end needs to call an API Gateway or specific backend URL.
  - **AWS Credentials**: For local dev, you might rely on AWS CLI config or environment vars (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) to allow the app to call AWS services. In production, use IAM roles or secrets managers.
  - Ensure all example env values are documented in `.env.example` files for both root and relevant apps (like `apps/web/.env.example`).

**Shared Config Module:** In `packages/shared/config.ts`, you can write a TypeScript module that reads environment variables and provides typed configuration to the rest of the app. For example:

```ts
// packages/shared/src/config.ts
export const Config = {
  openAiKey: process.env.OPENAI_API_KEY!,
  anthropicKey: process.env.ANTHROPIC_API_KEY!,
  // ... other keys
  dynamoTableName: process.env.DYNAMO_TABLE_NAME || "LangGraphOutputs",
  // e.g., LLM model selection, etc.
};
```

This way, both Next.js (Node side) and Lambdas can import Config and use the same variable names.

**Note:** Never commit actual secrets. Use AWS Parameter Store or Secrets Manager in production, and inject them via environment variables at deploy time (Lambda console or IaC tool).

---

## 3. Building the Front-End (Open Canvas UI)

The **Dashboard**, **Company Profiles**, and **Pitches** pages will be implemented in the Next.js app:

- **Dashboard**: Overview of recent activity, maybe links to companies and pitches (can adapt from Open Canvas’s home or create custom).
- **Company Profiles**: CRUD pages where a user can Add a company, View details, Edit, Delete. When viewing a profile, include a button like “Run Research” which triggers the LangGraph Data Enrichment agent to update that profile with latest data (e.g., fetch news, financials).
- **Pitches**: CRUD pages for pitch documents. Creating a pitch might launch a multi-step process orchestrated by the LangGraph Multi-Agent Supervisor (e.g., one agent gathers data, another writes narrative, etc., coordinated together).

**Using Open Canvas**: We will use Open Canvas as the base, meaning we get a lot of UI and agent-collaboration features out of the box:

- Copy `apps/web` from Open Canvas (or re-use that structure).
- Ensure it’s configured to communicate with our LangGraph agents. In Open Canvas, the front-end communicates with a local LangGraph server via a WebSocket/HTTP interface (LangGraph CLI runs a server). In our setup, we might not run a persistent LangGraph server. Instead, each agent is deployed as a serverless function.

**Options to connect UI ↔ agents:**

1. **Next.js API Routes**: Create API route files in `apps/web/pages/api` (or `/app/api` if using App Router) that act as **proxy** to AWS Lambda. When a user clicks "Run Research", we call e.g. `POST /api/run-research` which then uses AWS SDK to invoke the corresponding Lambda.

2. **Direct Client Calls**: Alternatively, call an API Gateway endpoint from the front-end directly. But since we have a Next.js backend, using API routes provides more control (and hides AWS details from the client).

We’ll proceed with **API Routes** approach:

- **Example API Route (Trigger Research)**:

  ```ts
  // apps/web/pages/api/run-research.ts
  import type { NextApiRequest, NextApiResponse } from 'next';
  import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
  
  const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION });
  const FUNCTION_NAME = process.env.RESEARCH_LAMBDA_NAME || "deepResearchAgent";

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const { companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId' });
    }
    try {
      // Prepare payload for Lambda (e.g., include company info or ID for DB lookup)
      const payload = { companyId };
      const command = new InvokeCommand({
        FunctionName: FUNCTION_NAME,
        Payload: Buffer.from(JSON.stringify(payload)),
        LogType: "Tail"
      });
      const response = await lambdaClient.send(command);
      const resultJson = response.Payload 
        ? JSON.parse(Buffer.from(response.Payload).toString()) 
        : null;
      // We assume our Lambda returns some result (like updated data or task ID).
      return res.status(200).json({ result: resultJson });
    } catch (err: any) {
      console.error("Lambda invocation failed", err);
      return res.status(500).json({ error: "Failed to invoke research agent" });
    }
  }
  ```

  Here we used AWS SDK v3’s `LambdaClient` and `InvokeCommand` to synchronously invoke the Lambda ([Lambda examples using SDK for JavaScript (v3) - AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_lambda_code_examples.html#:~:text=const%20command%20%3D%20new%20InvokeCommand%28,Tail)). We also requested `LogType: "Tail"` so we can capture logs if needed (they come base64-encoded in `LogResult`) ([Lambda examples using SDK for JavaScript (v3) - AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_lambda_code_examples.html#:~:text=const%20command%20%3D%20new%20InvokeCommand%28,Tail)) ([Lambda examples using SDK for JavaScript (v3) - AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_lambda_code_examples.html#:~:text=const%20,logs%2C%20result)). In practice, you might call asynchronously and poll for result via another mechanism if research is long-running, but for initial simplicity, synchronous call is fine.

- **API Route for Pitches**: Similarly, a `POST /api/generate-pitch` could invoke a pitch agent Lambda, possibly using a supervisor pattern. If pitch generation is lengthy, consider making the Lambda put results in DynamoDB, then immediately return a “Job ID”, and use WebSocket or polling to fetch the result when ready (this is where **Agent Inbox** comes in – more on that in Section 6).

- **Securing API Routes**: Ensure these routes are protected (only logged-in users can call). If using NextAuth or Supabase Auth (Open Canvas uses Supabase Auth), verify the session token before invoking Lambdas.

**Front-End UI Integration:**

- For **Company Profile Page** (e.g., `/companies/[id].tsx`): Display company info (from DB) and a “Research” button. The button onClick calls a Next.js API route (like above) using `fetch('/api/run-research', { method: 'POST', body: JSON.stringify({companyId}) })`. Show a loading state and then update the UI once response arrives (maybe show new data fetched or status).
- For **Pitch Page** (e.g., `/pitches/[id].tsx` if editing existing, or a creation wizard flow): Possibly incorporate the Open Canvas component. Open Canvas provides a canvas for multi-agent collaboration (like a doc editor with agent assistance). You might incorporate it such that when starting a new Pitch, it opens a Canvas instance with a custom agent group (the Multi-Agent Supervisor coordinating a writer agent and researcher agent). This is an advanced integration – at minimum, you can have a simpler flow: user clicks “Generate Pitch”, triggers the pitch Lambda, and result (pitch content) is saved to DB and displayed.

**Tailwind and shadcn UI**: Open Canvas already uses Tailwind CSS. Ensure `tailwind.config.js` is copied over and includes paths to our components in `apps/web`. If using shadcn UI (Radix + Tailwind components), ensure those are set up in the design system or within the web app.

---

## 4. Implementing LangGraph Agents in TypeScript

This is the core backend logic. We want each agent to be an AWS Lambda-compatible function, ideally stateless (any long-term state is in DynamoDB or other storage).

**Deep Researcher Agent (TS)**: This replaces the Python version. If we have the logic or graph from the Python, reimplement in TS. There are two approaches:

- **Code First**: Use LangGraph’s TypeScript API to define the agent’s steps and tools. E.g., use `AgentNode` classes, define a sequence: search web, scrape content, extract data, validate results. (Check LangGraph JS docs or examples for similar flows; they might have JS notebooks similar to Python ones for multi-agent).
- **Graph JSON**: If you exported a `langgraph.json` from the Python project, you can load that. For example, LangGraph CLI or library might allow something like:

  ```ts
  import { loadGraph } from 'langgraph'; 
  import deepResearchGraphDef from 'packages/langgraph-graphs/deepResearch.graph.json';
  
  const deepResearchAgent = loadGraph(deepResearchGraphDef);
  // Then you can invoke deepResearchAgent as needed
  ```

  Or directly use CLI in dev to run it (but in Lambda, we want programmatic usage).

Given our needs, writing a custom TS agent might be simpler to start. For example:

```ts
// apps/agents/deepResearcher.ts (Lambda handler)
import { APIGatewayProxyHandler } from 'aws-lambda';  // AWS Lambda types for handler
import { initiateWebResearch } from '@enterprise/shared/agents'; // assume we implement core logic in shared

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  const { companyId } = body;
  if (!companyId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing companyId" }),
    };
  }
  try {
    const result = await initiateWebResearch(companyId);
    // Perhaps `result` is an object with enriched data.
    // Save to DynamoDB:
    // (We'll cover DynamoDB in Section 5)
    await saveResearchResultToDynamo(companyId, result);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result }),
    };
  } catch (e: any) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message || "Agent failed" }),
    };
  }
};
```

In this example, `initiateWebResearch` might orchestrate multiple LangChain/LangGraph calls: e.g., use a search tool (like calling an API or using a library) then an LLM to summarize data. If using LangChain.js tools, you can incorporate them (ensuring any required API keys are configured in env).

**Data Enrichment Agent**: If we imported a graph (like the one in the data-enrichment template), we can instantiate it similarly. Alternatively, code it out: it might take an input “Topic” (here, company name or domain) and “Output Schema” (the JSON structure we want, e.g., `{ name: string; ceo: string; revenue: number; ... }`). This agent would:
1. Search for info about the company.
2. Scrape or retrieve relevant pages.
3. Use LLM to extract the specific info according to the schema.
4. Return structured data (and possibly validation).

Using LangGraph’s approach, you could define this with multiple nodes (perhaps using `GraphBuilder` in TS if available). But a simpler coding approach: use LangChain’s RetrievalQA or Tools within a custom chain.

Since the focus is LangGraph, if the LangGraph JS library provides a runtime for graphs defined in JSON (like the one in `langgraph.json`), prefer that for consistency. 

**Multi-Agent Supervisor**: For pitch generation, where multiple agents are involved (e.g., a Strategy Agent, a Writer Agent, maybe a QA Agent):
- Define a graph where nodes are these agents, and a supervisor coordinates them. Perhaps one agent researches the company and market, another writes the pitch, and a supervisor agent (could be an LLM itself) decides when each runs and merges results.
- In TS, implement as either:
  - A single Lambda that internally runs a sequence of steps (calls to other agents or subroutines).
  - Or multiple Lambdas triggered in sequence (but that complicates state sharing—likely better to have one Lambda run the whole workflow synchronously, given Lambda can run up to 15 minutes which should suffice).

To keep it simple: one **pitch-generation Lambda** that uses LangGraph to coordinate sub-agents. Pseudocode:

```ts
async function generatePitch(companyId: string) {
   // 1. Use researcher agent (could call initiateWebResearch or similar):
   const researchData = await initiateWebResearch(companyId);
   // 2. Use an LLM agent to write a pitch using the research data:
   const pitchContent = await callLLM(`
      Using the following data: ${JSON.stringify(researchData)},
      write a comprehensive pitch covering key points...`);
   // 3. Possibly have a critique or refinement step:
   const refinedPitch = await callLLM(`
      Review the pitch for completeness and tone, suggest improvements or finalize if good:\n\n${pitchContent}`);
   return refinedPitch;
}
```

This is a simplistic approach not fully leveraging LangGraph’s parallel agent potential, but it’s easier to implement. With LangGraph, you could design this visually and then run it.

**Agent Inbox Consideration**: If pitch generation is long, instead of making the client wait on the API call, have the API route quickly trigger the Lambda (maybe via SNS or EventBridge or simply asynchronous invocation) and immediately return a “job started” acknowledgment. The front-end can then show the job in an “Agent Inbox” page, which lists ongoing jobs and their status (polling a status API or using WebSockets if using something like AWS AppSync or Ably). DynamoDB can store job statuses.

For now, let’s outline a simpler path: synchronous calls for research (quick) and maybe asynchronous for pitch (since it could be slower). But for completeness, we’ll mention how to track and manage such tasks.

**Registering or Importing Graphs:**

If using LangGraph’s CLI or runtime, you might have to **register graphs** (like how Open Canvas has `langgraph.json` at root). In Open Canvas, running `apps/agents` dev likely reads that file.

In our monorepo, we can do:

- Provide a combined `langgraph.json` that includes all graphs (possible if LangGraph CLI supports multiple graphs in one file or directory).
- Or run multiple processes: but since we want one monorepo, better to have one “LangGraph service” that knows about all agent graphs.

**Option 1:** Use LangGraph CLI in dev – e.g., in `apps/agents`, run `npx @langchain/langgraph-cli dev --port 54321` to load graphs (point it to our graphs directory). Ensure `langgraph.json` or config is set up to load those graph definitions.

**Option 2:** Write a custom server (or use Next.js API as a server) that loads the LangGraph JSON and exposes endpoints.

Since we’re packaging as Lambdas, perhaps we don’t need a persistent server except for local dev. In local dev, you could indeed run `apps/agents:dev` that spins up all agents for testing. Open Canvas, for example, does exactly that by instructing: “Navigate to `apps/agents` and run `yarn dev` (runs `langgraph-cli dev ...`)” ([GitHub - langchain-ai/open-canvas:  A better UX for chat, writing content, and coding with LLMs.](https://github.com/langchain-ai/open-canvas#:~:text=Navigate%20to%20,port%2054367)).

**Step to Register Graphs Locally:**

- In `apps/agents/langgraph.json`, combine entries for each agent. For example:

  ```json
  {
    "agents": [
      {
        "name": "dataEnricher",
        "graph": "./graphs/data-enrichment.graph.json"
      },
      {
        "name": "deepResearcher",
        "graph": "./graphs/deep-research.graph.json"
      },
      {
        "name": "pitchSupervisor",
        "graph": "./graphs/pitch-supervisor.graph.json"
      }
    ]
  }
  ```

  (The exact schema depends on LangGraph CLI expectations.)

- Run `pnpm dev -r agents` (where `-r` runs in the `apps/agents` package) to spin up LangGraph server on a port. Confirm it's running via logs (it might output something like “LangGraph server listening on port X”).

- Then `pnpm dev -r web` to run Next.js. In Next.js `.env.local`, set something like `NEXT_PUBLIC_LANGGRAPH_ENDPOINT=http://localhost:PORT` if the front-end will connect directly. However, in our approach, we might not use the LangGraph server at all, instead going through Next.js API routes that call Lambdas. So Open Canvas’s usual WebSocket connection might not be used here. We may want to disable or repurpose it.

Given the complexity, one approach: use Open Canvas’s UI but override its mechanism to talk to backend:
  - Possibly modify Open Canvas’s code that normally connects to the LangGraph server (perhaps it uses `langgraph-client` or direct WS) to instead call our API routes for specific actions (like quick actions or artifact generation). This requires front-end code changes.

Alternatively, we can run a local LangGraph server for dev, and in production, rely on Lambdas. To emulate that, perhaps deploy LangGraph graphs to a managed LangGraph Platform (out of scope, likely not desired since we want AWS Lambda).

**Conclusion**: For clarity, focus on **stateless Lambdas** and Next.js API routes connecting to them, with minimal LangGraph server usage.

---

## 5. Deploying Agents as AWS Lambdas

Each agent (or group of agents) will be an AWS Lambda function. We need to handle:

- **Build & Bundle**: Use esbuild or webpack to create a single JS file per Lambda with all deps (AWS SDK, LangGraph, etc.). Since we’re in a monorepo, we can configure Turborepo to build Lambdas. For instance, in `apps/agents/package.json`, have scripts like:

  ```json
  "scripts": {
    "build": "esbuild src/deepResearcher.ts --bundle --platform=node --target=node18 --outfile=dist/deepResearcher.js",
    // similarly for other agents...
  }
  ```

  Or use AWS Lambda’s support for Node.js by deploying source (not recommended due to size) or using a bundler. Alternatively, use the CDK or Serverless Framework which handle packaging.

- **Deployment**:
  - *Dev (Local)*: As mentioned, run locally via LangGraph CLI or Node processes.
  - *Prod (AWS)*: Use AWS CDK, Serverless Framework (YAML), or even manual AWS Console for initial setup.
  
  **Using AWS CDK**: (In `infrastructure/cdk` directory)
  
  Example CDK pseudo-code:
  ```ts
  // cdk/lib/agents-stack.ts
  import * as lambda from 'aws-cdk-lib/aws-lambda';
  const deepResearchFn = new lambda.Function(stack, 'DeepResearchFn', {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'deepResearcher.handler', // matches export in file
    code: lambda.Code.fromAsset(path.join(__dirname, '../../apps/agents/dist/deepResearcher.zip')),
    timeout: Duration.minutes(5),
    environment: {
      DYNAMO_TABLE_NAME: "LangGraphOutputs",
      // Include any API keys needed (or consider using Secrets Manager)
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      // ...
    }
  });
  // Repeat for other Lambdas (or factor into a loop).
  ```
  This assumes we package each Lambda into a zip in `dist/`. CDK can invoke Docker to build if needed, or we ensure our build outputs a ready directory.

  **Serverless Framework** (YAML) could be simpler for multiple Lambdas, but since we might also define DynamoDB, IAM roles, etc., CDK or Terraform gives full control. The turborepo example with CDKTF (Terraform CDK) shows environment variables being set for AWS and Vercel, and deploying both front and back via one command.

  *Choose one strategy* and document it. For brevity, assume CDK or Terraform is used to create:
  - A DynamoDB table (for storing outputs/logs).
  - The Lambda functions with necessary IAM (each Lambda likely needs permission to write to DynamoDB).
  - Possibly an API Gateway if you want to expose Lambdas to web directly. But since Next.js can invoke via SDK, you might not need API Gateway endpoints publicly.

- **Dev vs Prod Differences**: 
  - *Local dev*: uses local environment, possibly localstack for DynamoDB if you want to avoid hitting real AWS (or just use a dev table in AWS).
  - *Prod*: environment variables come from AWS config. Use separate `.env.prod` or rely on CI to inject secrets into CDK.
  - Next.js front-end: in dev, it might call Lambdas through the AWS SDK using your AWS credentials. This requires your dev machine has AWS creds (in env or config file). In prod (say you deploy Next.js to Vercel or Amplify), ensure it has permission (you might give Vercel an AWS IAM role, or expose a secured API Gateway endpoint and call that).

- **Deployment Steps**:
  1. Build everything: `pnpm run build` (Turborepo ensures apps and packages built in correct order).
  2. Package Lambdas if needed (zipping).
  3. Deploy infra: e.g., `cd infrastructure/cdk && cdktf deploy` or `cdk deploy`.
  4. Deploy front-end: if using Vercel/Amplify, just push code. If using a custom deployment (e.g., an EC2 or container), ensure environment variables for contacting Lambdas are set (like Lambda ARNs or API URLs).

  If using Vercel, note Vercel can’t directly use AWS SDK without credentials; you may prefer to deploy Next.js via Amplify so it’s in AWS and can use IAM roles (Amplify can integrate with monorepos). Or simply call API Gateway endpoints (which is just HTTP). For simplicity, if the Next app is public, maybe create API Gateway REST endpoints for each Lambda, and have Next call those via fetch. This decouples needing AWS creds in the front-end.

  **Alternate Approach**: Deploy Next.js on AWS as well (e.g., using ECS or even as a Lambda with OpenNext). That way, everything is in AWS and can share IAM. However, that’s beyond the core scope here.

---

## 6. Data Persistence with DynamoDB

The app will persist outputs (company profiles, pitch content, agent logs) in DynamoDB. Likely tables:

- **Companies** table: Company profiles (with fields like Name, Industry, etc., plus enriched data).
- **Pitches** table: Generated pitch content, references to company, status (draft, completed, etc.).
- **AgentOutputs** table (optional): To log detailed outputs or intermediate results, or to serve as the “Agent Inbox” data source for jobs.

**Setting up DynamoDB:**

Using CDK or AWS CLI, create these tables. For instance, in CDK:

```ts
new dynamodb.Table(stack, "CompaniesTable", {
  tableName: "Companies",
  partitionKey: { name: "CompanyID", type: dynamodb.AttributeType.STRING }
});
```

Likewise for Pitches (partition key PitchID) and AgentOutputs (partition key JobID or similar, or use composite key if listing by user).

**Access from Lambdas:**

- The AWS SDK v3 for DynamoDB is already in our dependencies (`@aws-sdk/lib-dynamodb` for convenience). We can use `DynamoDBDocumentClient` and the higher-level commands for ease.
- Give Lambdas permission to read/write these tables (via IAM policies in CDK/Serverless config).

**Example: Save research result to DynamoDB**:

```ts
// packages/shared/db.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function saveResearchResultToDynamo(companyId: string, data: object) {
  const params = {
    TableName: process.env.DYNAMO_TABLE_NAME || "Companies",
    Item: {
      CompanyID: companyId,
      LastResearchAt: Date.now(),
      ...data  // spread the fields of the result into the item
    }
  };
  await docClient.send(new PutCommand(params));
}
```

This uses `PutCommand` from `lib-dynamodb` which handles marshalling types automatically. The table should have `CompanyID` as primary key (and perhaps a sort key like `AttributeType` if storing different item types – but here we just update the company item itself with new data).

For Pitches, you might do similar with a `Pitches` table, or store pitch content in the Companies table as a nested attribute if one pitch per company (but likely multiple pitches, so separate table is better).

**Reading in Next.js**:

- On the front-end, say the Company Profile page is getServerSideProps or uses SWR to fetch the latest data. We can create an API route `/api/company/[id]` that fetches from DynamoDB via AWS SDK and returns JSON (or use a direct Lambda/API Gateway call).
- Alternatively, integrate with a data layer (Apollo GraphQL or Prisma with DynamoDB via an adapter). But simple is fine: Next API route queries Dynamo and sends data.

**Agent Inbox (Job Tracking)**:

If implementing, define an `AgentJobs` table: `JobID` (primary key), `Status` (Pending, Running, Completed), `Result` (maybe stored if small, or link to S3 if large), `Type` (e.g., "PITCH_GENERATION"), and timestamps. When a long job starts, Lambda writes an item with `Status = Running`. If synchronous, Lambda can update it to `Completed` with result before finishing. If asynchronous (e.g., you trigger another process), then you need a mechanism to update later (outside scope; likely not needed if we do sync within Lambda’s execution).

Front-end can display these jobs by scanning/querying this table (e.g., by user ID if multi-user; include a GSI on UserID for jobs).

---

## 7. Triggering Graph Workflows from UI Actions

We touched on this in the front-end section, but let’s clearly map **user actions → agent triggers**:

- **“Run Research” (Company page)**:
  - **User Action**: Click “Run Research”.
  - **Front-end**: onClick -> call `/api/run-research` (Next.js API route) with companyId.
  - **API Route**: (as written before) calls AWS Lambda DeepResearchAgent via SDK.
  - **Lambda DeepResearchAgent**: Performs web research, enriches data, stores in DynamoDB, returns result.
  - **API Route**: Responds to front-end with success (maybe the new data, or simply a success status).
  - **Front-end**: Optionally refresh the company data on screen with new info (could re-fetch from `/api/company/[id]`).

- **“Generate Pitch” (Pitch page)**:
  - **User Action**: Click “Generate Pitch” (maybe after selecting a company or giving some parameters).
  - **Front-end**: onClick -> call `/api/generate-pitch` with necessary info (companyId, maybe pitch style or other inputs).
  - **API Route**: calls Lambda PitchAgent.
  - **Lambda PitchAgent**: Coordinates multi-agent workflow to produce pitch, saves pitch to DynamoDB (in Pitches table), returns a job ID or result.
  - **API Route**: If quick enough, returns the pitch content. If not, returns a job ID.
  - **Front-end**: 
    - If pitch content is returned, navigate to pitch detail page showing the content.
    - If job ID returned, maybe redirect to “Pitch Queue” page or update UI to show it’s processing. The Pitch Queue (Agent Inbox) page can list pending pitches (by querying AgentJobs table for current user).
    - Possibly use web socket or SSE to notify when done (out of scope for now, but could integrate by having Lambda send a notification or client polling `/api/job-status?id=XYZ`).

- **Chat-based UI enhancements (Gen UI in Chat)**:
  - If using an in-chat feedback loop, e.g., user can ask follow-up questions in the Open Canvas chat:
  - The Open Canvas chat is already designed to let user and agents converse and refine content. Ensure our pitch or research agents are integrated as “tools” or accessible in that chat.
  - For instance, in Open Canvas, you could add a custom quick action: “Summarize Company Profile” that when clicked, uses the agent to summarize current content.
  - To implement, define a quick action in Open Canvas config, which when triggered calls our API route or LangGraph server. This would require hooking into Open Canvas’s extension points (likely through adding to some config or component array in the UI code).

**Connecting Agents to UI**: The main pattern is that UI actions either directly call Next API which calls Lambda, or UI connects via WebSocket to a running LangGraph server. We’ve chosen the former for production parity. During dev, you might still allow UI to talk to local LangGraph server for rapid iteration (which might require running that server and pointing UI to it).

If you do want that dual approach:
- In dev `.env`, set something like `NEXT_PUBLIC_USE_LOCAL_LG=true` and if true, front-end uses LangGraph’s client to connect to `localhost:54321`. Otherwise (prod or false), front-end calls API routes to interact with AWS. This gives flexibility in development.

---

## 8. Logging, Monitoring, and Testing Agents

Maintaining **logs** and **observability** is crucial for agents:

- Use **LangSmith** (LangChain’s observability tool) in dev to trace agent runs. For example, integrate LangSmith’s client and log traces of each chain step. However, in Lambda, sending traces externally might not be allowed, so possibly limit to dev mode.
- Use CloudWatch Logs for Lambdas in production. Make sure to log important events (as shown with `console.error` in catch blocks).
- Set up structured logging (JSON logs) if possible, to make parsing easier.

**Secrets Management**: Don’t hardcode keys. Use env vars which in AWS can be set in Lambda configuration or loaded from AWS Secrets Manager. During dev, they’re in your `.env` file.

**Testing Agents**:

- **Unit tests**: Write tests for smaller functions (e.g., a function that parses LLM output into structured data). For LangGraph flows, maybe break them into components that can be tested with mocked LLM outputs.
- **Integration tests**: Perhaps run a local DynamoDB (or use a separate AWS test table) and invoke the agent function locally to see end-to-end behavior. You could use **LangGraph CLI** to simulate runs as well if using the graph definitions.
- Use the **LangGraph Studio** (if available) to visually test your graph. The Data Enrichment template likely has instructions to run the graph in Studio for manual testing.
- Ensure to test error cases: e.g., web search fails, or LLM returns insufficient data, etc., and see how agent handles (maybe via retry or sending an error message back).

**Managing Logs**:

- Consolidate logs either in CloudWatch or push to an external service (Datadog, etc.) via a sidecar or Lambda extension, if enterprise requirements demand.
- For dev, simple console logging is fine; you can view Lambda output in your terminal if using `serverless invoke local` or after deployment via CloudWatch.

---

## 9. Organizing Code for Maintainability

With many moving parts, keep code organized and modular:

- **Shared Types**: In `packages/shared/src/types.ts`, define interfaces such as:

  ```ts
  export interface CompanyProfile {
    id: string;
    name: string;
    industry: string;
    // ... other fields
    enrichedData?: {
      ceo?: string;
      revenue?: string;
      latestNews?: string[];
      // etc.
    };
  }
  export interface Pitch {
    id: string;
    companyId: string;
    content: string;
    status: 'DRAFT' | 'GENERATING' | 'COMPLETE';
    // ...
  }
  export interface AgentJob {
    id: string;
    type: 'PITCH' | 'RESEARCH';
    status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
    result?: any;
    userId: string;
    startedAt: number;
    completedAt?: number;
  }
  ```
- **Shared Utils**: e.g., a function to format a prompt, or to call an LLM model (wrapping LangChain API calls). This avoids duplicating logic in multiple Lambdas. Example:

  ```ts
  import { OpenAI } from "langchain/llms/openai";
  const llm = new OpenAI({ temperature: 0.7, openAIApiKey: Config.openAiKey });
  export async function summarizeText(text: string): Promise<string> {
    const prompt = `Summarize the following:\n"${text}"`;
    return await llm.call(prompt);
  }
  ```
  Then any agent can use `summarizeText` as needed, abstracting the model details.

- **LangGraph Bindings**: If LangGraph JS allows binding a JSON graph to a function, centralize that. For example, a helper that takes a graph JSON and input, and executes it (maybe via LangGraph CLI under the hood or using the `invoke` method if available).
- **UI Components**: If some UI pieces are complex (e.g., a Pitch Canvas component that wraps Open Canvas’s editor), keep them modular in `packages/ui-components` or within `apps/web` under components/.

- **Naming**: Use clear names for Lambda functions and their source files (match them to avoid confusion). Use prefixes if needed (e.g., `IB-Researcher-Lambda`, `IB-PitchGenerator-Lambda` in AWS).

**Collaboration**: Since multiple templates are being combined, document within the repo:
- A README at root explaining how the pieces fit (some of which is in this guide).
- Perhaps READMEs in each package (Open Canvas’s original README can be trimmed and included in `apps/web/README.md` for reference).
- Cross-reference the origin of code (comments like “Based on LangGraph Data Enrichment template”).

**Agent Testing**: Possibly create a CLI script in `apps/agents` that can run an agent locally with sample input, to test outside of AWS. For example:

```ts
// apps/agents/scripts/testResearch.ts
(async () => {
  const result = await initiateWebResearch("TestCorp Inc");
  console.log("Result:", JSON.stringify(result, null, 2));
})();
```

Then `ts-node scripts/testResearch.ts` while your env vars are set. This helps quick iteration.

---

## 10. Wrapping Up and Next Steps

We now have a blueprint for a **unified TypeScript monorepo** that includes:

- **Directory structure** to host front-end and multiple back-end agents.
- **Instructions to clone and integrate** code from existing templates (Open Canvas UI, LangGraph graphs).
- **Standardized environment configuration** for consistent API keys and settings.
- **Graph registration** during development (via LangGraph CLI or code) to load and test LangGraph workflows.
- **Front-end ↔ Agent connections** through Next.js API routes and optionally direct WS for local dev.
- **AWS Lambda deployment** of each agent, including build and environment differences for dev/prod.
- **Data persistence in DynamoDB** with examples of writing and reading data.
- **User-triggered workflows** mapped to agent invocations (e.g., Run Research → enrichment agent, Generate Pitch → multi-agent flow).
- **Logging and testing practices** to ensure reliability (LangSmith for debugging, CloudWatch in prod).
- **Maintainable code organization** with shared modules for models, prompts, and utilities.

By following this guide, a full-stack engineer can scaffold the monorepo, integrate the pieces, and gradually refine the agents and UI to deliver a powerful Institutional Banking research and pitch-generation application powered by LangGraph and modern TypeScript tooling. Good luck, and happy coding!

