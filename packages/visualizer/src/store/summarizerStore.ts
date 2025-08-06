import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export enum SummarizerState {
  CHECKING_AVAILABILITY,
  UNAVAILABLE,
  DOWNLOADING,
  READY,
}

type SummarizerStoreState = {
  summarizerState: SummarizerState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tldrSummarizer: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keyPointsSummarizer: any | null;
  summarizerDownloadProgress: number;
};

type SummarizerStoreActions = {
  ensureInitialized: () => void;
};

export type SummarizerStore = SummarizerStoreState & SummarizerStoreActions;

export const useSummarizerStore = create<SummarizerStore>()(
  immer((set) => ({
    ensureInitialized: async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error -- missing types for Summarizer API
      const availability = await Summarizer.availability();

      console.log(`[Summarizer] Model availability result: ${availability}`);

      if (availability === 'unavailable') {
        set({
          summarizerState: SummarizerState.UNAVAILABLE,
        });

        return null;
      }

      set({
        summarizerState: SummarizerState.DOWNLOADING,
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error -- missing types for Summarizer API
      const tldrSummarizer = await Summarizer.create({
        type: 'tldr',
        format: 'markdown',
        length: 'long',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        monitor(m: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          m.addEventListener('downloadprogress', (e: any) => {
            console.log(`[TLDR Summarizer] Model downloaded ${e.loaded * 100}%`);

            set({
              summarizerDownloadProgress: e.loaded * 100,
            });

            if (e.loaded === 1) {
              set({
                summarizerState: SummarizerState.READY,
              });
            }
          });
        },
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error -- missing types for Summarizer API
      const keyPointsSummarizer = await Summarizer.create({
        type: 'key-points',
        format: 'markdown',
        length: 'long',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        monitor(m: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          m.addEventListener('downloadprogress', (e: any) => {
            console.log(`[Key-Points Summarizer] Model downloaded ${e.loaded * 100}%`);

            set({
              summarizerDownloadProgress: e.loaded * 100,
            });

            if (e.loaded === 1) {
              set({
                summarizerState: SummarizerState.READY,
              });
            }
          });
        },
      });

      set({
        tldrSummarizer,
        keyPointsSummarizer,
      });
    },
    tldrSummarizer: null,
    keyPointsSummarizer: null,
    summarizerState: SummarizerState.CHECKING_AVAILABILITY,
    summarizerDownloadProgress: 0,
  })),
);
