'use client';

import { useVisualizerStore } from '@/store/visualizerStore';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

export default function EventSourceHandler() {
  const { autoLoadFromServer, setReport } = useVisualizerStore();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (autoLoadFromServer) {
      console.log('Setting up event source');

      const eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const { type, report, projectName } = JSON.parse(event.data);

          switch (type) {
            case 'UPDATE':
              enqueueSnackbar({
                message: 'Project updated, regenerating graph...',
                variant: 'info',
              });

              setReport(report, projectName);

              break;

            default:
              console.warn('Unknown event type with raw event packet:', event.data);
              break;
          }
        } catch (e) {
          console.error('Error processing event data', e);
        }
      };

      return () => {
        console.log('Closing event source');

        eventSource.close();
      };
    }
  }, [autoLoadFromServer, enqueueSnackbar, setReport]);

  return null;
}
