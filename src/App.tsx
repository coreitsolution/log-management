import './App.css'
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// Components
import MainLayout from "./layout/MainLayout";

// Pages
import Home from './pages/Home';
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
import OverallMap from './pages/OverallMap';
import OverallReport from './pages/OverallReport';

// Store
import { useAppDispatch } from "./store/hooks";

// API
import {
  fetchArea,
  fetchAgency,
  fetchBh,
  fetchBk,
  fetchOrg,
  fetchProject,
  fetchProvince,
  fetchCheckpointType,
} from "./features/dropdown/api/DropdownSlice";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchArea());
    dispatch(fetchAgency());
    dispatch(fetchBh());
    dispatch(fetchBk());
    dispatch(fetchOrg());
    dispatch(fetchProject());
    dispatch(fetchProvince());
    dispatch(fetchCheckpointType());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
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
        <Route path="/overall-map" element={<OverallMap />} />
        <Route path="/overall-report" element={<OverallReport />} />
      </Route>
    </Routes>
  )
}

export default App;
