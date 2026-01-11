import { ComponentData } from '@measured/puck';
import { SlideComponents } from '../puck-config';

export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  layout: {
    components: ComponentData<SlideComponents>[];
  };
  preview?: string;
}

export const slideTemplates: SlideTemplate[] = [
  {
    id: 'title',
    name: 'Title Slide',
    description: 'Opening slide with title and subtitle',
    layout: {
      components: [
        {
          type: 'TextBlock',
          props: {
            text: 'Presentation Title',
            style: {
              align: 'center',
              fontSize: '48px',
              color: '#000000'
            }
          } as any
        },
        {
          type: 'TextBlock',
          props: {
            text: 'Subtitle',
            style: {
              align: 'center',
              fontSize: '24px',
              color: '#666666'
            }
          } as any
        }
      ]
    }
  },
  {
    id: 'content-2col',
    name: 'Two Column Layout',
    description: 'Content split into two columns',
    layout: {
      components: [
        {
          type: 'TextBlock',
          props: {
            text: 'Section Title',
            style: {
              align: 'center',
              fontSize: '36px',
              color: '#000000'
            }
          } as any
        },
        {
          type: 'FlexContainer',
          props: {
            style: {
              direction: 'row',
              gap: '24px',
              justify: 'space-between'
            },
            children: [
              {
                component: {
                  type: 'TextBlock',
                  props: {
                    text: 'Left Column Content',
                    style: {
                      align: 'left',
                      fontSize: '16px',
                      color: '#000000'
                    }
                  }
                }
              },
              {
                component: {
                  type: 'TextBlock',
                  props: {
                    text: 'Right Column Content',
                    style: {
                      align: 'left',
                      fontSize: '16px',
                      color: '#000000'
                    }
                  }
                }
              }
            ]
          } as any
        }
      ]
    }
  },
  {
    id: 'content-image',
    name: 'Content with Image',
    description: 'Text content alongside an image',
    layout: {
      components: [
        {
          type: 'TextBlock',
          props: {
            text: 'Content Title',
            style: {
              align: 'left',
              fontSize: '36px',
              color: '#000000'
            }
          } as any
        },
        {
          type: 'FlexContainer',
          props: {
            style: {
              direction: 'row',
              gap: '24px',
              justify: 'space-between',
              align: 'center'
            },
            children: [
              {
                component: {
                  type: 'TextBlock',
                  props: {
                    text: 'Content Description',
                    style: {
                      align: 'left',
                      fontSize: '16px',
                      color: '#000000'
                    }
                  }
                }
              },
              {
                component: {
                  type: 'ImageBlock',
                  props: {
                    src: '',
                    alt: 'Placeholder image',
                    size: 'large'
                  }
                }
              }
            ]
          } as any
        }
      ]
    }
  },
  {
    id: 'chart-slide',
    name: 'Chart Slide',
    description: 'Slide with a chart and explanation',
    layout: {
      components: [
        {
          type: 'TextBlock',
          props: {
            text: 'Chart Title',
            style: {
              align: 'center',
              fontSize: '36px',
              color: '#000000'
            }
          } as any
        },
        {
          type: 'ChartBlock',
          props: {
            type: 'bar',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3'],
              values: [10, 20, 30]
            }
          } as any
        },
        {
          type: 'TextBlock',
          props: {
            text: 'Chart Description',
            style: {
              align: 'center',
              fontSize: '16px',
              color: '#000000'
            }
          } as any
        }
      ]
    }
  }
]; 