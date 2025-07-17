import { tss } from 'tss-react/mui';

export const useTabsStyles = tss.create(({ theme }) => ({
  container: {
    padding: theme.spacing(2),
  },
  card: {
    minWidth: 350,
    maxWidth: 500,
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  scoreContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  scoreSection: {
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    flex: 1,
  },
  categoryContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  categoryGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0.5),
  },
  licensesContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  licenseList: {
    maxHeight: 300,
    overflowY: 'auto',
  },
}));
