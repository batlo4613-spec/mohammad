/* Property collection and the filter vocabularies, each label written in both locales. */
const CITIES = [
  { id: "Austin", en: "Austin", fa: "آستین" },
  { id: "Malibu", en: "Malibu", fa: "مالیبو" },
  { id: "Scottsdale", en: "Scottsdale", fa: "اسکاتسدیل" },
  { id: "Miami", en: "Miami", fa: "میامی" },
  { id: "Los Angeles", en: "Los Angeles", fa: "لس‌آنجلس" },
  { id: "Beverly Hills", en: "Beverly Hills", fa: "بورلی هیلز" },
  { id: "Lake Tahoe", en: "Lake Tahoe", fa: "دریاچه تاهو" }
];

const TYPES = [
  { id: "Villa", en: "Villa", fa: "ویلا" },
  { id: "House", en: "House", fa: "خانه" },
  { id: "Estate", en: "Estate", fa: "عمارت" },
  { id: "Residence", en: "Residence", fa: "اقامتگاه لوکس" },
  { id: "Penthouse", en: "Penthouse", fa: "پنت‌هاوس" },
  { id: "Retreat", en: "Retreat", fa: "ویلای دنج" }
];

const PRICE_STEPS = [
  { id: "2000000", en: "$2 Million", fa: "۲ میلیون دلار" },
  { id: "3000000", en: "$3 Million", fa: "۳ میلیون دلار" },
  { id: "4000000", en: "$4 Million", fa: "۴ میلیون دلار" },
  { id: "5000000", en: "$5 Million", fa: "۵ میلیون دلار" }
];

const SORT_OPTIONS = [
  { id: "featured", en: "Featured", fa: "منتخب" },
  { id: "low", en: "Price: low to high", fa: "قیمت: کم به زیاد" },
  { id: "high", en: "Price: high to low", fa: "قیمت: زیاد به کم" }
];

const PROPERTY_DATA = [
  {
    id: 1,
    name: "Lakeside Modern Villa",
    city: "Austin",
    type: "Villa",
    price: 2350000,
    priceLabel: { en: "$2.35 Million", fa: "۲٫۳۵ میلیون دلار" },
    location: { en: "Austin, Texas, USA", fa: "آستین، تگزاس، آمریکا" },
    beds: 4,
    baths: 4,
    sqft: 3850,
    featured: true,
    image: "photo-1600607687939-ce8a6c25118c",
    gallery: ["photo-1600607687939-ce8a6c25118c", "photo-1600607687920-4e2a09cf159d", "photo-1600566753086-00f18fb6b3ea"],
    desc: {
      en: "A serene modern retreat where clean architectural lines meet the calm of the water. Expansive glazing, generous entertaining spaces, and a seamless connection to the outdoors create a home designed for considered living.",
      fa: "خلوتگاهی مدرن و آرام که در آن خطوط معماری مینیمال با سکوت آب هم‌نشین می‌شوند. پنجره‌های بزرگ، فضاهای پذیرایی گسترده و پیوندی روان با بیرون، خانه‌ای برای زندگی سنجیده ساخته‌اند."
    },
    features: {
      en: ["Infinity pool", "Lake views", "Floor-to-ceiling glass", "Outdoor entertaining", "Smart home", "Private garden"],
      fa: ["استخر بی‌نهایت", "چشم‌انداز دریاچه", "شیشه‌های تا سقف", "پذیرایی در حیاط", "خانه‌ی هوشمند", "باغ اختصاصی"]
    }
  },
  {
    id: 2,
    name: "Pacific Glass House",
    city: "Malibu",
    type: "House",
    price: 4800000,
    priceLabel: { en: "$4.8 Million", fa: "۴٫۸ میلیون دلار" },
    location: { en: "Malibu, California, USA", fa: "مالیبو، کالیفرنیا، آمریکا" },
    beds: 5,
    baths: 5,
    sqft: 4620,
    featured: true,
    image: "photo-1600607687644-c7171b42498f",
    gallery: ["photo-1600607687644-c7171b42498f", "photo-1600607687920-4e2a09cf159d", "photo-1600566753190-17f0baa2a6c3"],
    desc: {
      en: "An architectural statement with panoramic coastal outlooks, beautifully balanced materials, and open living spaces designed to make the most of California's light.",
      fa: "بیانیه‌ای از معماری با چشم‌انداز پانوراما به ساحل، متریالی متوازن و فضاهای زندگی باز که نور کالیفرنیا را به بهترین شکل به کار می‌گیرند."
    },
    features: {
      en: ["Ocean views", "Glass facade", "Chef's kitchen", "Terrace", "Private parking", "Designer finishes"],
      fa: ["چشم‌انداز اقیانوس", "نمای شیشه‌ای", "آشپزخانه‌ی حرفه‌ای", "تراس", "پارکینگ اختصاصی", "متریال طراحی‌شده"]
    }
  },
  {
    id: 3,
    name: "Desert Horizon Estate",
    city: "Scottsdale",
    type: "Estate",
    price: 3150000,
    priceLabel: { en: "$3.15 Million", fa: "۳٫۱۵ میلیون دلار" },
    location: { en: "Scottsdale, Arizona, USA", fa: "اسکاتسدیل، آریزونا، آمریکا" },
    beds: 5,
    baths: 4,
    sqft: 4180,
    featured: true,
    image: "photo-1600566753190-17f0baa2a6c3",
    gallery: ["photo-1600566753190-17f0baa2a6c3", "photo-1600607687920-4e2a09cf159d", "photo-1600607687939-ce8a6c25118c"],
    desc: {
      en: "A contemporary desert estate with sculptural forms, quiet courtyards, and indoor-outdoor living framed by the dramatic Arizona landscape.",
      fa: "عمارتی مدرن در دل کویر با فرم‌های مجسمه‌وار، حیاط‌های آرام و زندگی درون و بیرون در قاب چشم‌انداز آریزونا."
    },
    features: {
      en: ["Desert views", "Courtyard", "Pool", "Guest suite", "Stone finishes", "Covered patio"],
      fa: ["چشم‌انداز کویر", "حیاط مرکزی", "استخر", "سوئیت مهمان", "متریال سنگی", "ایوان سرپوشیده"]
    }
  },
  {
    id: 4,
    name: "Oceanfront Residence",
    city: "Miami",
    type: "Residence",
    price: 5200000,
    priceLabel: { en: "$5.2 Million", fa: "۵٫۲ میلیون دلار" },
    location: { en: "Miami, Florida, USA", fa: "میامی، فلوریدا، آمریکا" },
    beds: 5,
    baths: 6,
    sqft: 5100,
    featured: true,
    image: "photo-1600607687920-4e2a09cf159d",
    gallery: ["photo-1600607687920-4e2a09cf159d", "photo-1600607687644-c7171b42498f", "photo-1600566753086-00f18fb6b3ea"],
    desc: {
      en: "A light-filled residence shaped around ocean breezes and expansive views, with elegant entertaining spaces and a private outdoor retreat.",
      fa: "اقامتگاهی پرنور که حول نسیم دریا و چشم‌اندازهای گسترده شکل گرفته، با فضاهایی شکوهمند برای پذیرایی و خلوتگاهی اختصاصی در بیرون."
    },
    features: {
      en: ["Waterfront", "Private pool", "Open-plan living", "Spa bathroom", "Smart home", "Outdoor kitchen"],
      fa: ["کنار آب", "استخر اختصاصی", "نشیمن یکپارچه", "سرویس اسپا", "خانه‌ی هوشمند", "آشپزخانه‌ی بیرونی"]
    }
  },
  {
    id: 5,
    name: "Modern Hillside Retreat",
    city: "Los Angeles",
    type: "Retreat",
    price: 3750000,
    priceLabel: { en: "$3.75 Million", fa: "۳٫۷۵ میلیون دلار" },
    location: { en: "Los Angeles, California, USA", fa: "لس‌آنجلس، کالیفرنیا، آمریکا" },
    beds: 4,
    baths: 4,
    sqft: 3700,
    featured: false,
    image: "photo-1600566753086-00f18fb6b3ea",
    gallery: ["photo-1600566753086-00f18fb6b3ea", "photo-1600607687939-ce8a6c25118c", "photo-1600607687644-c7171b42498f"],
    desc: {
      en: "A refined hillside hideaway pairing modern architecture with privacy, natural textures, and inviting spaces for entertaining and unwinding.",
      fa: "خلوتگاهی پالوده در دامنه‌ی تپه که معماری مدرن را با حریم خصوصی، بافت‌های طبیعی و فضاهایی دلپذیر برای پذیرایی و آسایش می‌آمیزد."
    },
    features: {
      en: ["Hillside views", "Private deck", "Landscaped grounds", "Media room", "Natural stone", "Gated entry"],
      fa: ["چشم‌انداز تپه", "تراس اختصاصی", "محوطه‌ی طراحی‌شده", "اتاق رسانه", "سنگ طبیعی", "ورودی کنترل‌شده"]
    }
  },
  {
    id: 6,
    name: "Palm Garden Residence",
    city: "Beverly Hills",
    type: "Residence",
    price: 6400000,
    priceLabel: { en: "$6.4 Million", fa: "۶٫۴ میلیون دلار" },
    location: { en: "Beverly Hills, California, USA", fa: "بورلی هیلز، کالیفرنیا، آمریکا" },
    beds: 6,
    baths: 6,
    sqft: 6200,
    featured: false,
    image: "photo-1600566753190-17f0baa2a6c3",
    gallery: ["photo-1600566753190-17f0baa2a6c3", "photo-1600607687920-4e2a09cf159d", "photo-1600607687939-ce8a6c25118c"],
    desc: {
      en: "A gracious private residence surrounded by mature palms and lush gardens, with generous proportions and a calm, contemporary finish throughout.",
      fa: "اقامتگاهی خصوصی و باشکوه در میان نخل‌های کهن و باغ‌های سرسبز، با ابعادی سخاوتمندانه و پایانی آرام و مدرن در سراسر خانه."
    },
    features: {
      en: ["Palm garden", "Pool and spa", "Guest quarters", "Library", "Wine room", "Gated driveway"],
      fa: ["باغ نخل", "استخر و اسپا", "اتاق مهمان", "کتابخانه", "اتاق شراب", "ورودی اختصاصی"]
    }
  },
  {
    id: 7,
    name: "Contemporary Lake House",
    city: "Lake Tahoe",
    type: "House",
    price: 2950000,
    priceLabel: { en: "$2.95 Million", fa: "۲٫۹۵ میلیون دلار" },
    location: { en: "Lake Tahoe, Nevada, USA", fa: "دریاچه تاهو، نوادا، آمریکا" },
    beds: 4,
    baths: 3,
    sqft: 3320,
    featured: false,
    image: "photo-1600607687939-ce8a6c25118c",
    gallery: ["photo-1600607687939-ce8a6c25118c", "photo-1600566753086-00f18fb6b3ea", "photo-1600607687644-c7171b42498f"],
    desc: {
      en: "A warm contemporary home that brings the outdoors in, combining natural finishes, large windows, and relaxed spaces made for every season.",
      fa: "خانه‌ای گرم و مدرن که بیرون را به درون می‌آورد؛ ترکیبی از متریال طبیعی، پنجره‌های بزرگ و فضاهایی آرام برای هر فصل."
    },
    features: {
      en: ["Lake access", "Wood detailing", "Fireplace", "Deck", "Mudroom", "Mountain views"],
      fa: ["دسترسی به دریاچه", "جزئیات چوبی", "شومینه", "عرشه", "ورودی کاربردی", "چشم‌انداز کوه"]
    }
  },
  {
    id: 8,
    name: "Architectural Downtown Penthouse",
    city: "Austin",
    type: "Penthouse",
    price: 1850000,
    priceLabel: { en: "$1.85 Million", fa: "۱٫۸۵ میلیون دلار" },
    location: { en: "Austin, Texas, USA", fa: "آستین، تگزاس، آمریکا" },
    beds: 3,
    baths: 3,
    sqft: 2450,
    featured: false,
    image: "photo-1600607687920-4e2a09cf159d",
    gallery: ["photo-1600607687920-4e2a09cf159d", "photo-1600566753086-00f18fb6b3ea", "photo-1600607687939-ce8a6c25118c"],
    desc: {
      en: "A sophisticated urban penthouse with an airy layout, curated finishes, and private outdoor space close to Austin's dining, culture, and city life.",
      fa: "پنت‌هاوسی شهری و پالوده با پلانی باز، جزئیات دقیق و فضای بیرونی اختصاصی، نزدیک به رستوران‌ها و فرهنگ و زندگی شهر آستین."
    },
    features: {
      en: ["Private terrace", "City views", "Concierge", "Floor-to-ceiling windows", "Secure parking", "Designer kitchen"],
      fa: ["تراس اختصاصی", "چشم‌انداز شهر", "خدمات کانیرژ", "پنجره‌های تا سقف", "پارکینگ امن", "آشپزخانه‌ی طراحی‌شده"]
    }
  }
];
