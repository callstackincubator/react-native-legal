import type { Types } from '@callstack/licenses';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type VisualizerStoreState = {
  report: Types.AggregatedLicensesObj | null;
};

type VisualizerStoreActions = {
  setReport: (report: Types.AggregatedLicensesObj) => void;
};

export type VisualizerStore = VisualizerStoreState & VisualizerStoreActions;

export const useVisualizerStore = create<VisualizerStore>()(
  immer((set) => ({
    report: null,
    setReport: (report) =>
      set((state) => {
        state.report = report;
      }),
  })),
);
