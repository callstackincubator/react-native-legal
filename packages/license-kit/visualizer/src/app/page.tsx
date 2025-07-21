'use client';

import React from 'react';

import DependencyGraph from '../components/DependencyGraph';
import ReportPickerArea from '../components/ReportPickerArea';
import { useVisualizerStore } from '../store/visualizerStore';

export default function App() {
  const { report } = useVisualizerStore();

  return <ReportPickerArea>{report ? <DependencyGraph data={report} /> : null}</ReportPickerArea>;
}
