import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Html } from 'react-konva-utils';

interface TableElementProps {
  data: {
    headers?: string[];
    rows?: string[][];
    title?: string;
    description?: string;
  };
  width: number;
  height: number;
}

export const TableElement: React.FC<TableElementProps> = ({ data, width, height }) => {
  const headers = data.headers || ['Column 1', 'Column 2', 'Column 3'];
  const rows = data.rows || [
    ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
    ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3'],
  ];

  // Calculate dimensions
  const headerHeight = 40;
  const rowHeight = Math.min(40, (height - headerHeight) / Math.max(1, rows.length));
  const colWidth = width / headers.length;

  // Use HTML rendering for complex table
  return (
    <Html
      transform
      divProps={{
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
        },
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#333',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th
                  key={`header-${i}`}
                  style={{
                    backgroundColor: '#f0f4f8',
                    color: '#2c5282',
                    fontWeight: 'bold',
                    padding: '8px 12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #cbd5e0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: rowIndex % 2 === 0 ? '#f8fafc' : 'white',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      // Make the first column header-like
                      ...(cellIndex === 0
                        ? {
                            fontWeight: 'bold',
                            color: '#2c5282',
                          }
                        : {}),
                      // Highlight positive/negative values
                      ...(cell.includes('✓')
                        ? { color: '#047857' } // Green for checkmarks
                        : cell.includes('✗')
                        ? { color: '#dc2626' } // Red for X marks
                        : {}),
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Html>
  );
};

// Konva-compatible version for direct rendering on canvas
export const CanvasTableElement: React.FC<TableElementProps> = ({ data, width, height }) => {
  const headers = data.headers || ['Column 1', 'Column 2', 'Column 3'];
  const rows = data.rows || [
    ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
    ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3'],
  ];

  // Calculate dimensions
  const headerHeight = 40;
  const rowHeight = Math.min(40, (height - headerHeight) / Math.max(1, rows.length));
  const colWidth = width / headers.length;

  return (
    <Group>
      {/* Header Row */}
      {headers.map((header, colIndex) => (
        <Group key={`header-${colIndex}`}>
          <Rect
            x={colIndex * colWidth}
            y={0}
            width={colWidth}
            height={headerHeight}
            fill="#f0f4f8"
            stroke="#cbd5e0"
            strokeWidth={1}
          />
          <Text
            x={colIndex * colWidth + 10}
            y={12}
            text={header}
            fontSize={14}
            fontStyle="bold"
            fill="#2c5282"
            width={colWidth - 20}
            ellipsis
          />
        </Group>
      ))}

      {/* Data Rows */}
      {rows.map((row, rowIndex) => (
        <Group key={`row-${rowIndex}`}>
          {row.map((cell, colIndex) => (
            <Group key={`cell-${rowIndex}-${colIndex}`}>
              <Rect
                x={colIndex * colWidth}
                y={headerHeight + rowIndex * rowHeight}
                width={colWidth}
                height={rowHeight}
                fill={rowIndex % 2 === 0 ? '#f8fafc' : 'white'}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <Text
                x={colIndex * colWidth + 10}
                y={headerHeight + rowIndex * rowHeight + 12}
                text={cell}
                fontSize={13}
                fill={
                  cell.includes('✓')
                    ? '#047857'
                    : cell.includes('✗')
                    ? '#dc2626'
                    : colIndex === 0
                    ? '#2c5282'
                    : '#333'
                }
                fontStyle={colIndex === 0 ? 'bold' : 'normal'}
                width={colWidth - 20}
                ellipsis
              />
            </Group>
          ))}
        </Group>
      ))}
    </Group>
  );
}; 