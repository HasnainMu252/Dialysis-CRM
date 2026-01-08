import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { staffMe, patientMe } from "../api/auth.api";
import { storage, TOKENS } from "../utils/storage";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);

    const staffToken = storage.get(TOKENS.staff);
    const patientToken = storage.get(TOKENS.patient);

    setStaff(null);
    setPatient(null);

    try {
      if (staffToken) {
        const res = await staffMe();
        const staffObj =
          res.data?.user ||
          res.data?.staff ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data[0] : res.data);

        setStaff(staffObj || null);
      }
    } catch (e) {
      storage.del(TOKENS.staff);
      setStaff(null);
    }

    try {
      if (patientToken) {
        const res2 = await patientMe();
        const patientObj =
          res2.data?.patient ||
          res2.data?.user ||
          res2.data?.data ||
          (Array.isArray(res2.data) ? res2.data[0] : res2.data);

        setPatient(patientObj || null);
      }
    } catch (e) {
      storage.del(TOKENS.patient);
      setPatient(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      staff,
      patient,
      loading,
      refresh,
      logoutStaff: () => {
        storage.del(TOKENS.staff);
        setStaff(null);
      },
      logoutPatient: () => {
        storage.del(TOKENS.patient);
        setPatient(null);
      },
    }),
    [staff, patient, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
