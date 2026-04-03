import './App.css'
import { Routes, Route } from "react-router-dom";

// Components
import MainLayout from "./layout/MainLayout";

// Pages
import Login from './pages/Login';
import StatisticUsageAgency from './pages/StatisticUsageAgency';
import StatisticUsagePerson from './pages/StatisticUsagePerson';
import StatisticUsageLog from './pages/StatisticUsageLog';
import StatisticSearchAgencyPlate from './pages/StatisticSearchAgencyPlate';
import StatisticSearchPersonPlate from './pages/StatisticSearchPersonPlate';
import StatisticSearchLogPlate from './pages/StatisticSearchLogPlate';
import ChartInternalPolice from './pages/ChartInternalPolice';
import ChartInternalNsb from './pages/ChartInternalNsb';
import ChartExternalPolice from './pages/ChartExternalPolice';
import ChartTopUsers from './pages/ChartTopUsers';
import OverallCheckpoints from './pages/OverallCheckpoints';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
      {/* Statistic Usage */}
        <Route path="/statistic-usage-agency" element={<StatisticUsageAgency />} />
        <Route path="/statistic-usage-person" element={<StatisticUsagePerson />} />
        <Route path="/statistic-usage-log" element={<StatisticUsageLog />} />
        {/* Statistic Search Plate */}
        <Route path="/statistic-search-agency-plate" element={<StatisticSearchAgencyPlate />} />
        <Route path="/statistic-search-person-plate" element={<StatisticSearchPersonPlate />} />
        <Route path="/statistic-search-log-plate" element={<StatisticSearchLogPlate />} />
        {/* Chart Internal police */}
        <Route path="/chart-internal-police" element={<ChartInternalPolice />} />
        <Route path="/chart-internal-nsb" element={<ChartInternalNsb />} />
        <Route path="/chart-external-police" element={<ChartExternalPolice />} />
        <Route path="/chart-top-users" element={<ChartTopUsers />} />
        {/* Overall */}
        <Route path="/overall-checkpoints" element={<OverallCheckpoints />} />
      </Route>
    </Routes>
  )
}

export default App;
