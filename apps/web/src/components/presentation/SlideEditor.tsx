import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight, FileText, Edit2, Eye, Plus, Trash2, ArrowUp, ArrowDown, Settings, Wand2, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyLogo } from './CompanyLogo';
import { SlideOutlineData, SlideData, SlideGenerationRequest, ContentSectionType } from './types';
import './slide-editor.css';
import { slideContentGenerationService } from './services/SlideContentGenerationService';
import { slideContentAIGenerator } from './services/SlideContentAIGenerator';


// Interface for content sections
export interface SlideEditorProps {
  slide: SlideData;
  onChange: (slideData: SlideData) => void;
  className?: string;
  slideOutlineData?: SlideOutlineData;
  onPreviousSlide?: () => void;
  onNextSlide?: () => void;
}

// Types for components
interface ComponentLibraryItem {
  id: string;
  type: string;
  name: string;
  content: any;
}

// Interface for slide content sections
interface ContentSection {
  id: string;
  type: ContentSectionType;
  content: any;
}

export function SlideEditor({ 
  slide, 
  onChange, 
  className, 
  slideOutlineData,
  onPreviousSlide,
  onNextSlide 
}: SlideEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(slide.content || {});
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [isOutlineSectionCollapsed, setIsOutlineSectionCollapsed] = useState(true);
  const [isGenerateSectionCollapsed, setIsGenerateSectionCollapsed] = useState(true);
  const [isComponentsSectionCollapsed, setIsComponentsSectionCollapsed] = useState(true);
  const [isContentSectionCollapsed, setIsContentSectionCollapsed] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  
  // New state for component library
  const [selectedComponent, setSelectedComponent] = useState<ContentSection | null>(null);
  
  // Component library items
  const componentLibrary = [
    { id: 'heading', name: 'Heading', type: 'heading', content: { text: 'New Heading', size: 'large' } },
    { id: 'text', name: 'Text', type: 'text', content: { text: 'New text paragraph' } },
    { id: 'bullet-list', name: 'Bullet List', type: 'bullet-list', content: { items: ['Item 1', 'Item 2', 'Item 3'] } },
    { id: 'columns', name: 'Columns', type: 'columns', content: { columns: [
      { content: 'Left column content' },
      { content: 'Right column content' }
    ]} },
    { id: 'chart', name: 'Chart', type: 'chart', content: { chartType: 'bar', labels: ['Label 1', 'Label 2', 'Label 3'], values: [10, 20, 30] } },
  ];
  
  // Make sure we have a slide with valid content
  useEffect(() => {
    if (!slide || !slide.content) {
      console.warn('Invalid slide data:', slide);
      return;
    }
    
    setEditedContent(slide.content);
    
    // Initialize content sections from slide content or create defaults based on slide type
    initializeContentSections();
  }, [slide.id, slide.type]);
  
  // Initialize sections based on slide type and content
  const initializeContentSections = () => {
    // If the slide already has sections, use those
    if (slide.content && slide.content.sections && Array.isArray(slide.content.sections)) {
      setContentSections(slide.content.sections);
      return;
    }
    
    // Otherwise create default sections based on slide type
    let defaultSections: ContentSection[] = [];
    
    switch (slide.type) {
      case 'title':
        defaultSections = [
          {
            id: generateId('heading'),
            type: 'heading',
            content: {
              text: slide.content?.title || 'Presentation Title',
              level: 1
            }
          },
          {
            id: generateId('text'),
            type: 'text',
            content: {
              text: slide.content?.subtitle || 'Subtitle'
            }
          }
        ];
        break;
        
      case 'content':
        defaultSections = [
          {
            id: generateId('heading'),
            type: 'heading',
            content: {
              text: slide.content?.title || 'Content Title',
              level: 2
            }
          },
          {
            id: generateId('bullet-list'),
            type: 'bullet-list',
            content: {
              items: slide.content?.body ? 
                formatBulletPoints(slide.content.body) :
                ['Point 1', 'Point 2', 'Point 3']
            }
          }
        ];
        break;
        
      case 'chart':
        defaultSections = [
          {
            id: generateId('heading'),
            type: 'heading',
            content: {
              text: slide.content?.title || 'Chart Title',
              level: 2
            }
          },
          {
            id: generateId('chart'),
            type: 'chart',
            content: {
              chartType: slide.content?.chartType || 'bar',
              data: slide.content?.data || {
                labels: ['Category A', 'Category B', 'Category C'],
                values: [30, 50, 20]
              }
            }
          }
        ];
        break;
        
      case 'table':
        defaultSections = [
          {
            id: generateId('heading'),
            type: 'heading',
            content: {
              text: slide.content?.title || 'Table Title',
              level: 2
            }
          },
          {
            id: generateId('table'),
            type: 'table',
            content: {
              headers: slide.content?.headers || ['Column 1', 'Column 2', 'Column 3'],
              data: slide.content?.data || [
                { cells: ['Data 1', 'Data 2', 'Data 3'] },
                { cells: ['Data 4', 'Data 5', 'Data 6'] }
              ]
            }
          }
        ];
        break;
        
      default:
        defaultSections = [
          {
            id: generateId('heading'),
            type: 'heading',
            content: {
              text: slide.content?.title || 'Slide Title',
              level: 2
            }
          },
          {
            id: generateId('text'),
            type: 'text',
            content: {
              text: slide.content?.body || 'Content goes here'
            }
          }
        ];
    }
    
    setContentSections(defaultSections);
  };

  // Generate a unique ID for a section
  const generateId = (prefix: string) => {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  };

  // Handle content changes and propagate to parent
  const handleContentChange = (field: string, value: any) => {
    const updatedContent = { ...editedContent, [field]: value };
    setEditedContent(updatedContent);
    
    // Propagate changes to parent
    const updatedSlide = {
      id: slide.id,
      type: slide.type,
      content: {
        ...updatedContent,
        sections: contentSections
      }
    };
    
    onChange(updatedSlide);
  };
  
  // Update a content section
  const updateContentSection = (sectionId: string, newContent: any) => {
    const updatedSections = contentSections.map(section => {
      if (section.id === sectionId) {
        return { ...section, content: newContent };
      }
      return section;
    });
    setContentSections(updatedSections);
    
    // Also update the selected component if it's the one being modified
    if (selectedComponent && selectedComponent.id === sectionId) {
      setSelectedComponent({ ...selectedComponent, content: newContent });
    }
    
    // Propagate changes to parent
    const updatedSlide = {
      ...slide,
      content: {
        ...slide.content,
        sections: updatedSections
      }
    };
    onChange(updatedSlide);
  };
  
  // Add a new content section
  const addContentSection = (type: ContentSectionType, position: number = contentSections.length) => {
    let newSection: ContentSection;
    
    switch (type) {
      case 'text':
        newSection = {
          id: generateId('text'),
          type: 'text',
          content: {
            text: 'New text content'
          }
        };
        break;
        
      case 'bullet-list':
        newSection = {
          id: generateId('bullet-list'),
          type: 'bullet-list',
          content: {
            items: ['New bullet point']
          }
        };
        break;
        
      case 'chart':
        newSection = {
          id: generateId('chart'),
          type: 'chart',
          content: {
            chartType: 'bar',
            data: {
              labels: ['Category A', 'Category B', 'Category C'],
              values: [30, 50, 20]
            }
          }
        };
        break;
        
      case 'table':
        newSection = {
          id: generateId('table'),
          type: 'table',
          content: {
            headers: ['Column 1', 'Column 2', 'Column 3'],
            data: [
              { cells: ['Data 1', 'Data 2', 'Data 3'] },
              { cells: ['Data 4', 'Data 5', 'Data 6'] }
            ]
          }
        };
            break;
            
      case 'heading':
        newSection = {
          id: generateId('heading'),
          type: 'heading',
          content: {
            text: 'New Heading',
            level: 2
          }
        };
            break;
            
      case 'image':
        newSection = {
          id: generateId('image'),
          type: 'image',
          content: {
            src: '',
            alt: 'Image',
            caption: 'Image caption'
          }
        };
            break;
        
      case 'columns':
        newSection = {
          id: generateId('columns'),
          type: 'columns',
          content: {
            columns: [
              { content: 'Left column content' },
              { content: 'Right column content' }
            ]
          }
        };
        break;
        
      default:
        newSection = {
          id: generateId('text'),
          type: 'text',
          content: {
            text: 'New content'
          }
        };
    }
    
    const newSections = [
      ...contentSections.slice(0, position),
      newSection,
      ...contentSections.slice(position)
    ];
    
    setContentSections(newSections);
    
    // Propagate changes to parent
    const updatedSlide = {
      id: slide.id,
      type: slide.type,
      content: {
        ...editedContent,
        sections: newSections
      }
    };
    
    onChange(updatedSlide);
    
    // Select the newly added component
    setSelectedComponent(newSection);
  };
  
  // Handle component click from library
  const handleComponentClick = (component: ComponentLibraryItem) => {
    const newId = `section-${Date.now()}`;
    const newSection: ContentSection = {
      id: newId,
      type: component.type as ContentSectionType,
      content: component.content || {}
    };
    
    // Add the new section and select it
    setContentSections([...contentSections, newSection]);
    handleComponentSelect(newSection);
  };
  
  // Handle component selection for editing
  const handleComponentSelect = (section: ContentSection) => {
    setSelectedComponent(section);
  };
  
  // Remove a content section
  const removeContentSection = (sectionId: string) => {
    if (contentSections.length <= 1) {
      // Don't allow removing the last section
      return;
    }
    
    const updatedSections = contentSections.filter(section => section.id !== sectionId);
    setContentSections(updatedSections);
    
    // Propagate changes to parent
    const updatedSlide = {
      id: slide.id,
      type: slide.type,
      content: {
        ...editedContent,
        sections: updatedSections
      }
    };
    
    onChange(updatedSlide);
    
    // Clear selected component if it was the one removed
    if (selectedComponent && selectedComponent.id === sectionId) {
      setSelectedComponent(null);
    }
  };
  
  // Move a section up or down
  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sectionIndex = contentSections.findIndex(section => section.id === sectionId);
    if (sectionIndex === -1) return;
    
    const newIndex = direction === 'up' ? Math.max(0, sectionIndex - 1) : Math.min(contentSections.length - 1, sectionIndex + 1);
    if (newIndex === sectionIndex) return;
    
    const newSections = [...contentSections];
    const [movedSection] = newSections.splice(sectionIndex, 1);
    newSections.splice(newIndex, 0, movedSection);
    
    setContentSections(newSections);
    
    // Propagate changes to parent
    const updatedSlide = {
      id: slide.id,
      type: slide.type,
      content: {
        ...editedContent,
        sections: newSections
      }
    };
    
    onChange(updatedSlide);
  };

  // Format bullet points
  const formatBulletPoints = (text: string | undefined) => {
    if (!text) return [];
    
    return text.split('\n')
      .filter(line => line.trim())
      .map(line => line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim());
  };

  // Generate content for the entire slide
  const generateSlideContent = async () => {
    if (!slideOutlineData) {
      console.error('No slide outline data available');
      return;
    }
    
    setIsGeneratingContent(true);
    
    try {
      // Use our content generation service to generate content
      const generationRequest: SlideGenerationRequest = {
        slideType: slide.type,
        slideOutline: slideOutlineData,
        options: {
          useOutline: true,
          useSupportingEvidence: true,
          useResearch: true
        }
      };
      
      const sections = await slideContentGenerationService.generateSlideContent(generationRequest);
      
      // Update sections with the new content
      setContentSections(sections);
      
      // Propagate changes to parent
      const updatedSlide = {
        ...slide,
        content: {
          ...editedContent,
          title: slideOutlineData.title,
          sections
        }
      };
      
      onChange(updatedSlide);
      
    } catch (error) {
      console.error('Error generating slide content:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Generate content for a specific section
  const generateSectionContent = async (sectionId: string, sectionType: ContentSectionType) => {
    if (!slideOutlineData) {
      console.error('No slide outline data available');
      return;
    }
    
    try {
      // Use the AI generator for section content
      const sectionContent = await slideContentAIGenerator.generateSectionContent(
        sectionType,
        slideOutlineData
      );
      
      if (sectionContent) {
        // Update the section with the generated content
        updateContentSection(sectionId, sectionContent);
      }
    } catch (error) {
      console.error('Error generating section content:', error);
    }
  };

  // Render content section with the main content and controls
  const renderContentSection = (section: ContentSection, index: number) => {
    return (
      <div 
        key={section.id} 
        className={`content-section relative mb-3 rounded-md border ${
          selectedComponent?.id === section.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
        }`}
        onClick={() => handleComponentSelect(section)}
      >
        {/* Controls that appear when section is selected - now horizontal above the block */}
        {selectedComponent?.id === section.id && (
          <div className="section-controls absolute -top-9 right-0 flex items-center space-x-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 w-7 p-0"
              disabled={index === 0}
              onClick={() => moveSection(section.id, 'up')}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 w-7 p-0" 
              disabled={index === contentSections.length - 1}
              onClick={() => moveSection(section.id, 'down')}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 w-7 p-0"
              onClick={() => removeContentSection(section.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        )}
        
        <div className="section-content p-2">
          {renderSectionContent(section)}
        </div>
      </div>
    );
  };
  
  // Render the content of a section based on its type
  const renderSectionContent = (section: ContentSection) => {
    switch (section.type) {
      case 'heading':
        return renderHeadingSection(section);
      case 'text':
        return renderTextSection(section);
      case 'bullet-list':
        return renderBulletListSection(section);
      case 'chart':
        return renderChartSection(section);
      case 'table':
        return renderTableSection(section);
      case 'image':
        return renderImageSection(section);
      case 'columns':
        return renderColumnsSection(section);
      default:
        return <div>Unknown section type: {section.type}</div>;
    }
  };
  
  // Render heading section
  const renderHeadingSection = (section: ContentSection) => {
    const { text, level = 2, align = 'center' } = section.content;
    
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
    const textSizeClass = level === 1 ? 'text-4xl font-bold mb-6' : 'text-2xl font-semibold mb-4';
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    
    return (
      <HeadingTag className={`${textSizeClass} ${alignClass}`}>
        {text || 'Heading'}
      </HeadingTag>
    );
  };
  
  // Render text section
  const renderTextSection = (section: ContentSection) => {
    const { text, size = 'M', align = 'left' } = section.content;
    
    const sizeClass = 
      size === 'XXL' ? 'text-2xl' :
      size === 'XL' ? 'text-xl' :
      size === 'L' ? 'text-lg' :
      size === 'M' ? 'text-base' :
      'text-sm';
    
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    
    return (
      <p className={`${sizeClass} ${alignClass}`}>
        {text || 'Text content'}
      </p>
    );
  };
  
  // Render bullet list section
  const renderBulletListSection = (section: ContentSection) => {
    let items = section.content.items || [];
    
    if (!Array.isArray(items)) {
      console.warn('Invalid bullet list items:', items);
      items = [];
    }
    
    return (
      <ul className="slide-bullets space-y-2 list-disc pl-5">
        {items.map((item: string, idx: number) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  };
  
  // Render columns section
  const renderColumnsSection = (section: ContentSection) => {
    const { columns = [{ content: '' }, { content: '' }] } = section.content;
    
    return (
      <div className="columns-section grid grid-cols-2 gap-4">
        {columns.map((column: any, idx: number) => (
          <div key={idx} className="column p-2 border border-dashed border-slate-200 rounded min-h-[100px]">
            {column.content || `Column ${idx + 1} content`}
          </div>
        ))}
      </div>
    );
  };
  
  // Render chart section
  const renderChartSection = (section: ContentSection) => {
    const { chartType = 'bar', data } = section.content;
    
    return (
      <div className="chart-section">
        <div className="chart-container flex justify-center items-center my-6 min-h-[200px] bg-slate-50 border rounded p-4">
          <div className="text-center">
            <div className="text-lg font-medium">{chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart</div>
            <div className="text-slate-500 text-sm">Chart visualization would appear here</div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render table section
  const renderTableSection = (section: ContentSection) => {
    const { headers = ['Column 1', 'Column 2', 'Column 3'], data = [] } = section.content;
    
    return (
      <div className="table-section">
        <div className="table-container mt-6 flex justify-center">
          <table className="slide-table w-full border-collapse">
            <thead>
              <tr className="bg-indigo-100">
                {headers.map((header: string, idx: number) => (
                  <th key={idx} className="border border-slate-300 p-2 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.length === 0 ? [
                { cells: ['Data 1', 'Data 2', 'Data 3'] },
                { cells: ['Data 4', 'Data 5', 'Data 6'] }
              ] : data).map((row: any, rowIdx: number) => (
                <tr key={rowIdx}>
                  {(row.cells || []).map((cell: string, cellIdx: number) => (
                    <td key={cellIdx} className="border border-slate-300 p-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render image section
  const renderImageSection = (section: ContentSection) => {
    const { src, alt, caption } = section.content;
    
    return (
      <div className="image-section flex flex-col items-center">
        <div className="image-container border border-slate-200 bg-slate-50 rounded overflow-hidden p-2 mb-2 w-full max-w-lg flex justify-center">
          {src ? (
            <img src={src} alt={alt || 'Image'} className="max-w-full max-h-64 object-contain" />
          ) : (
            <div className="w-full h-40 flex items-center justify-center text-slate-400">
              No image available
            </div>
          )}
        </div>
        {caption && <div className="text-sm text-center text-slate-600">{caption}</div>}
      </div>
    );
  };

  // Update a specific property of the selected component
  const updateComponentProperty = (propertyName: string, value: any) => {
    if (!selectedComponent) return;
    
    const newContent = { ...selectedComponent.content, [propertyName]: value };
    updateContentSection(selectedComponent.id, newContent);
  };

  // Render the properties panel for selected component
  const renderPropertiesPanel = () => {
    return (
      <div className="properties-panel p-2.5">
        {!selectedComponent ? (
          <div className="text-slate-500 text-xs italic">
            Select a section to edit its properties.
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="mb-1 text-slate-700 font-medium">{selectedComponent.type.charAt(0).toUpperCase() + selectedComponent.type.slice(1)} Properties</div>
            {selectedComponent.type === 'heading' && (
              <>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Text</label>
                  <input
                    type="text"
                    className="w-full p-1.5 text-xs border border-slate-200 rounded"
                    value={selectedComponent.content?.text || ''}
                    onChange={(e) => updateComponentProperty('text', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Size</label>
                  <select
                    className="w-full p-1.5 text-xs border border-slate-200 rounded"
                    value={selectedComponent.content?.size || 'large'}
                    onChange={(e) => updateComponentProperty('size', e.target.value)}
                  >
                    <option value="large">Large</option>
                    <option value="medium">Medium</option>
                    <option value="small">Small</option>
                  </select>
                </div>
              </>
            )}
            {selectedComponent.type === 'text' && (
              <div>
                <label className="block text-xs text-slate-600 mb-1">Text</label>
                <textarea
                  className="w-full p-1.5 text-xs border border-slate-200 rounded min-h-[100px]"
                  value={selectedComponent.content?.text || ''}
                  onChange={(e) => updateComponentProperty('text', e.target.value)}
                />
              </div>
            )}
            {selectedComponent.type === 'bullet-list' && (
              <div>
                <label className="block text-xs text-slate-600 mb-1">Items (one per line)</label>
                <textarea
                  className="w-full p-1.5 text-xs border border-slate-200 rounded min-h-[100px]"
                  value={selectedComponent.content?.items?.join('\n') || ''}
                  onChange={(e) => {
                    const items = e.target.value.split('\n').filter(item => item.trim().length > 0);
                    updateComponentProperty('items', items);
                  }}
                  placeholder="Enter one item per line"
                />
              </div>
            )}
            {selectedComponent.type === 'columns' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Number of Columns</label>
                  <select
                    className="w-full p-1.5 text-xs border border-slate-200 rounded"
                    value={selectedComponent.content?.columns?.length || 2}
                    onChange={(e) => {
                      const numColumns = parseInt(e.target.value);
                      const currentColumns = selectedComponent.content?.columns || [];
                      let newColumns = [...currentColumns];
                      
                      // Add or remove columns as needed
                      if (numColumns > currentColumns.length) {
                        // Add columns
                        for (let i = currentColumns.length; i < numColumns; i++) {
                          newColumns.push({ content: `Column ${i + 1} content` });
                        }
                      } else {
                        // Remove columns
                        newColumns = newColumns.slice(0, numColumns);
                      }
                      
                      updateComponentProperty('columns', newColumns);
                    }}
                  >
                    <option value="2">2 Columns</option>
                    <option value="3">3 Columns</option>
                    <option value="4">4 Columns</option>
                  </select>
                </div>
                
                {selectedComponent.content?.columns?.map((column: any, idx: number) => (
                  <div key={idx}>
                    <label className="block text-xs text-slate-600 mb-1">Column {idx + 1} Content</label>
                    <textarea
                      className="w-full p-1.5 text-xs border border-slate-200 rounded min-h-[80px]"
                      value={column.content || ''}
                      onChange={(e) => {
                        const newColumns = [...(selectedComponent.content?.columns || [])];
                        newColumns[idx] = { ...newColumns[idx], content: e.target.value };
                        updateComponentProperty('columns', newColumns);
                      }}
                      placeholder={`Enter content for column ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
            {selectedComponent.type === 'chart' && (
              <>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Chart Type</label>
                  <select
                    className="w-full p-1.5 text-xs border border-slate-200 rounded"
                    value={selectedComponent.content?.chartType || 'bar'}
                    onChange={(e) => updateComponentProperty('chartType', e.target.value)}
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Labels (comma separated)</label>
                  <input
                    type="text"
                    className="w-full p-1.5 text-xs border border-slate-200 rounded"
                    value={selectedComponent.content?.labels?.join(', ') || ''}
                    onChange={(e) => {
                      const labels = e.target.value.split(',').map(label => label.trim());
                      updateComponentProperty('labels', labels);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Values (comma separated)</label>
                  <input
                    type="text"
                    className="w-full p-1.5 text-xs border border-slate-200 rounded"
                    value={selectedComponent.content?.values?.join(', ') || ''}
                    onChange={(e) => {
                      const valuesStr = e.target.value.split(',').map(val => val.trim());
                      const values = valuesStr.map(val => parseFloat(val) || 0);
                      updateComponentProperty('values', values);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const companyName = slideOutlineData?.companyName || 'Pitch Perfect';

  return (
    <div className={`slide-editor-container ${className}`}>
      <div className="flex h-full">
        {/* Main slide content area */}
        <div className="slide-editor-content flex-1">
          {/* Slide template with company logo and footer */}
          <div className="slide-template bg-white rounded-lg overflow-hidden shadow-sm border">
            {/* Header with logo */}
            <div className="slide-header py-3 px-4 bg-slate-50 border-b flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <CompanyLogo companyName={companyName} size="sm" />
                <span className="text-xs text-slate-500">
                  Slide {slideOutlineData?.number || '1'}
                </span>
              </div>
              <div className="slide-controls flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={!slideOutlineData || slideOutlineData.number <= 1}
                  className="h-8 w-8 p-0"
                  onClick={onPreviousSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={onNextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2 text-xs flex items-center"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Main slide body */}
            <div className="slide-body">
              <div className="slide-sections">
                {contentSections.map((section, index) => 
                  renderContentSection(section, index)
                )}
              </div>
            </div>
            
            {/* Footer with slide type only */}
            <div className="slide-footer py-2 px-4 bg-slate-50 border-t flex justify-between items-center text-xs text-slate-500">
              <div className="slide-info">
                {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)} Slide
              </div>
            </div>
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="w-64 border-l border-slate-200 shadow-md h-full overflow-y-auto bg-white text-xs">
          {/* Edit Block Section */}
          <div className="border-b border-slate-200">
            <button 
              className="w-full p-2.5 flex justify-between items-center hover:bg-slate-50 transition-colors"
              onClick={() => setIsContentSectionCollapsed(!isContentSectionCollapsed)}
            >
              <h3 className="font-medium text-slate-800 text-xs">Edit Block</h3>
              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isContentSectionCollapsed ? '' : 'rotate-90'}`} />
            </button>
            
            {!isContentSectionCollapsed && renderPropertiesPanel()}
          </div>
          
          {/* Slide Outline Section */}
          <div className="border-t border-slate-200">
            <button 
              className="w-full p-2.5 flex justify-between items-center hover:bg-slate-50 transition-colors"
              onClick={() => setIsOutlineSectionCollapsed(!isOutlineSectionCollapsed)}
            >
              <h3 className="font-medium text-slate-800 text-xs">Slide Outline</h3>
              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOutlineSectionCollapsed ? '' : 'rotate-90'}`} />
            </button>
            
            {!isOutlineSectionCollapsed && slideOutlineData && (
              <div className="p-2.5">
                <div className="space-y-2 text-xs">
                  <div className="text-slate-800">
                    <span className="font-medium">Purpose:</span>
                    <div className="mt-0.5 pl-1 text-slate-600 text-xs">{slideOutlineData.purpose || 'Not specified'}</div>
                  </div>
                  
                  <div className="text-slate-800">
                    <span className="font-medium">Key Content:</span>
                    <ul className="mt-0.5 pl-3 list-disc text-slate-600 text-xs space-y-0.5">
                      {slideOutlineData.keyContent?.length > 0 ? (
                        slideOutlineData.keyContent.map((item, i) => (
                          <li key={`key-${i}`}>{item}</li>
                        ))
                      ) : (
                        <li>No key content defined</li>
                      )}
                    </ul>
                  </div>
                  
                  {slideOutlineData.keyTakeaway && (
                    <div className="text-slate-800">
                      <span className="font-medium">Key Takeaway:</span>
                      <div className="mt-0.5 pl-1 text-slate-600 text-xs">{slideOutlineData.keyTakeaway}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Generate Content Section */}
          <div className="border-t border-slate-200">
            <button 
              className="w-full p-2.5 flex justify-between items-center hover:bg-slate-50 transition-colors"
              onClick={() => setIsGenerateSectionCollapsed(!isGenerateSectionCollapsed)}
            >
              <h3 className="font-medium text-slate-800 text-xs">AI Suggestions</h3>
              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isGenerateSectionCollapsed ? '' : 'rotate-90'}`} />
            </button>
            
            {!isGenerateSectionCollapsed && (
              <div className="p-2.5">
                <div className="space-y-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full text-xs justify-start py-1"
                    onClick={generateSlideContent}
                    disabled={isGeneratingContent}
                  >
                    {isGeneratingContent ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating content...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3 mr-1" />
                        Generate slide content
                      </>
                    )}
                  </Button>
                  
                  {contentSections.map((section, index) => (
                    <Button 
                      key={`gen-${section.id}`}
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs justify-start py-1"
                      onClick={() => generateSectionContent(section.id, section.type)}
                      disabled={isGeneratingContent}
                    >
                      Improve {section.type} section
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Components Library Section */}
          <div className="border-t border-slate-200">
            <button 
              className="w-full p-2.5 flex justify-between items-center hover:bg-slate-50 transition-colors"
              onClick={() => setIsComponentsSectionCollapsed(!isComponentsSectionCollapsed)}
            >
              <h3 className="font-medium text-slate-800 text-xs">Add Content</h3>
              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isComponentsSectionCollapsed ? '' : 'rotate-90'}`} />
            </button>
            
            {!isComponentsSectionCollapsed && (
              <div className="p-2.5">
                <div className="grid grid-cols-2 gap-1">
                  {componentLibrary.map((component) => (
                    <button
                      key={component.id}
                      className="text-left p-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
                      onClick={() => handleComponentClick(component)}
                    >
                      {component.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 