import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import UserForm from "../../../components/forms/UserForm";
import { getUser, updateUser } from "../../../api/users.api";

export default function UserEdit() {
  const { id } = useParams(); // This is now userId (e.g., "usr-01")
  const nav = useNavigate();

  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      setErr("");
      setLoading(true);

      try {
        const res = await getUser(id);
        const obj = res.data?.user;

        if (!obj) throw new Error("User not found");
        if (mounted) setInitial(obj);
      } catch (e) {
        if (mounted) {
          setErr(e?.response?.data?.message || e.message || "Failed to load user");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [id]);

  const onSubmit = async (payload) => {
    setErr("");
    setSuccess("");

    try {
      await updateUser(id, payload);
      setSuccess("User updated successfully!");

      // Navigate after short delay to show success message
      setTimeout(() => nav("/staff/users"), 1000);
    } catch (e) {
      throw e; // Re-throw so UserForm can handle it
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Edit User</h2>
          {initial && (
            <p className="text-sm text-slate-500">
              Editing: {initial.name} ({initial.userId || initial.id})
            </p>
          )}
        </div>
        <Link to="/staff/users">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} onClose={() => setErr("")} />
        </div>
      )}

      {success && (
        <div className="mt-4">
          <Toast type="success" message={success} />
        </div>
      )}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-slate-500">
              <svg
                className="inline-block h-5 w-5 animate-spin mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading user...
            </div>
          </div>
        ) : err && !initial ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">{err}</div>
            <Link to="/staff/users">
              <Button variant="outline">Go Back</Button>
            </Link>
          </div>
        ) : initial ? (
          <UserForm
            mode="edit"
            initial={initial}
            onSubmit={onSubmit}
            submitText="Update User"
          />
        ) : null}
      </div>
    </PageShell>
  );
}