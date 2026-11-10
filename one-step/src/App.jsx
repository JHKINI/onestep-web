import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ConcernInput from "./pages/ConcernInput";
import ProblemSelectPage from "./pages/ProblemSelectPage";
import ActionPage from "./pages/ActionPage";
import ActionSelectPage from "./pages/ActionSelectPage";
import ActionStartPage from "./pages/ActionStartPage";
import ActionShrinkPage from "./pages/ActionShrinkPage";
import TodayActionPage from "./pages/TodayActionPage";
import ExecutePage from "./pages/ExecutePage";
import CompletePage from "./pages/CompletePage";
import FruitBasketPage from "./pages/FruitBasketPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/concern"
          element={<ConcernInput />}
        />

        <Route
          path="/problem-select"
          element={<ProblemSelectPage />}
        />

        <Route
          path="/action"
          element={<ActionPage />}
        />

        <Route
          path="/action-select"
          element={<ActionSelectPage />}
        />

        <Route
          path="/action-start"
          element={<ActionStartPage />}
        />

        <Route
          path="/action-shrink"
          element={<ActionShrinkPage />}
        />

        <Route
          path="/today-action"
          element={<TodayActionPage />}
        />

        <Route
          path="/execute"
          element={<ExecutePage />}
        />

        <Route
          path="/complete"
          element={<CompletePage />}
        />

        <Route
          path="/fruit"
          element={<FruitBasketPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}