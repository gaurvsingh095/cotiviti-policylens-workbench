import { useState } from "react";
import { StoreProvider } from "./store";
import { Layout } from "./components/Layout";
import { DEFAULT_PAGE } from "./nav";

import { CommandCenter } from "./pages/CommandCenter";
import { PolicyLibrary } from "./pages/PolicyLibrary";
import { VersionDiff } from "./pages/VersionDiff";
import { ImpactMap } from "./pages/ImpactMap";
import { RuleStudio } from "./pages/RuleStudio";
import { ScenarioLab } from "./pages/ScenarioLab";
import { QATests } from "./pages/QATests";
import { ReviewerQueue } from "./pages/ReviewerQueue";
import { AuditPack } from "./pages/AuditPack";
import { FutureAddOns } from "./pages/FutureAddOns";
import { ResponsibleUse } from "./pages/ResponsibleUse";

export default function App() {
  const [page, setPage] = useState<string>(DEFAULT_PAGE);

  return (
    <StoreProvider>
      <Layout page={page} setPage={setPage}>
        {page === "command-center" && <CommandCenter setPage={setPage} />}
        {page === "policy-library" && <PolicyLibrary setPage={setPage} />}
        {page === "version-diff" && <VersionDiff setPage={setPage} />}
        {page === "impact-map" && <ImpactMap setPage={setPage} />}
        {page === "rule-studio" && <RuleStudio />}
        {page === "scenario-lab" && <ScenarioLab setPage={setPage} />}
        {page === "qa-tests" && <QATests />}
        {page === "reviewer-queue" && <ReviewerQueue setPage={setPage} />}
        {page === "audit-pack" && <AuditPack />}
        {page === "future-addons" && <FutureAddOns />}
        {page === "responsible-use" && <ResponsibleUse />}
      </Layout>
    </StoreProvider>
  );
}
