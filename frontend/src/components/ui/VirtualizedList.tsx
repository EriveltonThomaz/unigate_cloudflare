import React from 'react';
import { List, ListItem, ListItemProps, Box } from '@mui/material';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualizedListProps<T> {
  items: T[];
  height?: number | string;
  itemSize?: number;
  width?: number | string;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemKey?: (index: number, data: T[]) => string | number;
  listProps?: Omit<React.ComponentProps<typeof List>, 'children'>;
  listItemProps?: ListItemProps;
}

function VirtualizedList<T>({
  items,
  height = 400,
  itemSize = 50,
  width = '100%',
  renderItem,
  itemKey,
  listProps,
  listItemProps,
}: VirtualizedListProps<T>) {
  const getItemKey = (index: number, data: T[]): string | number => {
    return itemKey ? itemKey(index, data) : index;
  };

  const Row = ({ index, style }: ListChildComponentProps) => (
    <ListItem style={style} key={getItemKey(index, items)} {...listItemProps}>
      {renderItem(items[index], index)}
    </ListItem>
  );

  return (
    <Box sx={{ width, height }}>
      <AutoSizer>
        {({ height: autoHeight, width: autoWidth }) => (
          <FixedSizeList
            height={typeof height === 'number' ? height : autoHeight}
            width={typeof width === 'number' ? width : autoWidth}
            itemCount={items.length}
            itemSize={itemSize}
            itemKey={getItemKey}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Box>
  );
}

export default VirtualizedList;