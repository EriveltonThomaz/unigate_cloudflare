import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

interface FormSkeletonProps {
  fieldsCount?: number;
  withButton?: boolean;
}

const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fieldsCount = 4,
  withButton = true
}) => {
  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 2 }}>
      {Array.from(new Array(fieldsCount)).map((_, index) => (
        <Box key={`field-${index}`} sx={{ width: '100%' }}>
          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={56} />
        </Box>
      ))}
      
      {withButton && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
      )}
    </Stack>
  );
};

export default FormSkeleton;