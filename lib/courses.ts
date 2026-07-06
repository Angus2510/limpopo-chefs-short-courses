export type Category =
  | "Fundamentals"
  | "Baking"
  | "Pastry"
  | "World Cuisine"
  | "Dining & Wine";

export interface Course {
  id: string;
  title: string;
  category: Category;
  description: string;
  duration: string;
  price: number;
  availableDates: string[]; // ISO: YYYY-MM-DD
  maxParticipants: number;
  instructor: string;
  includes: string[];
  emoji: string;
}

export const CATEGORIES: Category[] = [
  "Fundamentals",
  "Baking",
  "Pastry",
  "World Cuisine",
  "Dining & Wine",
];

export const COURSES: Course[] = [
  {
    id: "knife-skills",
    title: "Knife Skills Masterclass",
    category: "Fundamentals",
    description:
      "Master the essential cutting techniques used by professional chefs. Learn to select, sharpen, and use your knives with confidence and precision across a range of classical cuts.",
    duration: "1 Day (8 hrs)",
    price: 850,
    availableDates: [
      "2026-07-19",
      "2026-08-02",
      "2026-08-16",
      "2026-09-06",
      "2026-09-20",
    ],
    maxParticipants: 12,
    instructor: "Chef Thembi Nkosi",
    includes: ["All ingredients", "Chef's apron", "Recipe booklet", "Lunch"],
    emoji: "🔪",
  },
  {
    id: "bread-baking",
    title: "Artisan Bread Baking",
    category: "Baking",
    description:
      "Discover the craft of artisan bread. From sourdough starters to ciabatta and focaccia — leave with the skills and confidence to bake professional-quality bread at home.",
    duration: "1 Day (8 hrs)",
    price: 1200,
    availableDates: ["2026-07-25", "2026-08-08", "2026-08-22", "2026-09-12"],
    maxParticipants: 10,
    instructor: "Chef Mpho Dlamini",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Take-home bread loaf",
    ],
    emoji: "🍞",
  },
  {
    id: "french-pastry",
    title: "Classic French Pastry",
    category: "Pastry",
    description:
      "Immerse yourself in the elegant world of French patisserie. Over two days, master croissants, choux pastry, tart shells, and crème brûlée under expert guidance.",
    duration: "2 Days (16 hrs)",
    price: 1800,
    availableDates: ["2026-07-26", "2026-08-15", "2026-09-05", "2026-10-10"],
    maxParticipants: 8,
    instructor: "Chef Lerato Mokoena",
    includes: [
      "All ingredients",
      "Chef's apron & tools",
      "Recipe booklet",
      "Lunch both days",
      "Pastry box to take home",
    ],
    emoji: "🥐",
  },
  {
    id: "sushi-masterclass",
    title: "Sushi & Japanese Techniques",
    category: "World Cuisine",
    description:
      "Learn the art of sushi from scratch — rice preparation, fish selection and cutting, maki, nigiri, and temaki. Understand the philosophy and precision behind Japanese cuisine.",
    duration: "1 Day (8 hrs)",
    price: 1500,
    availableDates: ["2026-07-18", "2026-08-01", "2026-08-29", "2026-09-26"],
    maxParticipants: 10,
    instructor: "Chef Tshepo Sithole",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Sushi lunch",
    ],
    emoji: "🍣",
  },
  {
    id: "cake-decorating",
    title: "Cake Decorating & Sugar Art",
    category: "Pastry",
    description:
      "Transform your cakes with professional decorating techniques. Learn fondant work, buttercream piping, sugar flowers, and modern cake design trends used in top bakeries.",
    duration: "2 Days (16 hrs)",
    price: 1400,
    availableDates: ["2026-07-23", "2026-08-06", "2026-08-27", "2026-09-24"],
    maxParticipants: 10,
    instructor: "Chef Nomsa Khumalo",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Decorating toolkit",
      "Recipe booklet",
      "Decorated cake to take home",
    ],
    emoji: "🎂",
  },
  {
    id: "wine-pairing",
    title: "Wine & Food Pairing",
    category: "Dining & Wine",
    description:
      "Elevate every meal with the knowledge to pair wines perfectly with food. Explore South African and international varietals alongside specially prepared food pairings.",
    duration: "Half Day (4 hrs)",
    price: 950,
    availableDates: [
      "2026-07-17",
      "2026-07-31",
      "2026-08-14",
      "2026-08-28",
      "2026-09-18",
    ],
    maxParticipants: 16,
    instructor: "Chef Andile van Niekerk",
    includes: [
      "Wine selection (6 wines)",
      "Paired food platters",
      "Tasting notes booklet",
    ],
    emoji: "🍷",
  },
  {
    id: "stocks-sauces",
    title: "Stocks, Sauces & Flavour",
    category: "Fundamentals",
    description:
      "The foundation of every great dish. Learn to make classic stocks and master the five mother sauces — espagnole, velouté, béchamel, hollandaise, and sauce tomat.",
    duration: "1 Day (8 hrs)",
    price: 850,
    availableDates: ["2026-07-22", "2026-08-05", "2026-08-19", "2026-09-09"],
    maxParticipants: 12,
    instructor: "Chef Thembi Nkosi",
    includes: ["All ingredients", "Chef's apron", "Recipe booklet", "Lunch"],
    emoji: "🍲",
  },
  {
    id: "sa-heritage",
    title: "South African Heritage Cooking",
    category: "World Cuisine",
    description:
      "Celebrate the rich culinary traditions of South Africa. From potjiekos and braai techniques to Cape Malay curries and chakalaka — explore the flavours that define our nation.",
    duration: "1 Day (8 hrs)",
    price: 1200,
    availableDates: [
      "2026-07-24",
      "2026-08-07",
      "2026-08-21",
      "2026-09-11",
      "2026-10-02",
    ],
    maxParticipants: 14,
    instructor: "Chef Refilwe Sithole",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Braai lunch",
    ],
    emoji: "🍖",
  },
];

export function formatPrice(amount: number): string {
  return `R ${amount.toLocaleString("en-ZA")}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
