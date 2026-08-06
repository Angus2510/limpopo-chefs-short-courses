export type Category =
  | "Fundamentals"
  | "Baking"
  | "Pastry"
  | "World Cuisine"
  | "Dining & Wine"
  | "Events & Experiences";

export type Campus = "Mokopane" | "Polokwane";

export const CAMPUSES: Campus[] = ["Mokopane", "Polokwane"];

export interface Course {
  id: string;
  title: string;
  category: Category;
  description: string;
  duration: string;
  price: number;
  bookingChoices?: Array<{
    id: string;
    label: string;
    price: number;
    maxParticipants?: number;
    timeLabel?: string;
    note?: string;
  }>;
  availableDates: string[]; // ISO: YYYY-MM-DD — empty means TBC
  maxParticipants: number;
  instructor: string;
  includes: string[];
  emoji: string;
  cardImage?: string;
  campuses: Campus[];
}

export const CATEGORIES: Category[] = [
  "Fundamentals",
  "Baking",
  "Pastry",
  "World Cuisine",
  "Dining & Wine",
  "Events & Experiences",
];

export const COURSES: Course[] = [
  // ── July 2026 ──────────────────────────────────────────────────────────────

  // ── August 2026 ────────────────────────────────────────────────────────────

  {
    id: "cooking-club-aug",
    title: "3rd Wednesday Cooking Club: Butter Chicken & Garlic Naan",
    category: "Fundamentals",
    description:
      "Join us every month for our Budget Cooking Club. Each month, you’ll learn a new recipe, pick up new cooking skills, and enjoy a fun evening with fellow food lovers. This month’s menu is Butter Chicken served with homemade naan made from scratch. No time to cook? No problem. Simply place your order, collect your meal, and enjoy a freshly prepared homemade dinner without the effort.",
    duration: "Evening (3 hrs)",
    price: 200,
    bookingChoices: [
      {
        id: "cook-with-class",
        label: "Cook with class",
        price: 275,
        maxParticipants: 18,
        timeLabel: "Starts at 17:30",
        note: "Hands-on cooking session",
      },
      {
        id: "takeaway",
        label: "Takeaway order",
        price: 200,
        maxParticipants: 50,
        timeLabel: "Collection between 18:00-20:00",
        note: "Order for collection",
      },
    ],
    availableDates: ["2026-08-19"],
    maxParticipants: 20,
    instructor: "Chef Kelly  ",
    includes: ["All ingredients", "Tasting portions", "Recipe card"],
    emoji: "🍛",
    cardImage: "/3rdwed.jpeg",
    campuses: ["Polokwane", "Mokopane"],
  },
  {
    id: "barista-croissants",
    title: "Barista & Croissants",
    category: "Baking",
    description:
      "Learn the fundamentals of professional coffee preparation while mastering the art of buttery, flaky croissants from scratch. This hands-on class combines essential barista skills with artisan baking techniques, leaving you with the confidence to recreate café-quality favourites at home.",
    duration: "1 Day (8 hrs)",
    price: 850,
    availableDates: ["2026-08-29"],
    maxParticipants: 14,
    instructor: "Chef Kelly,& Chef Potego",
    includes: [
      "All ingredients",
      "Coffee tasting (4 styles)",
      "Recipe booklet",
      "Take-home croissants",
    ],
    emoji: "☕",
    cardImage: "/barista.jpeg",
    campuses: ["Polokwane"],
  },

  // ── September 2026 ─────────────────────────────────────────────────────────
  {
    id: "macaron-class-polokwane",
    title: "Macaron Class",
    category: "Pastry",
    description:
      "Discover the secrets to perfect French macarons from mixing and piping to baking and filling. You'll create beautiful handcrafted macarons to take home while learning tips for consistent results every time.",
    duration: "1 Day (8 hrs)",
    price: 450,
    availableDates: ["2026-09-05"],
    maxParticipants: 30,
    instructor: "Chef Breyton, & Chef Potego",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Macaron box to take home",
    ],
    emoji: "🫐",
    cardImage: "/macaron.jpeg",
    campuses: ["Polokwane"],
  },
  {
    id: "macaron-class-mokopane",
    title: "Macaron Class",
    category: "Pastry",
    description:
      "Discover the secrets to perfect French macarons from mixing and piping to baking and filling. You'll create beautiful handcrafted macarons to take home while learning tips for consistent results every time.",
    duration: "1 Day (8 hrs)",
    price: 450,
    availableDates: ["2026-09-12"],
    maxParticipants: 30,
    instructor: "Chef Breyton, & Chef Potego",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Macaron box to take home",
    ],
    emoji: "🫐",
    cardImage: "/macaron.jpeg",
    campuses: ["Mokopane"],
  },
  {
    id: "cooking-club-sep",
    title: "Cooking Club: ",
    category: "Fundamentals",
    description:
      "Join us every third Wednesday for a relaxed evening of cooking, learning and great food. Each month features a brand-new recipe and hands-on experience led by our professional chefs. Come for the cooking, stay for the company",
    duration: "Evening (3 hrs)",
    price: 450,
    availableDates: ["2026-09-16"],
    maxParticipants: 25,
    instructor: "Chef Kelly",
    includes: ["All ingredients", "Tasting portions", "Recipe card"],
    emoji: "🍝",
    cardImage: "/3rdwed.jpeg",
    campuses: ["Polokwane"],
  },
  {
    id: "secret-supper",
    title: "The Secret Supper Society",
    category: "Dining & Wine",
    description:
      "An exclusive, intimate dining experience unlike any other. The menu is a secret — revealed only on the night. Limited seats ensure a personalised evening of fine food and great company.",
    duration: "Evening (3 hrs)",
    price: 650,
    availableDates: ["2026-09-18", "2026-10-16", "2026-11-27"],
    maxParticipants: 30,
    instructor: "Chef Kelly & Chef Breyton",
    includes: [
      "Multi-course surprise dinner",
      "Wine pairing",
      "Exclusive dining experience",
    ],
    emoji: "🕯️",
    cardImage: "/secret.jpeg",
    campuses: ["Polokwane"],
  },
  {
    id: "gourmet-cookies",
    title: "Gourmet Filled Cookies",
    category: "Baking",
    description:
      "Learn how to create bakery-style gourmet cookies using one versatile dough and four delicious flavour variations. You'll leave with 16 freshly baked cookies and the confidence to recreate them at home.",
    duration: "1 Day (8 hrs)",
    price: 750,
    availableDates: ["2026-09-19"],
    maxParticipants: 14,
    instructor: "Chef Breyton, Chef Kelly ",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Filled cookies to take home",
    ],
    emoji: "🍪",
    cardImage: "/cookie.jpeg",
    campuses: ["Polokwane"],
  },
  {
    id: "potjie-competition",
    title: "Potjie Competition",
    category: "Events & Experiences",
    description:
      "Celebrate Heritage Day with the ultimate South African cooking tradition. Enter as a team, light the fire, and compete for the title of best potjie — judged by our professional chefs.",
    duration: "Full Day",
    price: 450,
    availableDates: ["2026-09-24"],
    maxParticipants: 60,
    instructor: "Chef Kelly & Chef Breyton",
    includes: [
      "Ingredients allowance",
      "Potjie pot & equipment",
      "Prize giving ceremony",
    ],
    emoji: "🏆",
    cardImage: "/potjie.jpeg",
    campuses: ["Polokwane"],
  },
  {
    id: "pastry-refresher-beginners",
    title: "Pastry Refresher – Beginners",
    category: "Pastry",
    description:
      "A comprehensive five-day beginner pastry programme. From choux and shortcrust to tarts and éclairs — build a solid pastry skill set from the ground up under expert guidance.",
    duration: "5 Days",
    price: 3800,
    availableDates: [],
    maxParticipants: 10,
    instructor: "Chef Breyton",
    includes: [
      "All ingredients",
      "Professional tools usage",
      "Recipe manual",
      "Daily lunch",
      "Certificate of completion",
    ],
    emoji: "🎓",
    cardImage: "/pastry-beg.png",
    campuses: ["Polokwane"],
  },

  // ── October 2026 ───────────────────────────────────────────────────────────
  {
    id: "sushi-class",
    title: "Sushi Class",
    category: "World Cuisine",
    description:
      "Discover the art of authentic sushi making in this fun and interactive hands-on class. Learn how to prepare sushi rice, roll a variety of sushi styles, and work with fresh ingredients while mastering techniques you can easily recreate in your own kitchen.",
    duration: "1 Day (8 hrs)",
    price: 950,
    availableDates: ["2026-10-03"],
    maxParticipants: 14,
    instructor: "Chef Kelly, Chef Kopano & Chef Potego",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Sushi lunch",
    ],
    emoji: "🍣",
    cardImage: "/sushi.jpeg",
    campuses: ["Polokwane"],
  },
  {
    id: "school-holiday",
    title: "School Holiday Cooking Lessons",
    category: "Fundamentals",
    description:
      "A five-day school holiday programme designed exclusively for children aged 9–13. Kids will learn basic cooking techniques, kitchen safety, and create delicious dishes each day in a fun, supervised environment.",
    duration: "5 Days (08:00–13:00)",
    price: 2500,
    availableDates: ["2026-10-05"],
    maxParticipants: 20,
    instructor: "Chef Breyton, Chef Kopano & Chef Potego",
    includes: [
      "All ingredients",
      "Children's apron",
      "Recipe booklet",
      "Daily snack & lunch",
    ],
    emoji: "🎒",
    cardImage: "/holiday.jpeg",
    campuses: ["Polokwane"],
  },

  {
    id: "halloween-cooking",
    title: "Halloween Dress-Up Party & Cooking",
    category: "Events & Experiences",
    description:
      "Dust off your costume for the spookiest night of the culinary calendar! Dress up, cook themed dishes, and celebrate Halloween with fellow food lovers in a festive kitchen atmosphere.",
    duration: "Evening (4 hrs)",
    price: 550,
    availableDates: ["2026-10-31"],
    maxParticipants: 30,
    instructor: "Chef Kelly & Chef Breyton",
    includes: [
      "All ingredients",
      "Themed meal & dessert",
      "Costume competition prize",
    ],
    emoji: "🎃",
    cardImage: "/halloween.jpeg",
    campuses: ["Polokwane"],
  },

  // ── November 2026 ──────────────────────────────────────────────────────────
  {
    id: "christmas-cake",
    title: "Christmas Cake Lesson",
    category: "Baking",
    description:
      "Get ahead of the festive season with a professional Christmas cake lesson. Bake, mature, and decorate a traditional Christmas cake — ready to gift or take to the table in December.",
    duration: "1 Day (8 hrs)",
    price: 850,
    availableDates: ["2026-11-07"],
    maxParticipants: 14,
    instructor: "Chef Breyton & Chef Potego",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Christmas cake to take home",
    ],
    emoji: "🎄",
    cardImage: "/chrismas.jpeg",
    campuses: ["Polokwane"],
  },

  {
    id: "canvas-cakes",
    title: "Canvas Cakes",
    category: "Pastry",
    description:
      "Transform a simple cake into a work of art. This creative decorating class covers canvas-style cake design using buttercream, texture tools, and colour theory.",
    duration: "1 Day (8 hrs)",
    price: 950,
    availableDates: ["2026-11-21"],
    maxParticipants: 14,
    instructor: "Chef Breyton, Chef Kelly & Chef Kopano",
    includes: [
      "All ingredients",
      "Decorating toolkit",
      "Recipe booklet",
      "Decorated canvas cake to take home",
    ],
    emoji: "🎨",
    cardImage: "/cakes.jpeg",
    campuses: ["Polokwane"],
  },
  {
    id: "pastry-refresher-advanced",
    title: "Pastry Refresher – Advanced",
    category: "Pastry",
    description:
      "A five-day advanced pastry programme for those looking to elevate their existing skills. Cover entremets, mirror glazes, sugar work, and multi-component desserts.",
    duration: "5 Days",
    price: 4200,
    availableDates: [],
    maxParticipants: 10,
    instructor: "Chef Breyton",
    includes: [
      "All ingredients",
      "Professional tools usage",
      "Recipe manual",
      "Daily lunch",
      "Certificate of completion",
    ],
    emoji: "⭐",
    cardImage: "/pastry-adv.png",
    campuses: ["Polokwane"],
  },
];

export function formatPrice(amount: number): string {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return "TBC";
  }

  return `R ${numericAmount.toLocaleString("en-ZA")}`;
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
