import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TimezoneConverter from "./components/TimezoneConverter";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TimezoneConverter />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;