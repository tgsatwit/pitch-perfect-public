# Agent System Documentation

## Overview

Pitch Perfect uses a comprehensive agent system built on LangGraph to provide intelligent research, analysis, and content generation capabilities. The system consists of 8 specialized agents, each designed to handle specific aspects of the pitch generation workflow.

## Agent Architecture

All agents are implemented as LangGraph StateGraphs with the following common patterns:
- **Node-based workflow**: Each agent consists of multiple processing nodes
- **State management**: Shared state across all nodes in the workflow
- **Error handling**: Comprehensive error handling and recovery mechanisms
- **Streaming support**: Real-time progress updates via streaming responses
- **API integration**: REST API endpoints for web application integration

## Agent Catalog

### 1. Open Canvas Agent (`agent`)
**Location**: `apps/agents/src/open-canvas/index.ts`
**Purpose**: Interactive document collaboration and editing agent

#### Functionality
- **Document Generation**: Creates and modifies artifacts (documents, code, etc.)
- **Content Routing**: Intelligent routing between different content types
- **Web Search Integration**: Incorporates web search results into content
- **Follow-up Generation**: Automatically generates follow-up questions and suggestions
- **Reflection**: Maintains conversation memory and user preferences
- **Title Generation**: Creates contextual titles for conversations

#### Key Nodes
- `generatePath`: Routes to appropriate content generation strategy
- `generateArtifact`: Creates new artifacts from scratch
- `rewriteArtifact`: Modifies existing artifacts
- `updateArtifact`: Updates specific sections of artifacts
- `customAction`: Handles custom user actions
- `webSearch`: Integrates web search capabilities
- `reflect`: Updates user preferences and conversation memory
- `generateTitle`: Creates conversation titles

#### Triggers
- Integrated into main Open Canvas UI
- Triggered by user interactions in the document editor
- Accessed via LangGraph CLI during development

#### State Management
- Manages conversation messages and artifacts
- Tracks user preferences and style rules
- Maintains web search results and context

---

### 2. Client Search Agent (`client_search`)
**Location**: `apps/agents/src/client-search/index.ts`
**Purpose**: Basic company information retrieval and structuring

#### Functionality
- **Company Research**: Gathers basic company information using web search
- **Data Structuring**: Organizes company data into standardized format
- **Information Extraction**: Extracts key business details from search results

#### Key Features
- Uses Google Custom Search API for web research
- Processes search results with GPT-4 for structured extraction
- Focuses on Australian companies and market context
- Returns structured company profile data

#### Data Output
- Company description and industry classification
- Founding year and headquarters location
- Key products and services
- Market positioning and competitors
- Recent news and developments

#### Triggers
- **API Route**: `/api/agents/client-search`
- **Frontend Integration**: Called from client management interface
- **Method**: POST with `companyName` and optional `website`

---

### 3. Client Research Agent (`client_research`)
**Location**: `apps/agents/src/client-research/index.ts`
**Purpose**: Comprehensive business intelligence and banking opportunity analysis

#### Functionality
- **Multi-dimensional Research**: Conducts parallel research across multiple business areas
- **Financial Analysis**: Gathers financial metrics and performance data
- **Market Intelligence**: Analyzes market position and competitive landscape
- **Banking Opportunities**: Identifies specific banking service opportunities
- **Decision Maker Analysis**: Researches key executives and decision makers
- **News Analysis**: Monitors recent developments and market impact

#### Key Nodes
- `financial`: Analyzes financial performance and metrics
- `news`: Aggregates recent news and developments
- `marketPosition`: Evaluates market position and competitive landscape
- `bankingOpportunities`: Identifies banking service opportunities
- `decisionMakers`: Researches key executives and stakeholders
- `recentDevelopments`: Tracks recent business developments
- `aggregator`: Combines all research into comprehensive report
- `summarizer`: Creates executive summary of findings

#### Advanced Features
- **Parallel Processing**: Runs multiple research nodes simultaneously
- **Progress Tracking**: Real-time progress updates to frontend
- **Configurable Topics**: Allows selective research focus areas
- **Error Recovery**: Continues processing even if individual nodes fail

#### Data Output
- Financial overview and key metrics
- Market analysis and positioning
- SWOT analysis and strategic considerations
- Banking opportunities with rationale and urgency
- Recent developments and news analysis
- Decision maker profiles and contact information

#### Triggers
- **API Route**: `/api/agents/client-research`
- **Frontend Integration**: Client profile pages and research workflow
- **Firebase Integration**: Stores results in Firestore database
- **Method**: POST with research configuration and company details

---

### 4. Competitor Analysis Agent (`competitor_analysis`)
**Location**: `apps/agents/src/competitor-analysis/index.ts`
**Purpose**: Competitive intelligence and market positioning analysis

#### Functionality
- **Competitive Intelligence**: Comprehensive analysis of competitor companies
- **Market Positioning**: Understanding competitor market position and strategies
- **Product Analysis**: Detailed examination of competitor products and services
- **Executive Intelligence**: Research on competitor leadership teams
- **Pricing Analysis**: Competitor pricing strategies and models
- **Pitch Strategy**: Recommendations for competitive positioning in pitches

#### Key Nodes
- `financial`: Competitor financial performance analysis
- `news`: Recent competitor news and developments
- `executive`: Leadership team and key personnel analysis
- `products`: Product portfolio and service offering analysis
- `pricing`: Pricing strategy and competitive positioning
- `marketPosition`: Market share and competitive landscape analysis
- `pitchApproach`: Strategic recommendations for competitive positioning

#### Configurable Focus Areas
- Financial performance comparison
- Recent news and market developments
- Executive team analysis
- Product and service comparison
- Pricing and positioning strategy
- Market share and competitive dynamics

#### Data Output
- Comprehensive competitor profile
- Financial performance metrics
- Product and service analysis
- Executive team profiles
- Pricing and positioning insights
- Strategic recommendations for competitive advantage

#### Triggers
- **API Route**: `/api/agents/competitor-analysis`
- **Frontend Integration**: Competitor analysis workflow
- **Method**: POST with competitor details and focus areas

---

### 5. Slide Generation Agent (`slide_generation`)
**Location**: `apps/agents/src/slide-generation/index.ts`
**Purpose**: AI-powered pitch deck content generation

#### Functionality
- **Parallel Slide Generation**: Creates multiple slides simultaneously
- **Content Structuring**: Organizes content into professional slide formats
- **Quality Review**: Automated review and enhancement of generated content
- **Title Enhancement**: Generates compelling slide titles
- **Content Optimization**: Ensures narrative flow and eliminates repetition

#### Key Nodes
- `initializer`: Prepares slide generation context and outlines
- `slideGenerator`: Generates slide content in parallel
- `reviewer`: Reviews slides for quality and consistency
- `contentUpdater`: Updates slides based on review feedback
- `titleEnhancer`: Generates compelling slide titles
- `aggregator`: Combines all slides into final presentation

#### Advanced Features
- **Parallel Processing**: Generates multiple slides simultaneously for efficiency
- **Content Blocks**: Structured content blocks (title, text, bullets, charts, tables)
- **Speaker Notes**: Automatically generates speaker notes for each slide
- **Error Recovery**: Handles failures gracefully with fallback content
- **Progress Tracking**: Real-time progress updates during generation

#### Data Output
- Structured slide content with multiple content blocks
- Speaker notes and presentation guidance
- Generation metadata and processing statistics
- Quality assurance and review results

#### Triggers
- **API Route**: `/api/slide-generation`
- **Frontend Integration**: Pitch deck generation workflow
- **Method**: POST with pitch outline and slide selection

---

### 6. Web Search Agent (`web_search`)
**Location**: `apps/agents/src/web-search/index.ts`
**Purpose**: Intelligent web search and result processing

#### Functionality
- **Search Classification**: Determines if web search is needed
- **Query Generation**: Creates optimized search queries
- **Result Processing**: Filters and structures search results

#### Key Nodes
- `classifyMessage`: Determines if search is needed
- `queryGenerator`: Creates search queries
- `search`: Performs web search and filters results

#### Integration
- Used by other agents (especially Open Canvas) for web research
- Provides structured search results for content generation
- Intelligent query optimization for better results

---

### 7. Reflection Agent (`reflection`)
**Location**: `apps/agents/src/reflection/index.ts`
**Purpose**: User preference learning and conversation memory

#### Functionality
- **Memory Management**: Stores and retrieves user preferences
- **Style Learning**: Learns user writing and content preferences
- **Conversation Context**: Maintains context across conversations
- **Preference Updates**: Continuously updates user profile

#### Key Features
- Uses LangChain memory store for persistence
- Analyzes conversation patterns and user feedback
- Generates style rules and content preferences
- Integrates with Open Canvas for personalized content

#### Data Storage
- User style rules and preferences
- Conversation memories and context
- Content generation patterns
- Feedback and learning data

---

### 8. Summarizer Agent (`summarizer`)
**Location**: `apps/agents/src/summarizer/index.ts`
**Purpose**: Conversation summarization and context management

#### Functionality
- **Conversation Summarization**: Creates concise summaries of long conversations
- **Context Preservation**: Maintains important context while reducing token usage
- **Memory Management**: Optimizes conversation history for efficiency

#### Key Features
- Automatically triggered when conversation exceeds token limits
- Preserves essential context and user preferences
- Reduces conversation length while maintaining continuity
- Integrates with thread management system

## Integration Architecture

### API Layer
Each agent is exposed through dedicated API routes:
- `/api/agents/client-search` - Basic company information
- `/api/agents/client-research` - Comprehensive business intelligence
- `/api/agents/competitor-analysis` - Competitive intelligence
- `/api/slide-generation` - Pitch deck generation
- `/api/[..._path]` - LangGraph proxy for other agents

### Frontend Integration
Agents are integrated into the web application through:
- **Client Management**: Research and profile generation
- **Competitor Analysis**: Competitive intelligence workflows
- **Pitch Generation**: Slide content creation
- **Document Editing**: Open Canvas integration

### Data Persistence
- **Firebase Firestore**: Client research results and user data
- **LangGraph Memory**: Conversation context and preferences
- **Thread Management**: Conversation history and state

### Authentication & Security
- Firebase Authentication for user verification
- API key protection for external services
- Development mode bypass for testing
- Secure data handling and storage

## Development Workflow

### Local Development
1. **LangGraph CLI**: `cd apps/agents && yarn dev`
2. **Web Application**: `turbo dev --filter=@opencanvas/web`
3. **Agent Testing**: Direct invocation through LangGraph CLI

### Configuration
- **Environment Variables**: API keys and service configurations
- **Agent Registration**: `langgraph.json` defines available agents
- **Build Process**: TypeScript compilation and dependency management

### Monitoring & Debugging
- Console logging for agent execution
- Progress tracking and error reporting
- Performance metrics and execution time tracking

## Agent Communication Patterns

### Input/Output Structure
All agents follow consistent patterns:
- **Input**: Structured request with configuration options
- **Output**: Structured response with results and metadata
- **Error Handling**: Standardized error responses
- **Progress Updates**: Real-time status updates

### State Management
- **Shared State**: Common state structure across agent nodes
- **State Transitions**: Controlled transitions between processing steps
- **Error States**: Graceful error handling and recovery

### Streaming Support
- **Progress Updates**: Real-time progress notifications
- **Result Streaming**: Incremental result delivery
- **Error Streaming**: Real-time error reporting

## Best Practices

### Agent Development
1. **Node Isolation**: Each node should be independently testable
2. **Error Handling**: Comprehensive error handling and recovery
3. **State Management**: Clean state transitions and updates
4. **Performance**: Optimize for parallel processing where possible

### Integration Guidelines
1. **API Consistency**: Maintain consistent API patterns
2. **Authentication**: Secure all agent endpoints
3. **Data Validation**: Validate all inputs and outputs
4. **Error Reporting**: Provide meaningful error messages

### Monitoring & Maintenance
1. **Logging**: Comprehensive logging for debugging
2. **Performance Monitoring**: Track execution times and resource usage
3. **Error Tracking**: Monitor and respond to agent failures
4. **Version Control**: Maintain agent versioning and updates

## Future Enhancements

### Planned Features
- **ESG Analysis**: Environmental, Social, Governance analysis
- **Benchmarking**: Peer comparison and industry benchmarking
- **Advanced Analytics**: Machine learning-powered insights
- **Multi-language Support**: International market research

### Technical Improvements
- **Caching**: Intelligent caching for repeated queries
- **Load Balancing**: Distributed agent execution
- **Performance Optimization**: Faster processing and response times
- **Enhanced Error Recovery**: More robust error handling

This documentation provides a comprehensive overview of the agent system architecture, functionality, and integration patterns within the Pitch Perfect application.