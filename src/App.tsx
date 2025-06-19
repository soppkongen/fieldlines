import React from 'react';
import { Header } from './components/Header';
import { MainViewer } from './components/MainViewer';
import { ControlPanel } from './components/ControlPanel';
import { StatusBar } from './components/StatusBar';

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <MainViewer />
        <ControlPanel />
      </div>
      <StatusBar />
    </div>
  );
}

export default App;