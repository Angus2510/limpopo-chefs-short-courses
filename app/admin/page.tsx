"use client";

import { FormEvent, useEffect, useState } from "react";
import { Shield, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { COURSES } from "@/lib/courses";

type BookingRow = {
  id: string;
  firstName?: string;
  firstname?: string;
  bookedBy?: string;
  lastName?: string;
  courseId: string;
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
  const [selectedCourse, setSelectedCourse] = useState("All courses");
  const [selectedCampus, setSelectedCampus] = useState("All campuses");
  const [transferringId, setTransferringId] = useState<string | null>(null);

  const confirmedBookings = bookings.filter((booking) => booking.paid);
  const courseOptions = COURSES.map((course) => ({
    id: course.id,
    label: course.title,
  }));
  const uniqueCourseTitles = Array.from(
    new Set(confirmedBookings.map((booking) => booking.courseTitle)),
  ).sort((a, b) => a.localeCompare(b));
  const bookingsFilteredByCourse =
    selectedCourse === "All courses"
      ? confirmedBookings
      : confirmedBookings.filter(
          (booking) => booking.courseTitle === selectedCourse,
        );
  const printableBookings =
    selectedCampus === "All campuses"
      ? bookingsFilteredByCourse
      : bookingsFilteredByCourse.filter(
          (booking) => booking.campus === selectedCampus,
        );
  const uniqueCampuses = Array.from(
    new Set(bookingsFilteredByCourse.map((booking) => booking.campus)),
  ).sort();
  const printableTotalPeople = printableBookings.reduce(
    (sum, booking) => sum + booking.participants,
    0,
  );
  const compactCourseName = (courseTitle: string) =>
    courseTitle.length > 30
      ? `${courseTitle.slice(0, 30).trim()}…`
      : courseTitle;

  const printSections =
    selectedCourse === "All courses"
      ? Array.from(
          new Set(printableBookings.map((booking) => booking.courseTitle)),
        ).map((courseTitle) => ({
          courseTitle,
          campuses: ["Mokopane", "Polokwane"].map((campus) => ({
            campus,
            rows: printableBookings
              .filter(
                (booking) =>
                  booking.courseTitle === courseTitle && booking.campus === campus,
              )
              .flatMap((booking) =>
                Array.from({ length: booking.participants }, (_, index) => ({
                  ...booking,
                  attendeeIndex: index + 1,
                  attendeeName:
                    `${booking.firstName ?? ""} ${booking.lastName ?? ""}`.trim() ||
                    booking.bookedBy?.trim() ||
                    "-",
                  attendeePhone: booking.phone ?? "",
                  isExtraGuest: index > 0,
                })),
              ),
          })),
        }))
      : [
          {
            courseTitle: selectedCourse,
            campuses: ["Mokopane", "Polokwane"].map((campus) => ({
              campus,
              rows: printableBookings
                .filter((booking) => booking.campus === campus)
                .flatMap((booking) =>
                  Array.from({ length: booking.participants }, (_, index) => ({
                    ...booking,
                    attendeeIndex: index + 1,
                    attendeeName:
                      `${booking.firstName ?? ""} ${booking.lastName ?? ""}`.trim() ||
                      booking.bookedBy?.trim() ||
                      "-",
                    attendeePhone: booking.phone ?? "",
                    isExtraGuest: index > 0,
                  })),
                ),
            })),
          },
        ];

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
    const res = await fetch(`/api/admin/bookings?ts=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (res.status === 401) {
      setLoggedIn(false);
      setBookings([]);
      return;
    }

    if (!res.ok) {
      throw new Error("Could not load bookings");
    }

    const data = (await res.json()) as { bookings: BookingRow[] };
    const normalizedBookings = data.bookings.map((booking) => ({
      ...booking,
      firstName: booking.firstName ?? booking.firstname ?? "",
    }));
    setBookings(normalizedBookings);
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

  async function handleTransferBooking(
    bookingId: string,
    nextCourseId: string,
  ) {
    if (!nextCourseId) return;
    setTransferringId(bookingId);
    setError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: nextCourseId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Could not move this booking.",
        );
      }

      const updatedBooking = (await res.json()) as { booking: BookingRow };
      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                courseId: updatedBooking.booking.courseId,
                courseTitle: updatedBooking.booking.courseTitle,
              }
            : booking,
        ),
      );
    } catch (transferError) {
      setError(
        transferError instanceof Error
          ? transferError.message
          : "Could not move this booking.",
      );
    } finally {
      setTransferringId(null);
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

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between no-print">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Select course to print
            </label>
            <select
              value={selectedCourse}
              onChange={(event) => setSelectedCourse(event.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            >
              <option value="All courses">All courses</option>
              {uniqueCourseTitles.map((courseTitle) => (
                <option key={courseTitle} value={courseTitle}>
                  {courseTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Select campus to print
            </label>
            <select
              value={selectedCampus}
              onChange={(event) => setSelectedCampus(event.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            >
              <option value="All campuses">All campuses</option>
              {uniqueCampuses.map((campus) => (
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Print attendee list
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-card p-4 no-print">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Selected print view
          </p>
          <p className="mt-2 text-lg font-bold text-foreground">
            {selectedCourse}
            {selectedCampus !== "All campuses" && ` · ${selectedCampus}`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {printableBookings.length} paid bookings · {printableTotalPeople}{" "}
            people
          </p>
        </div>

        <div className="hidden print:block print:mb-6 print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-foreground">
            {selectedCourse === "All courses" ? "Course Attendance Register" : selectedCourse}
            {selectedCampus !== "All campuses" && ` · ${selectedCampus}`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {printableTotalPeople} people · Phone numbers included
          </p>

          <div className="mt-4 space-y-8">
            {printSections.map((section) => (
              <div key={section.courseTitle} className="page-break-inside-avoid">
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {section.courseTitle}
                </h3>

                {section.campuses.map(({ campus, rows }) => (
                  <div key={`${section.courseTitle}-${campus}`} className="mb-5">
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {campus}
                    </h4>

                    {rows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No attendees.</p>
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-border">
                        <table className="w-full border-collapse text-sm">
                          <thead className="bg-muted/50">
                            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                              <th className="border border-border px-2 py-2">Guest</th>
                              <th className="border border-border px-2 py-2">Name</th>
                              <th className="border border-border px-2 py-2">Phone</th>
                              <th className="border border-border px-2 py-2">Signature</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row) => (
                              <tr key={`${row.id}-${row.attendeeIndex}`} className="align-top">
                                <td className="border border-border px-2 py-3 text-center font-semibold">
                                  {row.attendeeIndex}
                                </td>
                                <td className="border border-border px-2 py-3">
                                  {row.isExtraGuest ? "" : row.attendeeName}
                                </td>
                                <td className="border border-border px-2 py-3">
                                  {row.isExtraGuest ? "" : row.attendeePhone}
                                </td>
                                <td className="border border-border px-2 py-3 w-48">
                                  &nbsp;
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className={
            selectedCourse === "All courses"
              ? "mb-6 overflow-x-auto border border-border rounded-xl"
              : "mb-6 overflow-x-auto border border-border rounded-xl print:hidden"
          }
        >
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
                <th className="px-3 py-3">Booked By</th>
                <th className="px-3 py-3">Course</th>
                <th className="px-3 py-3 print:hidden">Move To</th>
                <th className="px-3 py-3">Campus</th>
                <th className="px-3 py-3">People</th>
                <th className="px-3 py-3 print:hidden">Paid</th>
                <th className="px-3 py-3 print:hidden">Email</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3 print:hidden">Booked</th>
              </tr>
            </thead>
            <tbody>
              {printableBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No paid bookings for this course yet.
                  </td>
                </tr>
              ) : (
                printableBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-border align-top"
                  >
                    <td className="px-3 py-3 font-medium text-foreground">
                      {booking.firstName?.trim() ||
                        booking.bookedBy?.trim().split(/\s+/)[0] ||
                        "-"}
                    </td>
                    <td className="px-3 py-3 font-medium text-foreground">
                      {compactCourseName(booking.courseTitle)}
                    </td>
                    <td className="px-3 py-3 print:hidden">
                      <select
                        value={booking.courseId}
                        onChange={(event) =>
                          handleTransferBooking(booking.id, event.target.value)
                        }
                        disabled={transferringId === booking.id}
                        className="h-9 rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                      >
                        {courseOptions.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-foreground">
                      {booking.campus}
                    </td>
                    <td className="px-3 py-3 text-foreground">
                      {booking.participants}
                    </td>
                    <td className="px-3 py-3 print:hidden">
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
                    <td className="px-3 py-3 text-foreground print:hidden">
                      {booking.email}
                    </td>
                    <td className="px-3 py-3 text-foreground">
                      {booking.phone ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground print:hidden">
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
