import { useState } from 'react';
import initialLayout from './data/initialLayout.json';

import JsonViewer from './components/JsonViewer';
import WireframePreview from './components/WireframePreview';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

import useLayoutAgent from './hooks/useLayoutAgent';

import './App.css';

function App() {
  const { messages, layout, isLoading, sendMessage } = useLayoutAgent();

  return (
    <>
      <header className="app-header">
        <h1>Layout Agent AI</h1>
      </header>
      
      <div className="app-container">
        <div className="chat-container">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
          />

          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
          />
        </div>

        <div className="layout-container">
          <h2>Layout Visualization</h2>

          <div className="preview-container">
            <WireframePreview layout={layout} />
            <JsonViewer layout={layout} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;