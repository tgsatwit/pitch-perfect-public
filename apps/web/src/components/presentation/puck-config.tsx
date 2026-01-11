import { Config, Field, CustomField } from "@measured/puck";
import { ChartDataFieldRenderer, TableDataFieldRenderer } from "./custom-field-renderers";
import React from "react";
import { ChartBlock } from "./blocks/ChartBlock";
import { TableBlock } from "./blocks/TableBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { FlexContainer } from "./blocks/FlexContainer";

export interface TextBlockProps {
  text: string;
  style?: {
    align?: 'left' | 'center' | 'right';
    fontSize?: string;
    color?: string;
  };
}

export interface ChartBlockProps {
  type: string;
  data: {
    labels: string[];
    values: number[];
  };
}

export interface TableBlockProps {
  headers: string[];
  data: { cells: string[] }[];
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  size: 'small' | 'medium' | 'large' | 'full';
}

export interface FlexContainerProps {
  children: any[];
  style?: {
    direction?: 'row' | 'column';
    gap?: string;
    align?: 'start' | 'center' | 'end';
    justify?: 'start' | 'center' | 'end' | 'space-between';
  };
}

export type SlideComponents = {
  ChartBlock: ChartBlockProps;
  TableBlock: TableBlockProps;
  TextBlock: TextBlockProps;
  ImageBlock: ImageBlockProps;
  FlexContainer: FlexContainerProps;
};

export const puckConfig: Config<SlideComponents> = {
  components: {
    ChartBlock: {
      fields: {
        type: {
          type: "select",
          options: [
            { label: "Bar", value: "bar" },
            { label: "Line", value: "line" },
            { label: "Pie", value: "pie" }
          ]
        } as Field<string>,
        data: {
          type: "custom",
          render: ({ value, onChange }) => (
            <ChartDataFieldRenderer value={value} onChange={onChange} />
          )
        } as CustomField<{ labels: string[]; values: number[] }>
      },
      defaultProps: {
        type: "bar",
        data: {
          labels: ["Label 1", "Label 2"],
          values: [10, 20]
        }
      },
      render: ({ data, type }) => <ChartBlock data={data} type={type} />
    },
    TableBlock: {
      fields: {
        headers: {
          type: "array",
          arrayFields: {
            text: {
              type: "text",
              label: "Header"
            } as Field<string>
          },
          defaultItemProps: { text: "" },
          getItemSummary: (item: { text: string }) => item.text || "Empty header"
        } as unknown as Field<string[]>,
        data: {
          type: "custom",
          render: ({ value, onChange }) => (
            <TableDataFieldRenderer 
              value={value} 
              onChange={onChange} 
              headers={value[0]?.cells || []} 
            />
          )
        } as CustomField<{ cells: string[] }[]>
      },
      defaultProps: {
        headers: ["Column 1", "Column 2"],
        data: [
          { cells: ["Row 1 Col 1", "Row 1 Col 2"] },
          { cells: ["Row 2 Col 1", "Row 2 Col 2"] }
        ]
      },
      render: ({ data, headers }) => <TableBlock data={data} headers={headers} />
    },
    TextBlock: {
      fields: {
        text: {
          type: "text",
          label: "Text content"
        } as Field<string>,
        style: {
          type: "object",
          objectFields: {
            align: {
              type: "select",
              options: [
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" }
              ]
            } as Field<'left' | 'center' | 'right'>,
            fontSize: {
              type: "text",
              label: "Font size"
            } as Field<string>,
            color: {
              type: "text",
              label: "Text color"
            } as Field<string>
          }
        }
      },
      defaultProps: {
        text: "Enter your text here",
        style: {
          align: "left",
          fontSize: "16px",
          color: "#000000"
        }
      },
      render: ({ text, style }) => <TextBlock text={text} style={style} />
    },
    ImageBlock: {
      fields: {
        src: {
          type: "text",
          label: "Image URL"
        } as Field<string>,
        alt: {
          type: "text",
          label: "Alt text"
        } as Field<string>,
        size: {
          type: "select",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
            { label: "Full Width", value: "full" }
          ],
          defaultValue: "medium"
        } as Field<'small' | 'medium' | 'large' | 'full'>
      },
      defaultProps: {
        src: "",
        alt: "",
        size: "medium"
      },
      render: ({ src, alt, size }) => <ImageBlock src={src} alt={alt} size={size} />
    },
    FlexContainer: {
      fields: {
        children: {
          type: "array",
          arrayFields: {
            component: {
              type: "custom",
              render: ({ value, onChange }) => (
                <div>Component Selector</div>
              )
            } as CustomField<any>
          },
          defaultItemProps: { component: null },
          getItemSummary: (item: { component: any }) => 
            item.component?.type || "Empty component"
        } as unknown as Field<any[]>,
        style: {
          type: "object",
          objectFields: {
            direction: {
              type: "select",
              options: [
                { label: "Row", value: "row" },
                { label: "Column", value: "column" }
              ],
              defaultValue: "row"
            } as Field<'row' | 'column'>,
            gap: {
              type: "text",
              label: "Gap size",
              defaultValue: "1rem"
            } as Field<string>,
            align: {
              type: "select",
              options: [
                { label: "Start", value: "start" },
                { label: "Center", value: "center" },
                { label: "End", value: "end" }
              ],
              defaultValue: "start"
            } as Field<'start' | 'center' | 'end'>,
            justify: {
              type: "select",
              options: [
                { label: "Start", value: "start" },
                { label: "Center", value: "center" },
                { label: "End", value: "end" },
                { label: "Space Between", value: "space-between" }
              ],
              defaultValue: "start"
            } as Field<'start' | 'center' | 'end' | 'space-between'>
          }
        }
      },
      defaultProps: {
        children: [],
        style: {
          direction: "row",
          gap: "1rem",
          align: "start",
          justify: "start"
        }
      },
      render: ({ children, style }) => (
        <FlexContainer style={style}>
          {children.map((child, index) => (
            <div key={index}>{child.component}</div>
          ))}
        </FlexContainer>
      )
    }
  }
}; 