"use client";

import { FormEvent, useEffect, useState } from "react";
import { Shield, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";

type BookingRow = {
  id: string;
  courseTitle: string;
  campus: string;
  paid: boolean;
  email: string;
  phone: string | null;
  participants: number;
  createdAt: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const confirmedBookings = bookings.filter((booking) => booking.paid);

  const peoplePerCourseAndCampus = confirmedBookings.reduce(
    (acc, booking) => {
      const current = acc[booking.courseTitle] ?? { Mokopane: 0, Polokwane: 0 };
      const campusKey =
        booking.campus === "Mokopane" ? "Mokopane" : "Polokwane";

      acc[booking.courseTitle] = {
        ...current,
        [campusKey]: current[campusKey] + booking.participants,
      };

      return acc;
    },
    {} as Record<string, { Mokopane: number; Polokwane: number }>,
  );

  const coursePeopleRows = Object.entries(peoplePerCourseAndCampus)
    .sort(
      ([, a], [, b]) => b.Mokopane + b.Polokwane - (a.Mokopane + a.Polokwane),
    )
    .map(([courseTitle, campuses]) => ({
      courseTitle,
      mokopaneCount: campuses.Mokopane,
      polokwaneCount: campuses.Polokwane,
      totalCount: campuses.Mokopane + campuses.Polokwane,
    }));

  async function loadBookings() {
    const res = await fetch("/api/admin/bookings", { cache: "no-store" });

    if (res.status === 401) {
      setLoggedIn(false);
      setBookings([]);
      return;
    }

    if (!res.ok) {
      throw new Error("Could not load bookings");
    }

    const data = (await res.json()) as { bookings: BookingRow[] };
    setBookings(data.bookings);
    setLoggedIn(true);
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await loadBookings();
      } catch {
        if (mounted) setError("Could not load admin page.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Invalid username or password.");
        return;
      }

      await loadBookings();
      setUsername("");
      setPassword("");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setAuthLoading(false);
      setLoading(false);
    }
  }

  async function handleLogout() {
    setAuthLoading(true);
    setError(null);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setLoggedIn(false);
      setBookings([]);
    } catch {
      setError("Could not log out. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <p className="text-sm text-muted-foreground">Loading admin page...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Admin Login</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sign in to view course bookings.
          </p>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                required
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full h-10 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
            >
              {authLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <Link
              href="/"
              className="w-full h-10 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted inline-flex items-center justify-center"
            >
              Back to Courses
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Admin Bookings
            </h1>
            <p className="text-xs text-muted-foreground">
              Confirmed attendees are counted only after successful payment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center h-9 px-3 rounded-lg border border-border text-sm hover:bg-muted"
            >
              Back to Courses
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={authLoading}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        <div className="mb-6 overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Mokopane</th>
                <th className="px-4 py-3">Polokwane</th>
                <th className="px-4 py-3">Confirmed Total</th>
              </tr>
            </thead>
            <tbody>
              {coursePeopleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                coursePeopleRows.map((row) => (
                  <tr key={row.courseTitle} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.courseTitle}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {row.mokopaneCount}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {row.polokwaneCount}
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium">
                      {row.totalCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Course Booked</th>
                <th className="px-4 py-3">Campus</th>
                <th className="px-4 py-3">People</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Booked</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {booking.courseTitle}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {booking.campus}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {booking.participants}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          booking.paid
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {booking.paid ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {booking.email}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {booking.phone ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString("en-ZA")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
