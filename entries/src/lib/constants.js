export const CLASS_LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

export const SUBJECTS = {
  JSS: [
    "Mathematics",
    "English Language",
    "Basic Science",
    "Basic Technology",
    "Civic Education",
    "Social Studies",
    "Agricultural Science",
    "Business Studies",
    "Computer Studies",
    "Cultural and Creative Arts",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "French",
    "Physical and Health Education",
    "Home Economics",
  ],
  SS: [
    "Mathematics",
    "English Language",
    "Biology",
    "Chemistry",
    "Physics",
    "Economics",
    "Government",
    "Literature in English",
    "Geography",
    "Commerce",
    "Accounting",
    "Agricultural Science",
    "Computer Studies",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "Civic Education",
    "Further Mathematics",
    "Technical Drawing",
    "Food and Nutrition",
    "Physical and Health Education",
  ],
};

export const getSubjectsForClass = (classLevel) => {
  if (!classLevel) return [];
  if (classLevel.startsWith("JSS")) return SUBJECTS.JSS;
  return SUBJECTS.SS;
};

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export const FREE_DAILY_LIMIT = 3;

export const BANK_DETAILS = {
  bank_name: "PalmPay",
  account_number: "9065667462",
  account_name: "Arowolo Olalekan Abraham",
};
export const FREE_MAX_DIFFICULTY = "Easy";

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: "Monthly Plan",
    price: 1500,
    currency: "NGN",
    duration: 30,
    features: [
      "Unlimited questions daily",
      "All difficulty levels (Easy, Medium, Hard)",
      "Full explanations & corrections",
      "Progress tracking",
      "All subjects & classes",
      "Quiz history",
    ],
  },
  yearly: {
    name: "Yearly Plan",
    price: 12000,
    currency: "NGN",
    duration: 365,
    features: [
      "Everything in Monthly",
      "Save 33% vs monthly",
      "Priority support",
      "Downloadable results",
      "Performance analytics",
      "Early access to new features",
    ],
  },
};

export const GRADE_REMARKS = [
  { min: 75, grade: "A", remark: "Distinction", color: "text-emerald-600" },
  { min: 60, grade: "B", remark: "Credit", color: "text-blue-600" },
  { min: 50, grade: "C", remark: "Merit", color: "text-yellow-600" },
  { min: 40, grade: "D", remark: "Pass", color: "text-orange-500" },
  { min: 0, grade: "F", remark: "Fail", color: "text-red-500" },
];

export const getGrade = (percentage) => {
  return GRADE_REMARKS.find((g) => percentage >= g.min) || GRADE_REMARKS[GRADE_REMARKS.length - 1];
};

export const TOPICS_BY_SUBJECT = {
  Mathematics: ["Number and Numeration", "Algebra", "Geometry", "Statistics", "Trigonometry", "Calculus"],
  "English Language": ["Grammar", "Comprehension", "Essay Writing", "Oral English", "Vocabulary", "Literature"],
  Biology: ["Cell Biology", "Genetics", "Ecology", "Human Biology", "Plant Biology", "Evolution"],
  Chemistry: ["Atomic Structure", "Chemical Bonding", "Organic Chemistry", "Acids & Bases", "Electrochemistry", "Thermochemistry"],
  Physics: ["Mechanics", "Waves", "Electricity", "Magnetism", "Heat", "Modern Physics"],
  Economics: ["Demand and Supply", "Production", "National Income", "Money & Banking", "International Trade", "Public Finance"],
  Government: ["Constitution", "Electoral Systems", "Political Parties", "Federalism", "Local Government", "International Relations"],
  Geography: ["Physical Geography", "Human Geography", "Map Reading", "Weather & Climate", "Population", "Resources"],
};