import type { Types } from '@callstack/licenses';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import moment from 'moment';

type VisualizerStoreState = {
  report: Types.AggregatedLicensesMapping | null;
  reportName?: string;
  loadedAt?: moment.Moment;
};

type VisualizerStoreActions = {
  setReport: (report: Types.AggregatedLicensesMapping, reportName: string) => void;
};

export type VisualizerStore = VisualizerStoreState & VisualizerStoreActions;

export const useVisualizerStore = create<VisualizerStore>()(
  immer((set) => ({
    report: null,
    setReport: (report, reportName) =>
      set((state) => {
        state.report = report;
        state.reportName = reportName;
        state.loadedAt = moment();
      }),

    reportName: undefined,
  })),
);
