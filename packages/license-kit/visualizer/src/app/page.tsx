'use client';

import React from 'react';

import ReportPickerArea from '../components/ReportPickerArea';
import Tree from '../components/Tree';
import { useVisualizerStore } from '../store/visualizerStore';

export default function App() {
  const { report } = useVisualizerStore();

  return <ReportPickerArea>{report ? <Tree data={report} /> : null}</ReportPickerArea>;
}
