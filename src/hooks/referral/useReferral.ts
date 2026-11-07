import { useEffect, useState } from "react";
import axios from "axios";
import type { MyReferrals, ValidatedReferralCode } from "@/types/referral";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const validateReferralCode = async (code: string) => {
  const res = await axios.post<ValidatedReferralCode>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/referral/validate`,
    { code },
    { headers: authHeaders() }
  );
  return res.data;
};

export const useMyReferrals = () => {
  const [data, setData] = useState<MyReferrals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get<MyReferrals>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/referral/me`, { headers: authHeaders() })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
};
