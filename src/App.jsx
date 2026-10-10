import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Plane, Utensils, ShoppingBag, 
  FileText, Plus, Trash2, ChevronDown, ChevronUp, Bookmark, Clock, Compass, Sun, Palmtree, CloudSun, Waves, Hotel
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix für Standard-Marker-Icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const initialItinerary = [
  { id: 1, date: "Do, 13.05.2027", region: "Flug", isFlight: true, isHawaii: true, morning: "Flug DE 2096: FRA 11:55 Uhr ✈️ 14:40 Uhr SFO (San Francisco)", evening: "Flug AS 861: SFO 19:55 Uhr ✈️ 22:45 Uhr HNL (Honolulu)", hotel: "Ramada Plaza by Wyndham Waikiki", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 2, date: "Fr, 14.05.2027", region: "Oahu (Honolulu)", isHawaii: true, morning: "Freizeit in Honolulu (z. B. Waikiki Beach)", evening: "Entspannung nach dem Langstreckenflug", hotel: "Ramada Plaza by Wyndham Waikiki", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 3, date: "Sa, 15.05.2027", region: "Oahu (Honolulu)", isHawaii: true, morning: "Erkundung von Oahu auf eigene Faust", evening: "Freizeit auf der Hauptinsel", hotel: "Ramada Plaza by Wyndham Waikiki", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 4, date: "So, 16.05.2027", region: "Oahu (Honolulu)", isHawaii: true, morning: "Ausflug oder Strandtag auf Oahu", evening: "Abendstimmung in Honolulu genießen", hotel: "Ramada Plaza by Wyndham Waikiki", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 5, date: "Mo, 17.05.2027", region: "Maui (Kahului)", isFlight: true, isHawaii: true, morning: "Inselwechsel: Flug von Honolulu (HNL) nach Kahului (OGG), Maui", evening: "Mietwagenübernahme & Hotel-Check-in auf Maui", hotel: "Maui Seaside Hotel", checkOutPrev: "Ramada Plaza (bis 11:00 Uhr)", checkIn: "ab 16:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 6, date: "Di, 18.05.2027", region: "Maui", isHawaii: true, morning: "Erkundung von Maui (z. B. Road to Hana oder Strände)", evening: "Gemütlicher Abend auf Maui", hotel: "Maui Seaside Hotel", checkIn: "ab 16:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 7, date: "Mi, 19.05.2027", region: "Maui", isHawaii: true, morning: "Freizeit auf Maui / Aktivität nach Wahl", evening: "Entspannung im Resort / Ort", hotel: "Maui Seaside Hotel", checkIn: "ab 16:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 8, date: "Do, 20.05.2027", region: "Maui", isHawaii: true, morning: "Weiterer Tag für Highlight-Spots auf Maui", evening: "Sonnenuntergang genießen", hotel: "Maui Seaside Hotel", checkIn: "ab 16:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 9, date: "Fr, 21.05.2027", region: "Big Island (Kona)", isFlight: true, isHawaii: true, morning: "Inselwechsel: Flug von Kahului (OGG) nach Kona (KOA), Big Island", evening: "Ankunft, Mietwagen & Hotel-Check-in in Kona", hotel: "Holiday Inn Express & Suites Kailua-Kona", checkOutPrev: "Maui Seaside (bis 11:00 Uhr)", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 10, date: "Sa, 22.05.2027", region: "Big Island", isHawaii: true, morning: "Erkundung der Vulkaninsel (z. B. Kona Coast / Hawaii Volcanoes NP)", evening: "Abend in Kona", hotel: "Holiday Inn Express & Suites Kailua-Kona", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 11, date: "So, 23.05.2027", region: "Big Island", isHawaii: true, morning: "Freizeit oder Ausflug auf Big Island", evening: "Entspannter Ausklang", hotel: "Holiday Inn Express & Suites Kailua-Kona", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 12, date: "Mo, 24.05.2027", region: "Flug", isFlight: true, isHawaii: true, morning: "Letzter Tag auf Big Island / Abreisevorbereitung", evening: "Flug AA 664: KOA 21:55 Uhr ✈️ 06:47 Uhr PHX (Phoenix, Ankunft 25.05.)", hotel: "Nachtflug nach Phoenix", checkOut: "Holiday Inn Kona (bis 11:00 Uhr)" },
  { id: 13, date: "Di, 25.05.2027", region: "Phoenix (Arizona)", isFlight: true, isHawaii: false, morning: "Ankunft in Phoenix (PHX) um 06:47 Uhr morgens", evening: "Transfer, Hotel-Check-in & Entspannung", hotel: "Holiday Inn Express & Suites Phoenix West - Tolleson", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 14, date: "Mi, 26.05.2027", region: "Phoenix", isHawaii: false, morning: "Erkundung von Phoenix / Scottsdale", evening: "Abendessen & Freizeit in Phoenix", hotel: "Holiday Inn Express & Suites Phoenix West - Tolleson", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 15, date: "Do, 27.05.2027", region: "Phoenix", isHawaii: false, morning: "Tagesausflug (z. B. Sedona oder Outlets)", evening: "Abendstimmung in Arizona", hotel: "Holiday Inn Express & Suites Phoenix West - Tolleson", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 16, date: "Fr, 28.05.2027", region: "Phoenix", isHawaii: false, morning: "Shopping & Sightseeing in Phoenix", evening: "Entspannung am Abend", hotel: "Holiday Inn Express & Suites Phoenix West - Tolleson", checkIn: "ab 15:00 Uhr", checkOut: "bis 11:00 Uhr" },
  { id: 17, date: "Sa, 29.05.2027", region: "Rancho Cucamonga (CA)", isFlight: true, isHawaii: false, morning: "Fahrt / Weiterreise nach Rancho Cucamonga, Kalifornien", evening: "Check-in & Entspannung", hotel: "Best Western Plus Heritage Inn Ontario Rancho Cucamonga", checkOutPrev: "Holiday Inn Phoenix (bis 11:00 Uhr)", checkIn: "ab 15:00 Uhr", checkOut: "bis 12:00 Uhr" },
  { id: 18, date: "So, 30.05.2027", region: "Rancho Cucamonga", isHawaii: false, morning: "Sightseeing im LA-Großraum (z. B. Hollywood / Santa Monica)", evening: "Rückkehr nach Rancho Cucamonga", hotel: "Best Western Plus Heritage Inn Ontario Rancho Cucamonga", checkIn: "ab 15:00 Uhr", checkOut: "bis 12:00 Uhr" },
  { id: 19, date: "Mo, 31.05.2027", region: "Rancho Cucamonga", isHawaii: false, morning: "Freizeit / Shopping in Ontario / Rancho Cucamonga", evening: "Rückkehr nach Rancho Cucamonga", hotel: "Best Western Plus Heritage Inn Ontario Rancho Cucamonga", checkIn: "ab 15:00 Uhr", checkOut: "bis 12:00 Uhr" },
  { id: 20, date: "Di, 01.06.2027", region: "Rancho Cucamonga", isHawaii: false, morning: "Ausflug in die Umgebung oder Entspannung", evening: "Ausklang des Tages", hotel: "Best Western Plus Heritage Inn Ontario Rancho Cucamonga", checkIn: "ab 15:00 Uhr", checkOut: "bis 12:00 Uhr" },
  { id: 21, date: "Mi, 02.06.2027", region: "Rancho Cucamonga", isHawaii: false, morning: "Letzter Tag in Kalifornien / Koffer packen", evening: "Abend in Rancho Cucamonga", hotel: "Best Western Plus Heritage Inn Ontario Rancho Cucamonga", checkIn: "ab 15:00 Uhr", checkOut: "bis 12:00 Uhr" },
  { id: 22, date: "Do, 03.06.2027", region: "Flug", isFlight: true, isHawaii: false, morning: "Fahrt zum Flughafen LAX / Flug AS 1403: LAX 13:29 Uhr ✈️ 14:55 Uhr SFO", evening: "Flug DE 2097: SFO 16:40 Uhr ✈️ Richtung Frankfurt", hotel: "Rückflug nach FRA", checkOutPrev: "Best Western Rancho (bis 12:00 Uhr)" },
  { id: 23, date: "Fr, 04.06.2027", region: "Frankfurt (Ankunft)", isFlight: true, isHawaii: false, morning: "Ankunft am Flughafen Frankfurt (FRA) um 12:45 Uhr", evening: "Heimreise & Urlaubsabschluss", hotel: "Zuhause" }
];

const regionCoords = {
  'Alle': { lat: 50.1109, lon: 8.6821, waterTemp: null },
  'Oahu (Honolulu)': { lat: 21.3069, lon: -157.8583, waterTemp: "26°C" },
  'Maui (Kahului)': { lat: 20.8893, lon: -156.4729, waterTemp: "26°C" },
  'Maui': { lat: 20.7984, lon: -156.3319, waterTemp: "26°C" },
  'Big Island (Kona)': { lat: 19.64, lon: -155.9969, waterTemp: "26°C" },
  'Big Island': { lat: 19.5429, lon: -155.6659, waterTemp: "26°C" },
  'Phoenix (Arizona)': { lat: 33.4484, lon: -112.0740, waterTemp: null },
  'Phoenix': { lat: 33.4484, lon: -112.0740, waterTemp: null },
  'Rancho Cucamonga (CA)': { lat: 34.1064, lon: -117.5931, waterTemp: null },
  'Rancho Cucamonga': { lat: 34.1064, lon: -117.5931, waterTemp: null },
  'Flug': { lat: 34.0522, lon: -118.2437, waterTemp: null },
  'Frankfurt (Ankunft)': { lat: 50.1109, lon: 8.6821, waterTemp: null }
};

const mapPins = [
  { name: "Oahu (Honolulu)", lat: 21.3069, lon: -157.8583, desc: "Ramada Plaza Waikiki (13.–17. Mai)" },
  { name: "Maui (Kahului)", lat: 20.8893, lon: -156.4729, desc: "Maui Seaside Hotel (17.–21. Mai)" },
  { name: "Big Island (Kona)", lat: 19.6400, lon: -155.9969, desc: "Holiday Inn Express Kona (21.–24. Mai)" },
  { name: "Phoenix (AZ)", lat: 33.4484, lon: -112.0740, desc: "Holiday Inn Express Phoenix West (25.–29. Mai)" },
  { name: "Rancho Cucamonga (CA)", lat: 34.1064, lon: -117.5931, desc: "Best Western Plus (29. Mai – 03. Juni)" }
];

const regionVisuals = {
  'Alle': { title: "Gesamte USA & Hawaii Reise", bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" },
  'Oahu (Honolulu)': { title: "Oahu – Waikiki & Pearl Harbor", bg: "https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=1200&q=80" },
  'Maui (Kahului)': { title: "Maui – Road to Hana & Strände", bg: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=1200&q=80" },
  'Maui': { title: "Maui – Natur & Sonnenuntergänge", bg: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=1200&q=80" },
  'Big Island (Kona)': { title: "Big Island – Vulkanlandschaften & Kona", bg: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80" },
  'Big Island': { title: "Big Island – Abenteuer & Küste", bg: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80" },
  'Phoenix (Arizona)': { title: "Phoenix – Wüstenzauber & Canyons", bg: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80" },
  'Phoenix': { title: "Phoenix & Umgebung", bg: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80" },
  'Rancho Cucamonga (CA)': { title: "Rancho Cucamonga – Sonne in Kalifornien", bg: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80" },
  'Rancho Cucamonga': { title: "Rancho Cucamonga", bg: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80" },
  'Flug': { title: "Flug & Weiterreise", bg: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80" },
  'Frankfurt (Ankunft)': { title: "Ankunft in Deutschland", bg: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80" }
};

const defaultOahuFood = [
  "Black Angus Steakhouse - Pearl City (So–Do 11:15 – 20:45 | Fr–Sa 11:15 – 21:45 Uhr)",
  "Raising Cane’s Chicken Fingers (Täglich 10:00 – 23:00 Uhr)",
  "Jack in the Box (24 Std. geöffnet / Drive-Thru)",
  "Kahuku Food Trucks - North Shore (Täglich ca. 10:00 – 18:00 Uhr)",
  "Sabrozon Mexican Food Truck (Täglich 11:15 – 19:45 Uhr)",
  "Giovanni's Shrimp Truck (North Shore - Knoblauch-Garnelen ~16$)",
  "Rainbow Drive-In (Loco Moco & BBQ Chicken ~11-13$)",
  "Highway Inn - Kaka'ako (Kalua Pig Teller ~15$)",
  "Leonard's Bakery (Malasadas Donuts ~2$)",
  "Matsumoto Shave Ice - Haleiwa (~4$)"
];

const defaultOahuShopping = [
  "Ala Moana Center (Riesiges Freiluft-Einkaufszentrum)",
  "Waikele Premium Outlets (Outlet-Shopping vor den Toren Honolulus)",
  "ABC Stores (An jeder Ecke für Snacks, Souvenirs & Musubi)"
];

const defaultMauiFood = [
  "Paia Fish Market (Günstige Burger & frischer Fisch ~14-18$)",
  "Foodland Supermarkt (Frische Pokē-Bowls an der Frischetheke)",
  "Leoda's Kitchen and Pie Shop (Süße & herzhafte Pies)"
];

const defaultMauiShopping = [
  "3x Ross Dress for Less (Täglich 08:00 – 22:30 Uhr)",
  "⚠️ Achtung: Kein Marshalls auf Maui!",
  "T.J. Maxx - Kahului (Mo–Sa 09:30 – 21:30 | So 10:00 – 20:00 Uhr)",
  "Walmart (Täglich 06:00 – 23:00 Uhr)",
  "Target (Täglich 07:00 – 22:00 Uhr)",
  "Maui Mall Village (Täglich 07:00 – 21:00 Uhr)",
  "Queen Ka'ahumanu Center (Täglich 10:00 – 20:00 Uhr)",
  "The Shops at Wailea - incl. Louis Vuitton (Täglich 10:00 – 21:00 Uhr)",
  "Whalers Village - incl. Louis Vuitton (Täglich 09:00 – 21:00 Uhr)"
];

const defaultMauiMisc = [
  "Road to Hāna (hin & zurück ~115 Mi. / 4,5 Std. Reine Fahrzeit + Stopps -> 1 ganzen Tag einplanen!)",
  "Hāna Lava Tube (Ka'eleku Caverns - Vulkanhöhle bei Hāna)",
  "Waiʻānapanapa State Park (Schwarzer Strand - Slot 30 Tage vorher buchen!)",
  "Haleakalā Vulkan Gipfel (Sonnenuntergang - Warme Jacken mitnehmen!)"
];

const defaultBigIslandFood = [
  "Kona Brewing Co. (Leckere Pizza & lokales Craft Beer)",
  "Da Poke Shack (Kona - Beste Pokē-Bowls der Insel)",
  "Tex Drive In (Honokaa - Bekannt für heiße Malasadas)"
];

const defaultBigIslandShopping = [
  "KTA Super Stores (Täglich 06:00 – 21:00/22:00 Uhr)",
  "Safeway - Kona/Hilo (24 Std. geöffnet)",
  "Foodland (Täglich 06:00 – 21:00 Uhr)",
  "Island Naturals Market & Deli (Täglich 08:00 – 19:00 Uhr)"
];

const defaultPhoenixShopping = [
  "Arizona Mills Mall (Tempe - Riesige klimatisierte Mall)",
  "Phoenix Premium Outlets (Chandler - Memorial Day Sales!)",
  "Outlets at Anthem (Nördlich von Phoenix)",
  "Old Town Scottsdale (Boutiquen & Souvenirs im Wildwest-Stil)"
];

const defaultPhoenixFood = [
  "Chipotle Mexican Grill (Große Burritos & Bowls)",
  "In-N-Out Burger (Klassische Wüsten-Filiale)",
  "Mexikanische Grills in Old Town Scottsdale"
];

const defaultRanchoShopping = [
  "Victoria Gardens (Riesige Outdoor-Mall in Rancho Cucamonga)",
  "Ontario Mills Outlet (Sehr nah & riesiges Outlet-Zentrum)",
  "Citadel Outlets (Auf dem Weg nach LA für Extended Sales)"
];

const defaultRanchoFood = [
  "In-N-Out Burger (Günstige Burger & Grilled Cheese ~4$)",
  "Lokale Taquerias & Restaurants in Rancho Cucamonga",
  "Farmers Market at The Grove (Bei Ausflügen nach LA)"
];

export default function App() {
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedRegion, setSelectedRegion] = useState('Alle');
  const [expandedDay, setExpandedDay] = useState(null);
  const [isRegionNotesExpanded, setIsRegionNotesExpanded] = useState(true);

  // Weather State
  const [weather, setWeather] = useState({ temp: null, loading: true });

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const targetDate = new Date('2027-05-13T06:00:00');
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        setTimeLeft({ days, hours, minutes });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Weather Data from Open-Meteo API
  useEffect(() => {
    const coords = regionCoords[selectedRegion] || regionCoords['Alle'];
    setWeather({ temp: null, loading: true });

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`)
      .then(res => res.json())
      .then(data => {
        if (data && data.current_weather) {
          setWeather({ temp: Math.round(data.current_weather.temperature), loading: false });
        } else {
          setWeather({ temp: '--', loading: false });
        }
      })
      .catch(() => setWeather({ temp: '--', loading: false }));
  }, [selectedRegion]);

  // LocalStorage state for daily notes
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('usa2027_reminders');
    return saved ? JSON.parse(saved) : {};
  });

  // LocalStorage state for destination/region notes
  const [regionReminders, setRegionReminders] = useState(() => {
    const saved = localStorage.getItem('usa2027_region_reminders');
    const parsed = saved ? JSON.parse(saved) : {};

    if (!parsed["Oahu (Honolulu)"]) {
      parsed["Oahu (Honolulu)"] = { food: defaultOahuFood, shopping: defaultOahuShopping, misc: [] };
    }
    if (!parsed["Maui"]) {
      parsed["Maui"] = { food: defaultMauiFood, shopping: defaultMauiShopping, misc: defaultMauiMisc };
    }
    if (!parsed["Maui (Kahului)"]) {
      parsed["Maui (Kahului)"] = { food: defaultMauiFood, shopping: defaultMauiShopping, misc: defaultMauiMisc };
    }
    if (!parsed["Big Island"]) {
      parsed["Big Island"] = { food: defaultBigIslandFood, shopping: defaultBigIslandShopping, misc: [] };
    }
    if (!parsed["Big Island (Kona)"]) {
      parsed["Big Island (Kona)"] = { food: defaultBigIslandFood, shopping: defaultBigIslandShopping, misc: [] };
    }
    if (!parsed["Phoenix (Arizona)"]) {
      parsed["Phoenix (Arizona)"] = { food: defaultPhoenixFood, shopping: defaultPhoenixShopping, misc: [] };
    }
    if (!parsed["Phoenix"]) {
      parsed["Phoenix"] = { food: defaultPhoenixFood, shopping: defaultPhoenixShopping, misc: [] };
    }
    if (!parsed["Rancho Cucamonga (CA)"]) {
      parsed["Rancho Cucamonga (CA)"] = { food: defaultRanchoFood, shopping: defaultRanchoShopping, misc: [] };
    }
    if (!parsed["Rancho Cucamonga"]) {
      parsed["Rancho Cucamonga"] = { food: defaultRanchoFood, shopping: defaultRanchoShopping, misc: [] };
    }

    return parsed;
  });

  const [inputState, setInputState] = useState({});

  useEffect(() => {
    localStorage.setItem('usa2027_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('usa2027_region_reminders', JSON.stringify(regionReminders));
  }, [regionReminders]);

  const regions = ['Alle', 'Karte', ...new Set(initialItinerary.map(item => item.region))];

  const filteredItinerary = (selectedRegion === 'Alle' || selectedRegion === 'Karte')
    ? initialItinerary 
    : initialItinerary.filter(item => item.region === selectedRegion);

  const toggleExpand = (id) => {
    setExpandedDay(expandedDay === id ? null : id);
  };

  const handleAddNote = (dayId, category) => {
    const text = inputState[`${dayId}-${category}`];
    if (!text || !text.trim()) return;

    setReminders(prev => {
      const dayNotes = prev[dayId] || { food: [], shopping: [], misc: [] };
      return {
        ...prev,
        [dayId]: {
          ...dayNotes,
          [category]: [...(dayNotes[category] || []), text.trim()]
        }
      };
    });

    setInputState(prev => ({ ...prev, [`${dayId}-${category}`]: '' }));
  };

  const handleDeleteNote = (dayId, category, index) => {
    setReminders(prev => {
      const dayNotes = prev[dayId];
      if (!dayNotes) return prev;
      const updatedCat = dayNotes[category].filter((_, i) => i !== index);
      return {
        ...prev,
        [dayId]: {
          ...dayNotes,
          [category]: updatedCat
        }
      };
    });
  };

  const handleAddRegionNote = (regionName, category) => {
    const text = inputState[`reg-${regionName}-${category}`];
    if (!text || !text.trim()) return;

    setRegionReminders(prev => {
      const regNotes = prev[regionName] || { food: [], shopping: [], misc: [] };
      return {
        ...prev,
        [regionName]: {
          ...regNotes,
          [category]: [...(regNotes[category] || []), text.trim()]
        }
      };
    });

    setInputState(prev => ({ ...prev, [`reg-${regionName}-${category}`]: '' }));
  };

  const handleDeleteRegionNote = (regionName, category, index) => {
    setRegionReminders(prev => {
      const regNotes = prev[regionName];
      if (!regNotes) return prev;
      const updatedCat = regNotes[category].filter((_, i) => i !== index);
      return {
        ...prev,
        [regionName]: {
          ...regNotes,
          [category]: updatedCat
        }
      };
    });
  };

  const currentRegionNotes = regionReminders[selectedRegion] || { food: [], shopping: [], misc: [] };
  const totalRegionNotes = (currentRegionNotes.food?.length || 0) + (currentRegionNotes.shopping?.length || 0) + (currentRegionNotes.misc?.length || 0);

  const activeVisual = regionVisuals[selectedRegion] || regionVisuals['Alle'];
  const isSelectedHawaii = initialItinerary.find(i => i.region === selectedRegion)?.isHawaii;
  const currentWaterTemp = regionCoords[selectedRegion]?.waterTemp;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans relative overflow-x-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <header className="max-w-4xl mx-auto mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-slate-900/60 backdrop-blur-xl">
        <div 
          className="h-44 sm:h-52 bg-cover bg-center relative transition-all duration-700"
          style={{ backgroundImage: `url(${activeVisual.bg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setActiveTab('plan')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md transition-all ${activeTab === 'plan' ? 'bg-blue-600/90 text-white shadow-lg border border-blue-400/40' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-white/10'}`}
            >
              Reiseplan
            </button>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md transition-all ${activeTab === 'overview' ? 'bg-blue-600/90 text-white shadow-lg border border-blue-400/40' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-white/10'}`}
            >
              Übersicht
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 backdrop-blur-md">
                13. Mai – 04. Juni 2027
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 drop-shadow-md">
                USA & Hawaii 2027
              </h1>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2 shadow-lg">
                <CloudSun className="w-4 h-4 text-sky-400" />
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Luft</p>
                  <p className="text-xs font-bold text-sky-200">
                    {weather.loading ? '...' : `${weather.temp}°C`}
                  </p>
                </div>
              </div>

              {currentWaterTemp && (
                <div className="bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-teal-500/30 flex items-center gap-2 shadow-lg">
                  <Waves className="w-4 h-4 text-teal-300" />
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-teal-300 font-medium">Wasser</p>
                    <p className="text-xs font-bold text-teal-200">{currentWaterTemp}</p>
                  </div>
                </div>
              )}

              <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2.5 shadow-lg">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Countdown</p>
                  <p className="text-xs font-bold text-amber-300">
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {activeTab === 'plan' && (
        <main className="max-w-4xl mx-auto space-y-5">
          {/* Region Filter Bar mit 'Karte' Button */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none bg-slate-900/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
            <Compass className="w-4 h-4 text-blue-400 ml-2 flex-shrink-0" />
            {regions.map(r => {
              const isHaw = initialItinerary.find(i => i.region === r)?.isHawaii;
              const isMap = r === 'Karte';
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedRegion === r 
                      ? (isMap
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/40'
                          : (isHaw 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg border border-teal-400/40' 
                              : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg border border-orange-400/40'))
                      : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-white/5'
                  }`}
                >
                  {isMap && <MapPin className="w-3 h-3 text-blue-300" />}
                  {isHaw && !isMap && <Palmtree className="w-3 h-3 text-teal-300" />}
                  {!isHaw && !isMap && r !== 'Alle' && r !== 'Flug' && r !== 'Frankfurt (Ankunft)' && <Sun className="w-3 h-3 text-amber-400" />}
                  {r}
                </button>
              );
            })}
          </div>

          {/* Interaktive Landkarte, wenn 'Karte' ausgewählt ist */}
          {selectedRegion === 'Karte' && (
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-blue-500/30 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-base">
                  <MapPin className="w-5 h-5" /> Interaktive Routen- & Zielkarte
                </div>
                <span className="text-xs text-slate-400">Klicke auf die Pins für Details</span>
              </div>

              <div className="h-[420px] w-full rounded-xl overflow-hidden border border-white/10 z-0 relative">
                <MapContainer 
                  center={[21.3069, -157.8583]} 
                  zoom={5} 
                  scrollWheelZoom={false} 
                  style={{ height: '100%', width: '100%' }}
                  whenReady={(map) => { setTimeout(() => map.target.invalidateSize(), 100); }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapPins.map((pin, idx) => (
                    <Marker key={idx} position={[pin.lat, pin.lon]}>
                      <Popup>
                        <div className="text-slate-900 font-sans">
                          <strong className="block text-sm font-bold text-blue-600">{pin.name}</strong>
                          <span className="text-xs text-slate-700">{pin.desc}</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          )}

          {/* Region Overview Card (nur wenn nicht 'Karte' gewählt) */}
          {selectedRegion !== 'Karte' && (
            <div className={`rounded-2xl border shadow-xl overflow-hidden backdrop-blur-xl transition-all ${
              isSelectedHawaii 
                ? 'bg-gradient-to-b from-teal-950/40 to-slate-900/60 border-teal-500/30' 
                : 'bg-gradient-to-b from-orange-950/30 to-slate-900/60 border-orange-500/20'
            }`}>
              <button 
                onClick={() => setIsRegionNotesExpanded(!isRegionNotesExpanded)}
                className={`w-full p-4 flex items-center justify-between text-left transition-all ${
                  isSelectedHawaii ? 'bg-teal-900/20 hover:bg-teal-900/30' : 'bg-orange-900/20 hover:bg-orange-900/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${
                    isSelectedHawaii ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                  }`}>
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      Allgemeine Notizen für: 
                      <span className={isSelectedHawaii ? 'text-teal-300 font-extrabold' : 'text-amber-400 font-extrabold'}>
                        {selectedRegion}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isSelectedHawaii ? '🏝️ Hawaii-Insel Tipps' : '🏜️ Festland / USA Tipps'} ({totalRegionNotes} Einträge)
                    </p>
                  </div>
                </div>
                {isRegionNotesExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {isRegionNotesExpanded && (
                <div className="p-4 bg-slate-950/80 border-t border-white/5 space-y-4">
                  {/* Food Category */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <Utensils className="w-3.5 h-3.5" /> Gastro & Restaurant-Tipps für {selectedRegion}
                    </div>
                    <ul className="space-y-1.5">
                      {currentRegionNotes.food?.map((note, i) => (
                        <li key={i} className="flex justify-between items-center text-xs bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                          <span className="text-slate-200">{note}</span>
                          <button onClick={() => handleDeleteRegionNote(selectedRegion, 'food', i)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={`Neuer Restaurant-Tipp für ${selectedRegion}...`}
                        className="flex-1 text-xs bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 text-slate-200 placeholder:text-slate-500"
                        value={inputState[`reg-${selectedRegion}-food`] || ''}
                        onChange={e => setInputState({ ...inputState, [`reg-${selectedRegion}-food`]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleAddRegionNote(selectedRegion, 'food')}
                      />
                      <button onClick={() => handleAddRegionNote(selectedRegion, 'food')} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition-all shadow-md"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Shopping Category */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
                      <ShoppingBag className="w-3.5 h-3.5" /> Shopping & Supermärkte auf {selectedRegion}
                    </div>
                    <ul className="space-y-1.5">
                      {currentRegionNotes.shopping?.map((note, i) => (
                        <li key={i} className="flex justify-between items-center text-xs bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                          <span className="text-slate-200">{note}</span>
                          <button onClick={() => handleDeleteRegionNote(selectedRegion, 'shopping', i)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={`Shopping-Tipp für ${selectedRegion}...`}
                        className="flex-1 text-xs bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 text-slate-200 placeholder:text-slate-500"
                        value={inputState[`reg-${selectedRegion}-shopping`] || ''}
                        onChange={e => setInputState({ ...inputState, [`reg-${selectedRegion}-shopping`]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleAddRegionNote(selectedRegion, 'shopping')}
                      />
                      <button onClick={() => handleDeleteRegionNote(selectedRegion, 'shopping')} className="bg-pink-600 hover:bg-pink-500 text-white p-2 rounded-xl transition-all shadow-md"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Misc Category */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                      <FileText className="w-3.5 h-3.5" /> Sonstiges & Highlights für {selectedRegion}
                    </div>
                    <ul className="space-y-1.5">
                      {currentRegionNotes.misc?.map((note, i) => (
                        <li key={i} className="flex justify-between items-center text-xs bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                          <span className="text-slate-200">{note}</span>
                          <button onClick={() => handleDeleteRegionNote(selectedRegion, 'misc', i)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={`Reminder/Highlight für ${selectedRegion}...`}
                        className="flex-1 text-xs bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 text-slate-200 placeholder:text-slate-500"
                        value={inputState[`reg-${selectedRegion}-misc`] || ''}
                        onChange={e => setInputState({ ...inputState, [`reg-${selectedRegion}-misc`]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleAddRegionNote(selectedRegion, 'misc')}
                      />
                      <button onClick={() => handleAddRegionNote(selectedRegion, 'misc')} className="bg-sky-600 hover:bg-sky-500 text-white p-2 rounded-xl transition-all shadow-md"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Daily Cards (nur wenn nicht 'Karte' gewählt) */}
          {selectedRegion !== 'Karte' && (
            <div className="space-y-4">
              {filteredItinerary.map((item) => {
                const dayNotes = reminders[item.id] || { food: [], shopping: [], misc: [] };
                const isExpanded = expandedDay === item.id;
                const totalNotes = (dayNotes.food?.length || 0) + (dayNotes.shopping?.length || 0) + (dayNotes.misc?.length || 0);

                return (
                  <div key={item.id} className="bg-slate-900/50 rounded-2xl border border-white/10 shadow-lg overflow-hidden backdrop-blur-md transition-all hover:border-white/20">
                    <div className="p-4 sm:p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <h2 className="font-bold text-slate-100 text-base">{item.date}</h2>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md ${
                          item.isFlight 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : (item.isHawaii 
                                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                                : 'bg-orange-500/20 text-orange-300 border border-orange-500/30')
                        }`}>
                          {item.isFlight ? <Plane className="w-3 h-3" /> : (item.isHawaii ? <Palmtree className="w-3 h-3" /> : <MapPin className="w-3 h-3" />)}
                          {item.region}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-xs mb-3">
                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Vormittag</span>
                          <p className="text-slate-300 font-medium leading-relaxed">{item.morning}</p>
                        </div>
                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Nachmittag / Abend</span>
                          <p className="text-slate-300 font-medium leading-relaxed">{item.evening}</p>
                        </div>
                      </div>

                      {item.hotel && (
                        <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-300 font-medium">
                          <div className="flex items-center gap-2">
                            <Hotel className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span><strong>Unterkunft:</strong> {item.hotel}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {item.checkOutPrev && (
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-semibold text-[11px]">
                                🔑 Out: {item.checkOutPrev}
                              </span>
                            )}
                            {item.checkIn && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px]">
                                🔑 Check-in {item.checkIn}
                              </span>
                            )}
                            {item.checkOut && !item.checkOutPrev && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold text-[11px]">
                                🔑 Check-out {item.checkOut}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => toggleExpand(item.id)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-950/40 p-3 rounded-xl border border-white/5 transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <span>Tages-Reminder & Notizen</span>
                          {totalNotes > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                              {totalNotes}
                            </span>
                          )}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="bg-slate-950/90 p-4 border-t border-white/10 space-y-4">
                        {/* Daily Essen Category */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                            <Utensils className="w-3.5 h-3.5" /> Essensvorschläge für {item.date}
                          </div>
                          <ul className="space-y-1.5">
                            {dayNotes.food?.map((note, i) => (
                              <li key={i} className="flex justify-between items-center text-xs bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                                <span className="text-slate-200">{note}</span>
                                <button onClick={() => handleDeleteNote(item.id, 'food', i)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                              </li>
                            ))}
                          </ul>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="z. B. Restaurant, Foodtruck..."
                              className="flex-1 text-xs bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 text-slate-200 placeholder:text-slate-500"
                              value={inputState[`${item.id}-food`] || ''}
                              onChange={e => setInputState({ ...inputState, [`${item.id}-food`]: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && handleAddNote(item.id, 'food')}
                            />
                            <button onClick={() => handleAddNote(item.id, 'food')} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition-all shadow-md"><Plus className="w-4 h-4" /></button>
                          </div>
                        </div>

                        {/* Daily Shopping Category */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
                            <ShoppingBag className="w-3.5 h-3.5" /> Shopping für {item.date}
                          </div>
                          <ul className="space-y-1.5">
                            {dayNotes.shopping?.map((note, i) => (
                              <li key={i} className="flex justify-between items-center text-xs bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                                <span className="text-slate-200">{note}</span>
                                <button onClick={() => handleDeleteNote(item.id, 'shopping', i)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                              </li>
                            ))}
                          </ul>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="z. B. Mall, Souvenirs..."
                              className="flex-1 text-xs bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 text-slate-200 placeholder:text-slate-500"
                              value={inputState[`${item.id}-shopping`] || ''}
                              onChange={e => setInputState({ ...inputState, [`${item.id}-shopping`]: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && handleAddNote(item.id, 'shopping')}
                            />
                            <button onClick={() => handleDeleteNote(item.id, 'shopping')} className="bg-pink-600 hover:bg-pink-500 text-white p-2 rounded-xl transition-all shadow-md"><Plus className="w-4 h-4" /></button>
                          </div>
                        </div>

                        {/* Daily Misc Category */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                            <FileText className="w-3.5 h-3.5" /> Sonstiges für {item.date}
                          </div>
                          <ul className="space-y-1.5">
                            {dayNotes.misc?.map((note, i) => (
                              <li key={i} className="flex justify-between items-center text-xs bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                                <span className="text-slate-200">{note}</span>
                                <button onClick={() => handleDeleteNote(item.id, 'misc', i)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                              </li>
                            ))}
                          </ul>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="z. B. Notizen, Tickets..."
                              className="flex-1 text-xs bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 text-slate-200 placeholder:text-slate-500"
                              value={inputState[`${item.id}-misc`] || ''}
                              onChange={e => setInputState({ ...inputState, [`${item.id}-misc`]: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && handleAddNote(item.id, 'misc')}
                            />
                            <button onClick={() => handleDeleteNote(item.id, 'misc')} className="bg-sky-600 hover:bg-sky-500 text-white p-2 rounded-xl transition-all shadow-md"><Plus className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {activeTab === 'overview' && (
        <main className="max-w-4xl mx-auto bg-slate-900/60 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
          <h2 className="text-xl font-bold text-blue-400">Reiseübersicht & Key-Facts</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/5">
              <h3 className="text-xs font-semibold text-emerald-400 mb-1 uppercase tracking-wider">Gesamtdauer</h3>
              <p className="text-2xl font-black text-slate-100">23 Tage</p>
            </div>
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/5">
              <h3 className="text-xs font-semibold text-amber-400 mb-1 uppercase tracking-wider">Stationen</h3>
              <p className="text-2xl font-black text-slate-100">5 Hauptstationen</p>
            </div>
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/5">
              <h3 className="text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wider">Flüge</h3>
              <p className="text-2xl font-black text-slate-100">6 Flugsegmente</p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-amber-500/20 space-y-3">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Hotel className="w-4 h-4" /> Gebuchte Unterkünfte & Zeiten
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex flex-col sm:flex-row justify-between border-b border-white/5 pb-2 gap-1">
                <span className="font-semibold text-teal-300">13.–17. Mai (Oahu):</span>
                <div className="text-left sm:text-right">
                  <div className="text-slate-100 font-medium">Ramada Plaza by Wyndham Waikiki</div>
                  <div className="text-[11px] text-slate-400">Check-in: ab 15:00 Uhr | Check-out: bis 11:00 Uhr</div>
                </div>
              </li>
              <li className="flex flex-col sm:flex-row justify-between border-b border-white/5 pb-2 gap-1">
                <span className="font-semibold text-teal-300">17.–21. Mai (Maui):</span>
                <div className="text-left sm:text-right">
                  <div className="text-slate-100 font-medium">Maui Seaside Hotel</div>
                  <div className="text-[11px] text-slate-400">Check-in: ab 16:00 Uhr | Check-out: bis 11:00 Uhr</div>
                </div>
              </li>
              <li className="flex flex-col sm:flex-row justify-between border-b border-white/5 pb-2 gap-1">
                <span className="font-semibold text-teal-300">21.–24. Mai (Big Island):</span>
                <div className="text-left sm:text-right">
                  <div className="text-slate-100 font-medium">Holiday Inn Express & Suites Kailua-Kona</div>
                  <div className="text-[11px] text-slate-400">Check-in: ab 15:00 Uhr | Check-out: bis 11:00 Uhr</div>
                </div>
              </li>
              <li className="flex flex-col sm:flex-row justify-between border-b border-white/5 pb-2 gap-1">
                <span className="font-semibold text-orange-300">25.–29. Mai (Phoenix):</span>
                <div className="text-left sm:text-right">
                  <div className="text-slate-100 font-medium">Holiday Inn Express & Suites Phoenix West - Tolleson</div>
                  <div className="text-[11px] text-slate-400">Check-in: ab 15:00 Uhr | Check-out: bis 11:00 Uhr</div>
                </div>
              </li>
              <li className="flex flex-col sm:flex-row justify-between border-b border-white/5 pb-2 gap-1">
                <span className="font-semibold text-orange-300">29. Mai – 03. Jun (Rancho Cucamonga):</span>
                <div className="text-left sm:text-right">
                  <div className="text-slate-100 font-medium">Best Western Plus Heritage Inn Ontario Rancho Cucamonga</div>
                  <div className="text-[11px] text-slate-400">Check-in: ab 15:00 Uhr | Check-out: bis 12:00 Uhr</div>
                </div>
              </li>
              <li className="flex flex-col sm:flex-row justify-between gap-1 pt-1">
                <span className="font-semibold text-orange-300">03. Juni (Los Angeles):</span>
                <span className="text-slate-400">Kein Hotel (Tagesausflüge & Rückflug ab LAX)</span>
              </li>
            </ul>
          </div>
        </main>
      )}
    </div>
  );
}
