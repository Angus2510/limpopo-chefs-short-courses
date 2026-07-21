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
  availableDates: string[]; // ISO: YYYY-MM-DD — empty means TBC
  maxParticipants: number;
  instructor: string;
  includes: string[];
  emoji: string;
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
    id: "lets-go-to-asia",
    title: "Let's Go to Asia",
    category: "World Cuisine",
    description:
      "Dive into the vibrant flavours of Asia. Learn to prepare authentic Ramen, delicate Dim Sum, and silky Potato Noodles — mastering the techniques and flavour profiles of Asian cuisine.",
    duration: "1 Day (8 hrs)",
    price: 950,
    availableDates: ["2026-08-15"],
    maxParticipants: 16,
    instructor: "Chef Kelly, Chef Breyton & Chef Kopano",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Asian-inspired lunch",
    ],
    emoji: "🥢",
    campuses: ["Polokwane"],
  },
  {
    id: "cooking-club-aug",
    title: "Cooking Club: Butter Chicken & Paratha",
    category: "Fundamentals",
    description:
      "Our monthly budget cooking club — this session tackles a crowd favourite. Make a rich, aromatic Butter Chicken from scratch, served with freshly rolled Paratha flatbread, all on a budget.",
    duration: "Evening (3 hrs)",
    price: 450,
    availableDates: ["2026-08-19"],
    maxParticipants: 25,
    instructor: "Chef Kelly & Chef Franco",
    includes: ["All ingredients", "Tasting portions", "Recipe card"],
    emoji: "🍛",
    campuses: ["Polokwane"],
  },
  {
    id: "barista-croissants",
    title: "Barista & Croissants",
    category: "Baking",
    description:
      "Learn the fundamentals of professional coffee making alongside the art of croissant preparation. Leave with both barista skills and a box of freshly baked, buttery croissants.",
    duration: "1 Day (8 hrs)",
    price: 850,
    availableDates: ["2026-08-29"],
    maxParticipants: 14,
    instructor: "Chef Kelly, Chef Franco & Chef Potego",
    includes: [
      "All ingredients",
      "Coffee tasting (4 styles)",
      "Recipe booklet",
      "Take-home croissants",
    ],
    emoji: "☕",
    campuses: ["Polokwane"],
  },

  // ── September 2026 ─────────────────────────────────────────────────────────
  {
    id: "macaron-class",
    title: "Macaron Class",
    category: "Pastry",
    description:
      "Unlock the secrets to perfect French macarons. Learn the precise techniques behind the batter, filling, and finishing — and how to troubleshoot the most common mistakes.",
    duration: "1 Day (8 hrs)",
    price: 950,
    availableDates: ["2026-09-05"],
    maxParticipants: 12,
    instructor: "Chef Breyton, Chef Franco & Chef Potego",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Macaron box to take home",
    ],
    emoji: "🫐",
    campuses: ["Polokwane"],
  },
  {
    id: "cooking-club-sep",
    title: "Cooking Club: Chicken & Mushroom Ravioli",
    category: "Fundamentals",
    description:
      "This month's budget cooking lesson is a classic Italian comfort dish — homemade Chicken & Mushroom Ravioli. Make fresh pasta dough and a rich, creamy filling from scratch.",
    duration: "Evening (3 hrs)",
    price: 450,
    availableDates: ["2026-09-16"],
    maxParticipants: 25,
    instructor: "Chef Kelly",
    includes: ["All ingredients", "Tasting portions", "Recipe card"],
    emoji: "🍝",
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
    campuses: ["Polokwane"],
  },
  {
    id: "gourmet-cookies",
    title: "Gourmet Filled Cookies",
    category: "Baking",
    description:
      "Elevate your baking with premium filled cookies. Learn professional techniques for baking, filling, and finishing gourmet cookies worthy of any patisserie window.",
    duration: "1 Day (8 hrs)",
    price: 750,
    availableDates: ["2026-09-19"],
    maxParticipants: 14,
    instructor: "Chef Breyton, Chef Kelly & Chef Franco",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Filled cookies to take home",
    ],
    emoji: "🍪",
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
    campuses: ["Polokwane"],
  },

  // ── October 2026 ───────────────────────────────────────────────────────────
  {
    id: "sushi-class",
    title: "Sushi Class",
    category: "World Cuisine",
    description:
      "Learn the foundations of professional sushi preparation — sushi rice, fish selection, maki, nigiri, and plating. Leave with the skills and confidence to create restaurant-quality sushi at home.",
    duration: "1 Day (8 hrs)",
    price: 950,
    availableDates: ["2026-10-03"],
    maxParticipants: 14,
    instructor: "Chef Kelly, Chef Franco, Chef Kopano & Chef Potego",
    includes: [
      "All ingredients",
      "Chef's apron",
      "Recipe booklet",
      "Sushi lunch",
    ],
    emoji: "🍣",
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
    campuses: ["Polokwane"],
  },
  {
    id: "cooking-club-oct",
    title: "Cooking Club: Chicken Parmesana & Goddess Salad",
    category: "Fundamentals",
    description:
      "This month's budget cooking club brings an Italian-American classic to the table — crispy Chicken Parmesana alongside a vibrant Goddess Salad. Hearty, flavourful, and surprisingly affordable.",
    duration: "Evening (3 hrs)",
    price: 450,
    availableDates: ["2026-10-21"],
    maxParticipants: 25,
    instructor: "Chef Kelly, Chef Franco & Chef Kopano",
    includes: ["All ingredients", "Tasting portions", "Recipe card"],
    emoji: "🍗",
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
    campuses: ["Polokwane"],
  },
  {
    id: "cooking-club-nov",
    title: "Cooking Club: Perfect Pizza",
    category: "Fundamentals",
    description:
      "This month's budget cooking club is all about the perfect pizza. Make proper dough, a rich tomato base, and explore toppings that elevate this classic into something truly special.",
    duration: "Evening (3 hrs)",
    price: 450,
    availableDates: ["2026-11-18"],
    maxParticipants: 25,
    instructor: "Chef Kelly, Chef Franco & Chef Kopano",
    includes: ["All ingredients", "Tasting portions", "Recipe card"],
    emoji: "🍕",
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
    instructor: "Chef Breyton, Chef Kelly, Chef Franco & Chef Kopano",
    includes: [
      "All ingredients",
      "Decorating toolkit",
      "Recipe booklet",
      "Decorated canvas cake to take home",
    ],
    emoji: "🎨",
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
    campuses: ["Polokwane"],
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
