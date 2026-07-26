import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Analyze from "./pages/Analyze";
import Reconstruct from "./pages/Reconstruct";
import Idea from "./pages/Idea";
import Result from "./pages/Result";
import History from "./pages/History";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/analyze" element={<Analyze />} />
      <Route path="/reconstruct" element={<Reconstruct />} />
      <Route path="/idea" element={<Idea />} />
      <Route path="/result/:id" element={<Result />} />
      <Route path="/history" element={<History />} />
    </Routes>
  );
}
