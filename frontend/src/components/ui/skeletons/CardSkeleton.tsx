import React from 'react';
import { Card, CardContent, CardHeader, Skeleton, Box } from '@mui/material';

interface CardSkeletonProps {
  headerHeight?: number;
  contentHeight?: number;
  withAction?: boolean;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  headerHeight = 40,
  contentHeight = 120,
  withAction = false
}) => {
  return (
    <Card sx={{ width: '100%', mb: 2 }}>
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        title={<Skeleton variant="text" width="60%" height={headerHeight} />}
        subheader={<Skeleton variant="text" width="40%" height={headerHeight / 2} />}
        action={withAction ? <Skeleton variant="rectangular" width={60} height={36} /> : undefined}
      />
      <CardContent>
        <Box sx={{ pt: 0.5 }}>
          <Skeleton variant="text" width="90%" height={contentHeight / 4} />
          <Skeleton variant="text" width="80%" height={contentHeight / 4} />
          <Skeleton variant="text" width="70%" height={contentHeight / 4} />
          {contentHeight > 100 && (
            <Skeleton variant="text" width="60%" height={contentHeight / 4} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardSkeleton;