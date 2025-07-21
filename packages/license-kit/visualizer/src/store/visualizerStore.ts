import { DependencyType } from '@/types/DependencyType';
import type { Types } from '@callstack/licenses';
import moment from 'moment';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type VisualizerStoreState = {
  report: Types.AggregatedLicensesMapping | null;
  reportName?: string;
  loadedAt?: moment.Moment;
  visibleDependencyTypes: DependencyType[];
  autoLoadFromServer: boolean;
  selectedRoot: Types.License | null;
};

type VisualizerStoreActions = {
  setReport: (report: Types.AggregatedLicensesMapping, reportName: string) => void;
  toggleDependencyTypeVisibility: (dependencyType: DependencyType) => void;
  setAutoLoadFromServer: (autoLoadFromServer: boolean) => void;
  selectRoot: (root: Types.License | null) => void;
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

    visibleDependencyTypes: [
      DependencyType.DEPENDENCY,
      DependencyType.DEV_DEPENDENCY,
      DependencyType.OPTIONAL_DEPENDENCY,
    ],
    toggleDependencyTypeVisibility: (dependencyType: DependencyType) =>
      set((state) => {
        state.visibleDependencyTypes = state.visibleDependencyTypes.includes(dependencyType)
          ? state.visibleDependencyTypes.filter((type) => type !== dependencyType)
          : [...state.visibleDependencyTypes, dependencyType];
      }),

    autoLoadFromServer: false,
    setAutoLoadFromServer: (autoLoadFromServer: boolean) => set({ autoLoadFromServer }),

    selectedRoot: null,
    selectRoot: (root: Types.License | null) => set({ selectedRoot: root }),
  })),
);
