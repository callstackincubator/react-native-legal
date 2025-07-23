'use client';

import { Typography } from '@mui/material';
import moment from 'moment';
import { useEffect, useState } from 'react';

export type UpdatingHeadingProps = {
  reportName?: string;
  loadedAt?: moment.Moment;
};

export function UpdatingHeading({ reportName, loadedAt }: UpdatingHeadingProps) {
  const [now, setNow] = useState(() => moment());

  // update time interval
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    reportName && (
      <Typography variant="caption">
        {reportName},{' '}
        {loadedAt &&
          (loadedAt.isSame(now, 'minute')
            ? loadedAt.fromNow()
            : loadedAt.isSame(now, 'day')
            ? 'at ' + loadedAt.format('HH:mm')
            : 'on ' + loadedAt.format('DD.MM HH:mm'))}
      </Typography>
    )
  );
}
