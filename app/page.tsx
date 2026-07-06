"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookingSheet } from "@/components/booking-sheet";
import {
  COURSES,
  CATEGORIES,
  CAMPUSES,
  formatPrice,
  type Course,
  type Category,
  type Campus,
} from "@/lib/courses";
import { ChefHat, Clock, MapPin, Phone, Users } from "lucide-react";

const CATEGORY_GRADIENTS: Record<string, string> = {
  Fundamentals: "from-[#315631] to-[#1e3d1e]",
  Baking: "from-amber-600 to-amber-900",
  Pastry: "from-rose-600 to-rose-900",
  "World Cuisine": "from-orange-500 to-red-800",
  "Dining & Wine": "from-purple-700 to-purple-950",
};

export default function ShortCoursesPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [activeCampus, setActiveCampus] = useState<Campus | "All">("All");
  const [bookingCourse, setBookingCourse] = useState<Course | null>(null);

  const visible =
    activeCategory === "All"
      ? COURSES
      : COURSES.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div className="leading-none">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Limpopo Chefs Academy
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Short Courses
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="https://limpopochefs.co.za"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              ← Main Site
            </a>
            <span className="text-primary font-semibold border-b-2 border-primary pb-0.5">
              Short Courses
            </span>
            <a
              href="https://limpopochefs.co.za/contact/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Campus pill */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5 shrink-0">
            <MapPin className="w-3 h-3" />
            <span className="hidden sm:inline">Mokopane · Polokwane</span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative bg-primary py-16 md:py-24 overflow-hidden">
        {/* Subtle dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23ffffff'/%3E%3C/svg%3E")`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/25">
            Professional Development
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Short Courses
          </h1>
          <p className="text-white/75 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
            Hands-on culinary workshops led by professional chefs. No prior
            experience required — just a passion for food.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-white font-medium">
              <ChefHat className="w-4 h-4" />
              {COURSES.length} Courses Available
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-white font-medium">
              Starting from R850
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-white font-medium">
              <Users className="w-4 h-4" />
              Small Groups Only
            </div>
          </div>
        </div>
      </section>

      {/* ── Courses ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(["All", ...CATEGORIES] as Array<"All" | Category>).map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              className="rounded-[21px]"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "All" ? "All Courses" : cat}
            </Button>
          ))}
        </div>

        {/* Campus filter */}
        <div className="flex items-center gap-2 mb-8">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Campus:</span>
          {(["All", ...CAMPUSES] as Array<"All" | Campus>).map((c) => (
            <Button
              key={c}
              variant={activeCampus === c ? "default" : "outline"}
              size="sm"
              className="rounded-[21px]"
              onClick={() => setActiveCampus(c)}
            >
              {c === "All" ? "Both" : c}
            </Button>
          ))}
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visible.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-300"
              style={{ "--card-spacing": "0px" } as React.CSSProperties}
            >
              {/* Gradient image area */}
              <div
                className={`relative h-40 bg-linear-to-br ${CATEGORY_GRADIENTS[course.category]} flex items-center justify-center shrink-0`}
              >
                <span className="text-6xl drop-shadow select-none">
                  {course.emoji}
                </span>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/25 text-white border-white/30 text-[10px]">
                    {course.category}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 px-4 pt-4 pb-0">
                <h3 className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 shrink-0" />
                    Max {course.maxParticipants}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3 flex-1">
                  {course.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 mt-3 border-t border-border">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    From
                  </p>
                  <p className="text-lg font-bold text-primary leading-none">
                    {formatPrice(course.price)}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-[21px]"
                  onClick={() => setBookingCourse(course)}
                >
                  Book Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-foreground text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="w-4 h-4 opacity-70" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Limpopo Chefs Academy
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                The leading culinary school in Limpopo. Nationally and
                internationally accredited qualifications.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
                Mokopane Campus
              </h4>
              <div className="space-y-1.5 text-sm text-white/50">
                <p className="flex items-center gap-2">
                  <Phone className="w-3 h-3 shrink-0" /> 015 491 1226
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 shrink-0" /> 82 Rabe Street,
                  Mokopane 0600
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
                Polokwane Campus
              </h4>
              <div className="space-y-1.5 text-sm text-white/50">
                <p className="flex items-center gap-2">
                  <Phone className="w-3 h-3 shrink-0" /> 015 292 0102
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 shrink-0" /> 21 Sapphire Street,
                  Polokwane 0699
                </p>
              </div>
            </div>
          </div>
          <Separator className="bg-white/10 mb-6" />
          <p className="text-xs text-white/30 text-center">
            © {new Date().getFullYear()} Limpopo Chefs Academy · All Rights
            Reserved · Secure payments via Yoco
          </p>
        </div>
      </footer>

      {/* Booking sheet */}
      <BookingSheet
        key={bookingCourse?.id ?? ""}
        course={bookingCourse}
        open={bookingCourse !== null}
        onClose={() => setBookingCourse(null)}
        defaultCampus={activeCampus === "All" ? null : activeCampus}
      />
    </div>
  );
}
