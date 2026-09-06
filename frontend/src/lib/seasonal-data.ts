export interface SeasonalGoodie {
  name: string;
  tag: string;
  description: string;
  category: 'Cuisine' | 'Artisan' | 'Tradition' | 'Music';
}

export interface SeasonalFestival {
  id: string;
  name: string;
  badge: string;
  seasonLabel: string;
  description: string;
  highlightedCities: string[];
  bannerImage: string;
  tagline: string;
  goodies: SeasonalGoodie[];
  highlights: {
    title: string;
    location: string;
    timing: string;
    vibe: string;
  }[];
}

export interface TimeSlotRecommendation {
  id: 'dawn' | 'afternoon' | 'golden_hour' | 'night';
  title: string;
  statusBadge: string;
  timeWindow: string;
  recommendation: string;
  idealFor: string[];
  bgTint: string;
  borderColor: string;
}

export const SEASONAL_FESTIVALS: SeasonalFestival[] = [
  {
    id: 'ganpati',
    name: 'Ganeshotsav & Historic Mandals',
    badge: 'Bhadrapada Festive Season',
    seasonLabel: 'Ganesh Utsav',
    description:
      'Experience Maharashtra’s grandest spiritual and cultural spectacle. Midnight pandal darshans, rhythmic Dhol-Tasha reverberations, and artisan idol lineages that have flourished for over a century.',
    highlightedCities: ['Mumbai', 'Thane', 'Girgaon', 'Lalbaug'],
    bannerImage:
      'https://images.unsplash.com/photo-1567591414240-e256f11244d0?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Centuries of devotion, brass cymbals & grand pandal architecture',
    goodies: [
      {
        name: 'Ukadiche Modak',
        tag: 'Steamed delicacy',
        description: 'Hand-steamed rice flour dumplings stuffed with grated fresh coconut, fragrant cardamom, and warm organic jaggery.',
        category: 'Cuisine',
      },
      {
        name: 'Heirloom Puran Poli & Toop',
        tag: 'Sweet flatbread',
        description: 'Delicate hand-rolled flatbread filled with sweet chana dal infused with nutmeg, drenched in warm clarified ghee.',
        category: 'Cuisine',
      },
      {
        name: 'Natural Shadu Clay Murtis',
        tag: 'Artisan craft',
        description: 'Eco-friendly Ganesh idols handcrafted with riverbed silt by generational sculptors in Girgaon and Pen workshops.',
        category: 'Artisan',
      },
      {
        name: 'Dhol-Tasha Brass Taals',
        tag: 'Acoustic pulse',
        description: 'Reverberating rhythmic drum pathaks featuring authentic brass cymbals and hand-stretched leather percussion.',
        category: 'Music',
      },
    ],
    highlights: [
      {
        title: 'Lalbaugcha Raja (King of Lalbaug)',
        location: 'Lalbaug, Central Mumbai',
        timing: '24 Hours Darshan (Midnight is best for atmosphere)',
        vibe: 'Iconic, majestic & electric crowd energy',
      },
      {
        title: 'Mumbaicha Raja (Ganesh Galli)',
        location: 'Ganesh Galli, Lalbaug',
        timing: '6:00 AM – 1:00 AM',
        vibe: 'Pioneering thematic pandal replicas of ancient Indian temples',
      },
      {
        title: 'GSB Seva Mandal (Gold Ganpati)',
        location: 'King’s Circle / Sion, Mumbai',
        timing: '6:00 AM – 11:00 PM',
        vibe: 'Adorned in over 60kg of pure gold; traditional Vedic chanting',
      },
      {
        title: 'Upvan & Talao Pali Dhol-Tasha Walks',
        location: 'Thane West',
        timing: '7:00 PM – 11:30 PM',
        vibe: 'Lakefront dhol-tasha pathaks practicing under ancient banyan canopies',
      },
    ],
  },
  {
    id: 'garba',
    name: 'Navratri Dandiya & Garba Nights',
    badge: 'Sharad Autumn Nights',
    seasonLabel: 'Navratri Nights',
    description:
      'Nine nights of swirling Chaniya-Cholis, synchronized wooden dandiya beats, live Gujarati and folk orchestral musicians, and late-night culinary strolls.',
    highlightedCities: ['Mumbai', 'Thane', 'Navi Mumbai'],
    bannerImage:
      'https://images.unsplash.com/photo-1603575448878-868a20723f5d?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Swirling mirror-work skirts, rhythmic claps & open-air midnight dancing',
    goodies: [
      {
        name: 'Midnight Fafda-Jalebi & Methi Gota',
        tag: 'Midnight culinary trail',
        description: 'Fresh crispy besan crisps paired with sweet golden jalebis and spicy raw papaya sambharo in Ghatkopar & Borivali.',
        category: 'Cuisine',
      },
      {
        name: 'Hand-Carved Wooden Dandiyas',
        tag: 'Artisan accessory',
        description: 'Balanced rosewood and sheesham sticks with embedded brass chime bells and bandhani silk wraps.',
        category: 'Artisan',
      },
      {
        name: 'Kutchi Mirror-Work Kediyas',
        tag: 'Traditional attire',
        description: 'Hand-embroidered festive tunics and swirling skirts adorned with authentic glass mirror inlays and thread tassels.',
        category: 'Tradition',
      },
      {
        name: 'Spiced Saffron Masala Milk',
        tag: 'Warm brew',
        description: 'Simmered full-cream buffalo milk infused with saffron stigmas, crushed pistachios, almonds, and nutmeg.',
        category: 'Cuisine',
      },
    ],
    highlights: [
      {
        title: 'Dome SVP Stadium Indoor Arena',
        location: 'Worli, South Mumbai',
        timing: '7:30 PM – 2:00 AM',
        vibe: 'Air-conditioned stadium grandeur with celebrity folk vocalists',
      },
      {
        title: 'Kora Kendra Heritage Grounds',
        location: 'Borivali West, Mumbai',
        timing: '7:00 PM – Midnight',
        vibe: 'Legendary multi-decade traditional open-sky garba with 20,000+ dancers',
      },
      {
        title: 'Ghodbunder Foothill Garba Arenas',
        location: 'Thane',
        timing: '8:00 PM – 1:00 AM',
        vibe: 'High-energy fusion beats with midnight Gujarati snack lanes',
      },
    ],
  },
  {
    id: 'diwali',
    name: 'Diwali Deepotsav & Kandil Trails',
    badge: 'Kartika Illumination',
    seasonLabel: 'Diwali Celebrations',
    description:
      'Maharashtra bathed in terracotta oil lamps, towering handcrafted sky lanterns (Akash Kandils), and the mesmerizing aroma of festive Faral sweets.',
    highlightedCities: ['Mumbai', 'Thane', 'Dadar', 'Girgaon'],
    bannerImage:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Thousands of oil lamps, heritage Kandils & dawn classical music sabhas',
    goodies: [
      {
        name: 'Fresh Maharashtrian Faral Box',
        tag: 'Festive treats',
        description: 'Crisp spiral Chaklis, sweet layered Shankarpali, grated coconut Karanjis, and roasted poha Chivda.',
        category: 'Cuisine',
      },
      {
        name: 'Hand-Stitched Silk Akash Kandils',
        tag: 'Illumination craft',
        description: 'Towering octagonal and lotus lanterns crafted from paper, bamboo splints, and raw silk in Dadar Kandil Galli.',
        category: 'Artisan',
      },
      {
        name: 'Terracotta Diyas from Kumbharwada',
        tag: 'Hand-thrown pottery',
        description: 'Earthen clay oil lamps wheel-turned by generational potters in Dharavi and Thane craft clusters.',
        category: 'Artisan',
      },
      {
        name: 'Dawn Diwali Pahat Ragas',
        tag: 'Classical morning',
        description: 'Open-air morning classical Indian ragas performed at dawn amidst marigold garlands and scented incense.',
        category: 'Music',
      },
    ],
    highlights: [
      {
        title: 'Shivaji Park & Mahim Kandil Gali',
        location: 'Dadar West, Mumbai',
        timing: '5:00 PM – 11:00 PM',
        vibe: 'Hundreds of handcrafted paper and silk lanterns glowing across tree branches',
      },
      {
        title: 'Dadar Flower Market Dawn Fragrance Walk',
        location: 'Dadar Station Bridge',
        timing: '4:00 AM – 7:30 AM',
        vibe: 'Tons of marigold garlands, lotus blossoms & festive morning hustle',
      },
      {
        title: 'Marine Drive Deepotsav Promenade',
        location: 'Queen’s Necklace, South Mumbai',
        timing: '7:00 PM – 11:30 PM',
        vibe: 'The entire curved sea bay glittering under fireworks and lamp light',
      },
    ],
  },
  {
    id: 'holi',
    name: 'Rangotsav & Dhulivandan Celebrations',
    badge: 'Spring Equinox',
    seasonLabel: 'Holi & Rangotsav',
    description:
      'Welcoming spring with aromatic herbal gulal, dhol beats, cold thandai infused with saffron and pistachios, and community color showers.',
    highlightedCities: ['Mumbai', 'Powai', 'Alibaug Coast'],
    bannerImage:
      'https://images.unsplash.com/photo-1561489413-985b06da5bee?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Herbal gulal dust clouds, dhol drums & fragrant saffron thandai',
    goodies: [
      {
        name: 'Kesariya Badam Thandai',
        tag: 'Chilled royal brew',
        description: 'Slow-ground fennel, black pepper, cardamom, watermelon seeds, and almonds steeped in chilled saffron milk.',
        category: 'Cuisine',
      },
      {
        name: 'Organic Palash Flower Gulal',
        tag: 'Natural botanical colors',
        description: 'Aromatic herbal powders extracted from sun-dried flame-of-the-forest (Palash) petals and turmeric.',
        category: 'Tradition',
      },
      {
        name: 'Coastal Narali Bhat & Gujiya',
        tag: 'Sweet heritage fare',
        description: 'Aromatic basmati rice cooked with freshly scraped coconut and jaggery, scented with cloves and roasted cashews.',
        category: 'Cuisine',
      },
      {
        name: 'Nagara & Folk Dhol Circles',
        tag: 'Percussion ensemble',
        description: 'Spirited village rhythms on twin nagaras and bass drums welcoming the first colors of spring.',
        category: 'Music',
      },
    ],
    highlights: [
      {
        title: 'Girgaon Chowpatty Color Gathering',
        location: 'Girgaon Beach, Mumbai',
        timing: '9:00 AM – 1:30 PM',
        vibe: 'Beachside color celebrations with the sea breeze and drum pathaks',
      },
      {
        title: 'Powai Lakefront Organic Spring Gala',
        location: 'Hiranandani Gardens, Powai',
        timing: '10:00 AM – 3:00 PM',
        vibe: 'Eco-friendly flower petal Holi with live classical fusion bands',
      },
    ],
  },
];

export function getCurrentTimeSlot(): TimeSlotRecommendation {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 11) {
    return {
      id: 'dawn',
      title: 'Dawn & Morning Mist',
      statusBadge: 'Best Experienced Right Now',
      timeWindow: '05:00 – 11:00',
      recommendation:
        'Cool ocean breeze, dawn flower markets & tranquil heritage temples before the midday heat.',
      idealFor: ['Dadar Flower Market', 'Marine Drive Walk', 'Sassoon Docks', 'Yeoor Hills Trail'],
      bgTint: 'bg-amber-50/80',
      borderColor: 'border-amber-300',
    };
  }

  if (hour >= 11 && hour < 16) {
    return {
      id: 'afternoon',
      title: 'Artisanal Ateliers & Indoor Heritage',
      statusBadge: 'Midday Shelter',
      timeWindow: '11:00 – 16:00',
      recommendation:
        'Step inside sheltered artisan workshops, private museums, and tranquil heritage Irani cafes.',
      idealFor: ['Kala Ghoda Art Galleries', 'Pottery Workshops', 'Textile Looms', 'Art Deco Cafes'],
      bgTint: 'bg-emerald-50/80',
      borderColor: 'border-emerald-300',
    };
  }

  if (hour >= 16 && hour < 19) {
    return {
      id: 'golden_hour',
      title: 'Golden Hour Approaching',
      statusBadge: 'Peak Atmospheric Light',
      timeWindow: '16:00 – 19:00',
      recommendation:
        'Warm gilded light casting across Victorian stone facades and sea promenades. Perfect for photography and waterfront strolls.',
      idealFor: ['Bandra Fort Sunset', 'Marine Drive Promenade', 'Worli Sea Face', 'Upvan Lake Sunset'],
      bgTint: 'bg-amber-100/70',
      borderColor: 'border-[#C4A265]',
    };
  }

  return {
    id: 'night',
    title: 'Moonlit Trails & Nocturnal Flavors',
    statusBadge: 'Nocturnal Exploration',
    timeWindow: '19:00 – 05:00',
    recommendation:
      'The city takes a deep breath. Street-side kebabs, illuminated architecture, and midnight jazz.',
    idealFor: ['Mohammed Ali Road Strolls', 'Illuminated CST Walk', 'Late Night Irani Chai', 'Marine Drive Stargazing'],
    bgTint: 'bg-sky-50/80',
    borderColor: 'border-sky-300',
  };
}
