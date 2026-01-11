# Pitch Deck Presentation Components

This directory contains components for the banking pitch deck builder - a PowerPoint-like slide editor specifically designed for creating financial presentations.

## Components Overview

### Core Components

- **SlideCanvas**: Canvas-based slide editor using React Konva for drag, resize, and positioning
- **EnhancedSlideEditor**: Main editor interface with property controls and slide editing features
- **SlideNavigator**: Navigation and management of multiple slides with thumbnail view
- **ExportToPDF**: Export functionality to create PDF documents from slide presentations

### Template Components

- **SlideTemplates**: Pre-built templates for banking presentations
- **TemplateSelector**: UI component for selecting and applying templates
- **CompanyLogo**: Component for adding and managing company logos

## PDF Export Feature

The PDF export functionality allows users to generate high-quality PDF documents from their pitch deck presentations.

### Usage

```jsx
import { ExportToPDF, SlidesForExport } from '@/components/presentation/ExportToPDF';

// In your component:
<ExportToPDF 
  slides={slidesArray} 
  presentationTitle="Banking Services Proposal" 
/>

// Include hidden container somewhere in your component:
<SlidesForExport slides={slidesArray} />
```

### How It Works

1. **Export Button**: Displays a "Export to PDF" button in the UI
2. **Hidden Rendering**: Uses a hidden container to render slides for export
3. **HTML to Canvas**: Converts each slide to a canvas using html2canvas
4. **PDF Generation**: Creates a PDF document with jsPDF from the canvas images
5. **Download**: Automatically downloads the PDF with a filename based on the presentation title

### Configuration Options

- **slides**: Array of SlideData objects to be exported
- **presentationTitle**: Title for the PDF document and filename
- **width/height**: Optional dimensions for the slide canvas (default: 960x540)

## Implementation Details

The export process follows these steps:

1. The user clicks the "Export to PDF" button
2. The component finds the hidden container with rendered slides
3. Each slide is converted to a canvas with high-quality settings
4. The canvases are added to a multi-page PDF document
5. The PDF is saved with a sanitized filename based on the presentation title
6. The document is downloaded to the user's device

## Dependencies

- **jspdf**: For creating PDF documents
- **html2canvas**: For converting HTML elements to canvas
- **react-konva**: For canvas-based slide editing

## Future Enhancements

- PowerPoint (PPTX) export support
- Customizable page sizes and orientations
- Additional export options (quality settings, compression, etc.)
- Direct sharing to cloud services 

### Presentation Mode

The Presentation Mode provides a professional, distraction-free environment for delivering pitch presentations to clients:

- **Full-screen mode**: Present slides at maximum screen size with minimal UI distractions
- **Presenter view**: Optional side panel with presenter notes and next slide preview
- **Slide transitions**: Smooth animations between slides for a professional appearance
- **Presentation timer**: Track presentation time with optional reset functionality
- **Keyboard shortcuts**: Navigate presentations efficiently with keyboard controls

#### Key Components:

- `PresentationMode.tsx`: Main component for the full-screen presentation experience
- `PresenterNotes.tsx`: Component for adding and editing presenter notes
- `/pitches/present/page.tsx`: Demo page showcasing the presentation features

#### Keyboard Shortcuts:

- **Next slide**: Right arrow, Space, N
- **Previous slide**: Left arrow, Page Up, P
- **Toggle full-screen**: F
- **Toggle presenter view**: O
- **Hide/show controls**: H
- **Exit presentation**: Escape

### Undo/Redo Functionality

The pitch deck builder includes a comprehensive undo/redo system that tracks edit history:

- **State History Management**: Track changes to slides with intuitive navigation
- **Multiple History Levels**: Support for both individual slide editing and deck-wide changes
- **Visual Controls**: Easily accessible undo/redo buttons in the editor interface
- **Keyboard Shortcuts**:
  - `Ctrl+Z` / `Cmd+Z`: Undo the last action
  - `Ctrl+Y` / `Cmd+Y`: Redo the previously undone action

#### Implementation Details:

- Uses a custom `useHistory` hook that manages state history with separate undo and redo stacks
- Optimized to only add to history when state actually changes (using JSON comparison)
- Integrates with both the EnhancedSlideEditor (single slide edits) and SlideNavigator (multi-slide changes)
- Supports keyboard shortcuts with focus management for accessibility

#### Key Components:

- `use-history.ts`: Custom React hook for history state management
- `UndoRedo.tsx`: UI component with tooltip-enhanced buttons for history navigation
- Integration with existing components for seamless editing experience

### PDF Export

```jsx
import { ExportToPDF, SlidesForExport } from '@/components/presentation/ExportToPDF';

// In your component:
<ExportToPDF 
  slides={slidesArray} 
  presentationTitle="Banking Services Proposal" 
/>

// Include hidden container somewhere in your component:
<SlidesForExport slides={slidesArray} />
```

### How It Works

1. **Export Button**: Displays a "Export to PDF" button in the UI
2. **Hidden Rendering**: Uses a hidden container to render slides for export
3. **HTML to Canvas**: Converts each slide to a canvas using html2canvas
4. **PDF Generation**: Creates a PDF document with jsPDF from the canvas images
5. **Download**: Automatically downloads the PDF with a filename based on the presentation title

### Configuration Options

- **slides**: Array of SlideData objects to be exported
- **presentationTitle**: Title for the PDF document and filename
- **width/height**: Optional dimensions for the slide canvas (default: 960x540)

## Implementation Details

The export process follows these steps:

1. The user clicks the "Export to PDF" button
2. The component finds the hidden container with rendered slides
3. Each slide is converted to a canvas with high-quality settings
4. The canvases are added to a multi-page PDF document
5. The PDF is saved with a sanitized filename based on the presentation title
6. The document is downloaded to the user's device

## Dependencies

- **jspdf**: For creating PDF documents
- **html2canvas**: For converting HTML elements to canvas
- **react-konva**: For canvas-based slide editing

## Future Enhancements

- PowerPoint (PPTX) export support
- Customizable page sizes and orientations
- Additional export options (quality settings, compression, etc.)
- Direct sharing to cloud services 