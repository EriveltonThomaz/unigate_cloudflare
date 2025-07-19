import React from 'react';
import { Skeleton, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';

interface TableSkeletonProps {
  rowsCount?: number;
  columnsCount?: number;
  showHeader?: boolean;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rowsCount = 5,
  columnsCount = 4,
  showHeader = true
}) => {
  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table>
        {showHeader && (
          <TableHead>
            <TableRow>
              {Array.from(new Array(columnsCount)).map((_, index) => (
                <TableCell key={`header-${index}`}>
                  <Skeleton variant="text" width={index === 0 ? 150 : 100} height={24} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from(new Array(rowsCount)).map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {Array.from(new Array(columnsCount)).map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  <Skeleton 
                    variant="text" 
                    width={colIndex === 0 ? 150 : colIndex === columnsCount - 1 ? 80 : 100} 
                    height={24} 
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSkeleton;