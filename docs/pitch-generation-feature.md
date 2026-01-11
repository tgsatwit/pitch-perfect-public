# Pitch Generation Feature

This document outlines the Pitch Generation feature implementation in the Pitch Perfect application.

## Overview

The Pitch Generation feature allows users to:

1. Create and configure pitches for specific companies
2. View and edit generated pitch content
3. Provide feedback and suggestions for pitch improvement

## Components

### 1. Pitch Creation

The pitch creation flow includes a form that allows users to configure parameters for pitch generation:

File: `apps/web/src/components/PitchForm.tsx`

- Company selection (must have companies already in the system)
- Pitch type selection (Investment, Partnership, Sales, or Custom)
- Target audience specification
- Section configuration based on pitch type
- Additional context or specific requirements

### 2. Pitch Editor

The pitch editor allows viewing and editing generated pitches:

File: `apps/web/src/components/PitchEditor.tsx`

- Display of pitch title, executive summary, and sections
- Collapsible sections for better readability
- Edit mode for revising pitch content
- Save functionality for updated content

### 3. Pitch Review System

The review system enables feedback collection to improve future pitches:

File: `apps/web/src/components/PitchReview.tsx`

- Rating system for overall quality, clarity, persuasiveness, and accuracy
- Comments field for general feedback
- Suggestions input for specific improvements
- Review submission functionality

## Workflow

1. User navigates to `/pitches/new` and completes the pitch form
2. Form submission triggers the API call to initiate pitch generation
3. During generation, the user can view the pitch's status in the list
4. Once complete, the user can view, edit, and provide feedback on the pitch

## API Endpoints

### Pitch Creation and Management

- `POST /api/pitches` - Create a new pitch generation job
- `GET /api/pitches` - List all pitches
- `GET /api/pitches/:id` - Get a specific pitch details
- `PATCH /api/pitches/:id` - Update pitch content
- `DELETE /api/pitches/:id` - Delete a pitch

### Pitch Reviews

- `POST /api/pitches/:id/reviews` - Submit a review for a pitch
- `GET /api/pitches/:id/reviews` - Get all reviews for a pitch

## Data Flow

1. User submits pitch generation form
2. Front-end sends request to the API
3. API invokes LangGraph pitch generator agent Lambda function
4. Lambda processes the request, generates the pitch, and stores it in DynamoDB
5. Front-end polls or receives notification when pitch is ready
6. User can view, edit, and provide feedback on the generated pitch

## Testing

The feature includes:

1. **Unit tests** for components:
   - `PitchForm.test.tsx` - Tests form rendering, validation, and submission
   - `PitchEditor.test.tsx` - Tests display and editing features
   - `PitchReview.test.tsx` - Tests review submission and rating systems

2. **Integration tests** for the workflow:
   - `PitchGeneration.test.tsx` - Tests the end-to-end pitch creation process

3. **API tests**:
   - Tests for each endpoint to ensure correct data handling

## Technical Implementation

### LangGraph Agent

The pitch generation is powered by LangGraph, using:

- A structured chain of LLM calls to generate different pitch sections
- Research results from the company research feature as input
- Templates specific to each pitch type
- A validation step to ensure quality and format compliance

### Storage

Pitches are stored in DynamoDB with the following key structure:

- `PitchID` - Primary key for the pitch
- `CompanyID` - Reference to the company the pitch is for
- `UserID` - Owner of the pitch
- `Content` - The actual pitch content with sections
- `Status` - Current status of the pitch (DRAFT, GENERATING, COMPLETE, FAILED)
- `CreatedAt` and `UpdatedAt` timestamps

## Future Improvements

- Real-time updates via WebSockets instead of polling
- Export options (PDF, PPTX, DOCX)
- More customization options for pitch structure
- Pitch comparison tool for A/B testing different approaches
- Integration with CRM systems for tracking pitch effectiveness 