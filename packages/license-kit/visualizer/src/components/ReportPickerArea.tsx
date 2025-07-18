import { motion } from 'motion/react';
import { useSnackbar } from 'notistack';
import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import { useRef, useState } from 'react';
import { tss } from 'tss-react/mui';

import { NoteAdd } from '@mui/icons-material';
import { Avatar, Box, Button, CircularProgress, Stack, Typography, alpha, useTheme } from '@mui/material';

import { useVisualizerStore } from '@/store/visualizerStore';

import EventSourceHandler from './logic/EventSourceHandler';

export type ReportPickerAreaProps = PropsWithChildren;

const MotionAvatar = motion.create(Avatar);

export default function ReportPickerArea({ children }: ReportPickerAreaProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { classes, cx } = useStyles();
  const { report, setReport, setAutoLoadFromServer } = useVisualizerStore();

  const { palette } = useTheme();

  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoLoadHovered, setIsAutoLoadHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportLoadError, setReportLoadError] = useState<Error | string | null>(null);

  const handleFile = (file: File) => {
    if (!file || file.type !== 'application/json') {
      enqueueSnackbar({
        message: 'Please select a valid JSON file.',
        variant: 'error',
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        if (!reader.result) {
          throw new Error('File reading error');
        }

        const json = JSON.parse(reader.result as string);

        setAutoLoadFromServer(false);
        setReport(json, file.name);
      } catch (error) {
        console.error('Error parsing JSON file:', error);

        enqueueSnackbar({
          message: 'Failed to parse JSON file. Please ensure it is a valid JSON.',
          variant: 'error',
        });

        setReportLoadError(error as Error | string);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    reader.readAsText(file);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    dragOverCounter.current = 0;
    setIsDragOver(false);
    setIsHovered(false);

    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const isHoveredVisualState = useMemo(
    () => isDragOver || (!report && !loading && isHovered && !isAutoLoadHovered),
    [isDragOver, isHovered, report, isAutoLoadHovered],
  );

  // handle moving dragged file over the children of this drop zone
  const dragOverCounter = useRef(0);

  return (
    <motion.div
      className={cx(classes.dropZone, report === null && classes.emptyDropZone)}
      onDragEnter={(e) => {
        dragOverCounter.current++;
        setIsDragOver(true);
        e.preventDefault();

        return true;
      }}
      onDragOver={(e) => {
        e.preventDefault();

        return true;
      }}
      onDragLeave={() => {
        dragOverCounter.current = Math.max(0, dragOverCounter.current - 1);
        setIsDragOver(dragOverCounter.current > 0);
      }}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      onDrop={handleDrop}
      onClick={() => {
        dragOverCounter.current = 0;
        setIsDragOver(false);
        setIsHovered(false);

        if (!report) {
          inputRef.current?.click();
        }
      }}
      variants={{
        hovered: {
          borderWidth: 4,
          borderRadius: report ? 0 : 40,
          backgroundColor: alpha(palette.secondary.light, 0.35),
          borderStyle: 'dashed',
        },
        defaultNoReport: {
          borderWidth: 2,
          borderRadius: 10,
          backgroundColor: alpha(palette.secondary.light, 0.05),
          borderStyle: 'solid',
        },
        defaultReport: {
          borderWidth: 4,
          borderStyle: 'solid',
        },
      }}
      style={{
        borderColor: isHoveredVisualState ? palette.secondary.main : report ? 'transparent' : palette.secondary.main,
      }}
      transition={{
        type: 'tween',
      }}
      animate={isHoveredVisualState ? 'hovered' : report ? 'defaultReport' : 'defaultNoReport'}
    >
      <EventSourceHandler />

      <input
        type="file"
        accept=".json,application/json"
        ref={inputRef}
        className={classes.hidden}
        onChange={handleChange}
      />

      {loading ? (
        <Stack alignItems="center" gap={2} justifyContent="center" direction="column">
          <CircularProgress disableShrink />

          <Typography>Loading report, this may take some time based on the size of your project...</Typography>
        </Stack>
      ) : report ? (
        children
      ) : (
        <Stack alignItems="center">
          <MotionAvatar
            sx={{ padding: 6 }}
            variants={{
              hovered: { scale: 1.1, color: palette.secondary.main },
              default: { scale: 1 },
            }}
            animate={isDragOver ? 'hovered' : 'default'}
          >
            <NoteAdd sx={{ fontSize: 60 }} />
          </MotionAvatar>

          <span className={cx(classes.helpText, classes.inlineFlexChildren, classes.honorWhiteSpace)}>
            Drag & drop a <pre className={classes.honorWhiteSpace}>react-native-legal</pre> JSON report here, or click
            to select a file.
          </span>

          <p>or</p>

          <Box
            onMouseOver={() => setIsAutoLoadHovered(true)}
            onMouseOut={() => setIsAutoLoadHovered(false)}
            onClick={(event) => {
              event.stopPropagation();
            }}
            className={classes.reenablePointerEvents}
          >
            <Button
              size="large"
              onClick={() => {
                setAutoLoadFromServer(true);
                setLoading(true);

                fetch(`${window.location.origin}/api/report`)
                  .then((response) => response.json())
                  .then((data) => {
                    setReport(data.report, data.name);
                  })
                  .catch((error) => {
                    console.error('Error auto-loading report:', error);

                    enqueueSnackbar({
                      message: 'Failed to auto-load report. Please try again.',
                      variant: 'error',
                    });

                    setAutoLoadFromServer(false);
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
              variant="outlined"
              className={cx(
                classes.helpText,
                classes.inlineFlexChildren,
                classes.honorWhiteSpace,
                classes.reenablePointerEvents,
                classes.autoLoadButton,
              )}
            >
              Auto-load from the server
            </Button>
          </Box>

          {reportLoadError && (
            <pre>{typeof reportLoadError === 'string' ? reportLoadError : reportLoadError.message}</pre>
          )}
        </Stack>
      )}
    </motion.div>
  );
}

const useStyles = tss.create(({ theme }) => ({
  helpText: {
    fontSize: 20,
  },
  dropZone: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  emptyDropZone: {
    padding: 10,
    margin: 10,
    cursor: 'pointer',
    '& > *': {
      pointerEvents: 'none',
    },
  },
  inlineFlexChildren: {
    '& > *': {
      display: 'inline-flex',
    },
  },
  reenablePointerEvents: {
    pointerEvents: 'all',
  },
  honorWhiteSpace: {
    whiteSpace: 'pre-wrap',
  },
  hidden: { display: 'none' },
  autoLoadButton: {
    margin: theme.spacing(4),
  },
}));
