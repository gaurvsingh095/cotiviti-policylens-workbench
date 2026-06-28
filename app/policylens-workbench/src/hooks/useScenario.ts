import { useEffect, useMemo, useState } from "react";
import type { PolicyDomain, EvaluationResult } from "../types/policy";
import { evaluateCase } from "../logic/policyEngine";

type Values = Record<string, number | boolean | string>;

export function useScenario(domain: PolicyDomain) {
  const [caseId, setCaseId] = useState<string>(domain.cases[0].id);
  const [values, setValues] = useState<Values>({ ...domain.cases[0].values });

  // Reset when the domain changes.
  useEffect(() => {
    setCaseId(domain.cases[0].id);
    setValues({ ...domain.cases[0].values });
  }, [domain.domainId]);

  const selectCase = (id: string) => {
    setCaseId(id);
    const c = domain.cases.find((x) => x.id === id);
    if (c) setValues({ ...c.values });
  };

  const setField = (key: string, value: number | boolean | string) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // mark custom if it diverges from the selected case
      const c = domain.cases.find((x) => x.id === caseId);
      if (c) {
        const same = Object.keys(c.values).every((k) => String(c.values[k]) === String(next[k]));
        if (!same) setCaseId("__custom");
      }
      return next;
    });
  };

  const result: EvaluationResult = useMemo(() => evaluateCase(domain, values), [domain, values]);

  return { caseId, values, selectCase, setField, result };
}
