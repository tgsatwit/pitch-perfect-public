# Agentic System – Technical Design Overview

## 1. Philosophy: A System-First, Agentic Approach

Traditional "single agent" solutions focus on linear input-output interactions (e.g. *“Ask → Answer”*). Pitch Perfect takes an explicitly **agentic system** stance:

1. **Composability over monoliths** – Multiple specialised agents cooperate inside a LangGraph **StateGraph**, each tackling a well-defined responsibility.
2. **Contextual continuity** – Shared state flows through every node, enabling long-lived reasoning and memory rather than ephemeral requests.
3. **Progressive disclosure** – The system surfaces intermediate results, metrics and controls so the human can steer at every stage.
4. **Extensible contracts** – Clear I/O schemas allow new nodes, tools or entire agent families to be added without refactoring the core.

> Result: We do not ship "an agent" that *creates a pitch* – we deliver **an orchestration framework** that partners with users through every micro-decision on the journey.

---

## 2. Modular Architecture

| Layer | Purpose | Key Assets |
|-------|---------|------------|
| **Presentation (Next JS)** | React pages & headless UI library for interaction | `apps/web/src/app` + `/components/ui` |
| **Settings Framework** | Canonical *pitch stage*, *slide structure* & *key principles* definitions | `apps/web/src/app/settings` UI, `settingsService`, Firestore collections |
| **Agent Graphs (LangGraph)** | Parallel, reusable sub-graphs (client-research, competitor-analysis, slide-generation, …) | `apps/agents/src/**` |
| **Shared Utilities** | Typed models, prompt libraries, firebase utils, constants | `packages/shared`, `packages/firebase-utils` |
| **Persistence** | Firestore (pitch documents, research snapshots, settings) | security-ruled, versioned |

### 2.1 Node Pattern

Every research/creation capability is packaged as **`node.ts`** exporting a `(state) => output` signature. Nodes are:

* **Pure** (stateless apart from arguments)
* **Schema-validated** (Zod)
* **Swappable** (any node can be replaced with a newer algorithm)

### 2.2 Extensibility hooks

* **Router Nodes** decide which branches to activate – new topics only require updating the router map.
* **Graph Overlay** – new graphs can be registered in `langgraph.json` and discovered automatically by the web tier.
* **Settings templates** – fallback creators allow rapid seeding of new slide or stage templates without code changes.

---

## 3. Context Construction & Propagation

```
Client → Context → Outline → Slides → Review
        ▲         │          │
        └── Research / Competitive Intelligence Feeds
```

1. **Entity-level caches**
   * *Client*, *Competitor* and *Pitch* documents store canonical facts.
2. **Dynamic augmentation**
   * Each workflow step may request *additional* input – e.g. outline stage asks for strategic priorities not captured earlier.
3. **Selective surfacing**
   * Nodes only read the slices of context relevant to their contract (e.g. Slide Generator needs outline + research, not raw settings).
4. **Type safety**
   * `packages/shared/types.ts` defines cross-layer contracts to avoid drift.

---

## 4. Settings-Driven Structure

The `/settings` UI allows administrators to tune **best-practice defaults** while preserving user freedom:

* **Pitch Stages** – macro workflow checkpoints (Setup → Context → …).
* **Slide Structures** – required/optional slides per stage.
* **Key Principles** – global guard-rails (tone, compliance, messaging).

Because these artefacts live in Firestore, updates propagate instantly to every agent run – no redeploy required.

---

## 5. Innovative User-Control Features

| Feature | Agentic Benefit |
|---------|-----------------|
| **Quick Actions** | One-click “simulate stakeholder feedback”, “tighten narrative”, etc. leverage dedicated LangGraph mini-flows while keeping the human in the loop. |
| **Practice Mode** | AI personas critique delivery, turning static slides into an interactive coaching loop. |
| **Streaming Progress** | Frontend receives SSE tokens from LangGraph so users watch each node finish and can intervene early. |
| **Dialog-based CRUD** | Settings, templates and principles can be added/edited live, immediately altering subsequent generations. |

---

## 6. Tooling & Technology Choices

* **LangGraph** – deterministic state machines + parallel branches.
* **Zod** – runtime schema validation for every node output.
* **Firebase** – zero-ops real-time store, auth & security rules.
* **Next JS (App Router)** – server actions for secure agent invocation, client components for rich UX.
* **ShadCN/UI** – accessible component library aligned to Tailwind design tokens.

---

## 7. Lifecycle Walkthrough

1. **Setup Stage**
   * User selects client → triggers *client-research* graph (parallel nodes).
   * Results cached under `/clients/{id}.research`.
2. **Context Stage**
   * UI merges research with competitive analysis; user augments sentiment & pain points.
3. **Outline Generation**
   * `outline-generator` graph consumes settings (stages/structures/principles) + context.
   * Quick Actions allow iterative improvement without leaving the step.
4. **Slide Generation**
   * Parallel `slide-generation` graph per slide; reviewer sub-graph ensures quality gates.
5. **Practice / Review**
   * Reflection agent summarises conversation & stores style preferences.

Each step is re-entrant – users may jump back, tweak settings, add data, and re-run only the affected graphs.

---

## 8. Comparison: System vs. Monolithic Agent

| Dimension | Monolithic Agent | Pitch Perfect System |
|-----------|------------------|----------------------|
| **Scope** | Single prompt → single answer | Multi-stage workflow with context persistence |
| **Transparency** | Black-box | Node-level progress, intermediate artefacts |
| **Extensibility** | Hard to modify | Plug-in nodes & templates |
| **User Control** | Limited parameters | CRUD settings, quick actions, practice feedback |
| **Reliability** | Single failure kills run | Node-level error recovery & retries |

---

## 9. Future-Proofing

* **ESG, Tech-Assessment, Supply-Chain nodes** ready to be dropped into the router.
* **LLM swap** – underlying models isolated behind `getModelFromConfig` helper.
* **Caching & Cost Optimisation** – upcoming memoisation layer will short-circuit repeated research queries.

---

## 10. Conclusion

By architecting Pitch Perfect as a **system of collaborating agents** bound by shared state, validated contracts and live-editable settings, we provide:

* **Best-practice defaults** *(institutional banking know-how encoded)*
* **Granular user steering** *(not a rigid co-pilot)*
* **End-to-end context awareness**
* **Rapid extensibility** to new domains, tools and research paradigms.

This agentic, modular foundation ensures the platform can continuously evolve while consistently producing world-class, context-rich pitches tailored to every unique client scenario. 