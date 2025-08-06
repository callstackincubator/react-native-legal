'use client';

import { Typography } from '@mui/material';
import { format, formatDistanceToNow, isSameDay, isWithinInterval } from 'date-fns';
import { useEffect, useState } from 'react';

export type UpdatingHeadingProps = {
  reportName?: string;
  loadedAt?: Date;
};

export function UpdatingHeading({ reportName, loadedAt }: UpdatingHeadingProps) {
  const [now, setNow] = useState(() => new Date());

  // update time interval
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Typography variant="caption">
      {reportName ? `${reportName}, ` : ''}loaded{' '}
      {loadedAt &&
        (isWithinInterval(loadedAt, { start: new Date(now.getTime() - 1000 * 60 * 2), end: now })
          ? formatDistanceToNow(loadedAt, { addSuffix: true, includeSeconds: true })
          : isSameDay(loadedAt, now)
            ? 'at ' + format(loadedAt, 'HH:mm')
            : 'on ' + format(loadedAt, 'dd.MM HH:mm'))}
    </Typography>
  );
}
