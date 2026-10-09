import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  addDoc 
} from './firebase';

const INITIAL_DAYS = [
  { 
    id: "2027-05-13", 
    dateFormatted: "Do, 13.05.2027", 
    location: "Oahu", 
    title: "Flug / Oahu & Hotel Check-in", 
    morning: "Flug von Frankfurt (FRA) nach Honolulu (HNL)", 
    afternoon: "Landung in Honolulu & Check-in im Ramada Plaza by Wyndham Waikiki", 
    hotel: "Ramada Plaza by Wyndham Waikiki (13.05.–17.05.2027)",
    isTravelDay: true, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-14", 
    dateFormatted: "Fr, 14.05.2027", 
    location: "Oahu", 
    title: "Oahu (Honolulu)", 
    morning: "Freizeit in Honolulu (z. B. Waikiki Beach)", 
    afternoon: "Entspannung nach dem Langstreckenflug", 
    hotel: "Ramada Plaza by Wyndham Waikiki",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-15", 
    dateFormatted: "Sa, 15.05.2027", 
    location: "Oahu", 
    title: "Oahu (Honolulu)", 
    morning: "Erkundung von Oahu auf eigene Faust", 
    afternoon: "Freizeit auf der Hauptinsel", 
    hotel: "Ramada Plaza by Wyndham Waikiki",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-16", 
    dateFormatted: "So, 16.05.2027", 
    location: "Oahu", 
    title: "Oahu (Honolulu)", 
    morning: "Letzte Erledigungen in Honolulu", 
    afternoon: "Entspannter Tag zur freien Verfügung", 
    hotel: "Ramada Plaza by Wyndham Waikiki",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-17", 
    dateFormatted: "Mo, 17.05.2027", 
    location: "Maui", 
    title: "Oahu -> Maui & Hotel Check-in", 
    morning: "Flug von Honolulu (HNL) nach Kahului (OGG)", 
    afternoon: "Check-in im Maui Seaside Hotel & Kaanapali Beach", 
    hotel: "Maui Seaside Hotel (17.05.–21.05.2027)",
    isTravelDay: true, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-18", 
    dateFormatted: "Di, 18.05.2027", 
    location: "Maui", 
    title: "Maui", 
    morning: "Start Road to Hana & Wasserfälle", 
    afternoon: "Waianapanapa (Schwarzer Strand) & Pipiwai Trail", 
    hotel: "Maui Seaside Hotel",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-19", 
    dateFormatted: "Mi, 19.05.2027", 
    location: "Maui", 
    title: "Maui", 
    morning: "Panoramafahrt zum Nakalele Blowhole", 
    afternoon: "Paia (Surfer-Städtchen) & Hookipa Beach", 
    hotel: "Maui Seaside Hotel",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-20", 
    dateFormatted: "Do, 20.05.2027", 
    location: "Maui", 
    title: "Maui", 
    morning: "Wailea Beach Path (Klippenweg)", 
    afternoon: "Fahrt ins grüne, kühle Upcountry", 
    hotel: "Maui Seaside Hotel",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-21", 
    dateFormatted: "Fr, 21.05.2027", 
    location: "Big Island", 
    title: "Maui -> Big Island & Hotel Check-in", 
    morning: "Kanaha Beach / Souvenir-Shopping", 
    afternoon: "Flug nach Kona (KOA) & Check-in im Holiday Inn Express & Suites Kailua-Kona", 
    hotel: "Holiday Inn Express & Suites Kailua-Kona (21.05.–24.05.2027)",
    isTravelDay: true, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-22", 
    dateFormatted: "Sa, 22.05.2027", 
    location: "Big Island", 
    title: "Big Island", 
    morning: "Volcanoes National Park (Crater Rim)", 
    afternoon: "Thurston Lava Tube & Chain of Craters Road", 
    hotel: "Holiday Inn Express & Suites Kailua-Kona",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-23", 
    dateFormatted: "So, 23.05.2027", 
    location: "Big Island", 
    title: "Big Island", 
    morning: "Fahrt nach Hilo zu den Rainbow Falls", 
    afternoon: "Akaka Falls State Park (Dschungel-Wasserfall)", 
    hotel: "Holiday Inn Express & Suites Kailua-Kona",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-24", 
    dateFormatted: "Mo, 24.05.2027", 
    location: "Phoenix", 
    title: "Big Island -> Abflug nach Phoenix", 
    morning: "Kona-Kaffeeplantagen & Punaluʻu Black Sand Beach", 
    afternoon: "Mietwagenrückgabe in Kona & Nachtflug am Abend nach Phoenix", 
    hotel: "Flug / Übergangstag",
    isTravelDay: true, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-25", 
    dateFormatted: "Di, 25.05.2027", 
    location: "Phoenix", 
    title: "Ankunft Phoenix & Hotel Check-in", 
    morning: "Ankunft in Phoenix & Check-in im Holiday Inn Express & Suites Phoenix West - Tolleson", 
    afternoon: "Erkundungen in Old Town Scottsdale & Wüsten-Panorama", 
    hotel: "Holiday Inn Express & Suites Phoenix West - Tolleson (25.05.–29.05.2027)",
    isTravelDay: true, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-26", 
    dateFormatted: "Mi, 26.05.2027", 
    location: "Phoenix", 
    title: "Phoenix", 
    morning: "Shopping in den Arizona Mills (Tempe)", 
    afternoon: "Kultur & Entspannung in Phoenix", 
    hotel: "Holiday Inn Express & Suites Phoenix West - Tolleson",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-27", 
    dateFormatted: "Do, 27.05.2027", 
    location: "Phoenix", 
    title: "Ausflug Sedona & Outlets", 
    morning: "Tagesausflug in die rote Felsenlandschaft nach Sedona", 
    afternoon: "Stopp bei den Outlets at Anthem auf dem Rückweg", 
    hotel: "Holiday Inn Express & Suites Phoenix West - Tolleson",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-28", 
    dateFormatted: "Fr, 28.05.2027", 
    location: "Phoenix", 
    title: "Phoenix Shopping", 
    morning: "Großes Outlet-Shopping in den Phoenix Premium Outlets (Chandler)", 
    afternoon: "Pool-Entspannung & gemeinsames Abendessen", 
    hotel: "Holiday Inn Express & Suites Phoenix West - Tolleson",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-29", 
    dateFormatted: "Sa, 29.05.2027", 
    location: "Rancho Cucamonga", 
    title: "Phoenix -> Rancho Cucamonga & Check-in", 
    morning: "Fahrt von Phoenix nach Kalifornien (ca. 5,5 Std.)", 
    afternoon: "Ankunft in Rancho Cucamonga & Check-in im Best Western Plus Heritage Inn", 
    hotel: "Best Western Plus Heritage Inn Ontario Rancho Cucamonga (29.05.–03.06.2027)",
    isTravelDay: true, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-30", 
    dateFormatted: "So, 30.05.2027", 
    location: "Rancho Cucamonga", 
    title: "Rancho Cucamonga / LA", 
    morning: "Sightseeing im Großraum LA & Santa Monica", 
    afternoon: "Coastline & Strandspaziergang", 
    hotel: "Best Western Plus Heritage Inn Ontario Rancho Cucamonga",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-05-31", 
    dateFormatted: "Mo, 31.05.2027", 
    location: "Rancho Cucamonga", 
    title: "Rancho Cucamonga / LA", 
    morning: "Hollywood & Griffith Observatory", 
    afternoon: "Erkundungen & Shopping in der Region", 
    hotel: "Best Western Plus Heritage Inn Ontario Rancho Cucamonga",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-06-01", 
    dateFormatted: "Di, 01.06.2027", 
    location: "Rancho Cucamonga", 
    title: "Rancho Cucamonga / LA", 
    morning: "Ausflüge oder Outlet-Shopping (z.B. Citadel Outlets)", 
    afternoon: "Entspannung im Inland Empire", 
    hotel: "Best Western Plus Heritage Inn Ontario Rancho Cucamonga",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-06-02", 
    dateFormatted: "Mi, 02.06.2027", 
    location: "Rancho Cucamonga", 
    title: "Rancho Cucamonga / LA", 
    morning: "Letzte Highlights & Souvenir-Shopping", 
    afternoon: "Gemütlicher Ausklang des Urlaubs", 
    hotel: "Best Western Plus Heritage Inn Ontario Rancho Cucamonga",
    isTravelDay: false, 
    completed: false, 
    notes: "" 
  },
  { 
    id: "2027-06-03", 
    dateFormatted: "Do, 03.06.2027", 
    location: "Rancho Cucamonga", 
    title: "Abreise / Rückflug nach Frankfurt", 
    morning: "Koffer packen & Mietwagenrückgabe am Flughafen LAX", 
    afternoon: "Rückflug von LAX über San Francisco nach Frankfurt", 
    hotel: "Abreisetag",
    isTravelDay: true, 
    completed: false, 
    notes: "" 
  }
];

const TRIP_ID = "hawaii-westcoast-2027";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedFilter, setSelectedFilter] = useState('Alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [days, setDays] = useState([]);
  const [budgetItems, setBudgetItems] = useState([]);
  const [newBudgetItem, setNewBudgetItem] = useState({ title: '', amount: '', category: 'Verpflegung', isPaid: false });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const daysCollectionRef = collection(db, 'trips', TRIP_ID, 'days');
    const unsubscribe = onSnapshot(daysCollectionRef, async (snapshot) => {
      if (snapshot.empty) {
        for (const day of INITIAL_DAYS) {
          await setDoc(doc(db, 'trips', TRIP_ID, 'days', day.id), day);
        }
      } else {
        const cloudDays = snapshot.docs.map(doc => doc.data());
        cloudDays.sort((a, b) => a.id.localeCompare(b.id));
        setDays(cloudDays);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const budgetCollectionRef = collection(db, 'trips', TRIP_ID, 'budget');
    const unsubscribe = onSnapshot(budgetCollectionRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBudgetItems(items);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const toggleDayComplete = async (dayId, currentCompleted) => {
    const dayDocRef = doc(db, 'trips', TRIP_ID, 'days', dayId);
    await updateDoc(dayDocRef, { completed: !currentCompleted });
  };

  const updateDayNote = async (dayId, noteText) => {
    const dayDocRef = doc(db, 'trips', TRIP_ID, 'days', dayId);
    await updateDoc(dayDocRef, { notes: noteText });
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!newBudgetItem.title || !newBudgetItem.amount) return;
    await addDoc(collection(db, 'trips', TRIP_ID, 'budget'), {
      title: newBudgetItem.title,
      amount: parseFloat(newBudgetItem.amount) || 0,
      currency: "USD",
      category: newBudgetItem.category,
      isPaid: newBudgetItem.isPaid
    });
    setNewBudgetItem({ title: '', amount: '', category: 'Verpflegung', isPaid: false });
  };

  const toggleBudgetPaid = async (budgetId, currentPaid) => {
    const budgetDocRef = doc(db, 'trips', TRIP_ID, 'budget', budgetId);
    await updateDoc(budgetDocRef, { isPaid: !currentPaid });
  };

  const getLocationStyle = (loc) => {
    switch (loc) {
      case 'Oahu': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Maui': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Big Island': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Phoenix': return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Rancho Cucamonga': return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm border border-slate-200">
          <div className="text-center mb-6">
            <span className="text-4xl"> Hawaii </span>
            <h1 className="text-xl font-bold text-slate-800 mt-2">Hawaii & Westcoast 2027</h1>
            <p className="text-xs text-slate-500">Logge dich ein, um den Reiseplan und Hotels einzusehen.</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-3">
            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {authError && <p className="text-xs text-red-500 leading-tight">{authError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold shadow hover:bg-teal-700 transition-all"
            >
              {isRegistering ? 'Account Erstellen' : 'Anmelden'}
            </button>
          </form>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full text-center text-xs text-teal-700 mt-4 underline font-medium"
          >
            {isRegistering ? 'Bereits registriert? Hier anmelden' : 'Neuen Account für Reisebegleitung anlegen'}
          </button>
        </div>
      </div>
    );
  }

  const filteredDays = days.filter(day => {
    const matchesFilter =
      selectedFilter === 'Alle' ? true :
      selectedFilter === 'Reisetage' ? day.isTravelDay :
      day.location === selectedFilter;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      day.title?.toLowerCase().includes(query) ||
      day.morning?.toLowerCase().includes(query) ||
      day.afternoon?.toLowerCase().includes(query) ||
      day.hotel?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-3 sm:p-6 font-sans">
      <header className="max-w-4xl mx-auto mb-6 bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-teal-600 uppercase bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            13. Mai – 03. Juni 2027
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Hawaii & Westcoast 2027</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(activeTab === 'itinerary' ? 'budget' : 'itinerary')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            {activeTab === 'itinerary' ? 'Budget & Kosten' : 'Zum Reiseplan'}
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all"
          >
            Abmelden
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-4">
        {activeTab === 'itinerary' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Suche nach Aktivitäten, Hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
              />
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {['Alle', 'Reisetage', 'Oahu', 'Maui', 'Big Island', 'Phoenix', 'Rancho Cucamonga'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedFilter === filter 
                        ? 'bg-teal-600 text-white shadow' 
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredDays.map(day => (
                <div 
                  key={day.id} 
                  className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-sm transition-all ${day.completed ? 'opacity-60 bg-slate-50' : 'border-slate-200'}`}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800">{day.dateFormatted}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getLocationStyle(day.location)}`}>
                        {day.location}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleDayComplete(day.id, day.completed)}
                      className={`text-[10px] font-bold px-3 py-1 rounded-xl transition-all ${
                        day.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day.completed ? 'Erledigt ✓' : 'Als erledigt markieren'}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-2">{day.title}</h3>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-teal-700 block mb-0.5">Vormittag:</span>
                      <p className="text-slate-600 leading-relaxed">{day.morning}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-amber-700 block mb-0.5">Nachmittag:</span>
                      <p className="text-slate-600 leading-relaxed">{day.afternoon}</p>
                    </div>
                  </div>

                  {day.hotel && (
                    <div className="mb-3 text-[11px] font-medium bg-teal-50/60 border border-teal-200/60 text-teal-900 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <span>🏨 Unterkunft:</span>
                      <span className="font-bold">{day.hotel}</span>
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Persönliche Notiz hinzufügen..."
                    defaultValue={day.notes || ''}
                    onBlur={(e) => updateDayNote(day.id, e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'budget' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Reisebudget & Ausgaben</h2>
            <form onSubmit={handleAddBudget} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Bezeichnung"
                value={newBudgetItem.title}
                onChange={e => setNewBudgetItem({ ...newBudgetItem, title: e.target.value })}
                className="text-xs border border-slate-300 rounded-xl px-3 py-2"
                required
              />
              <input
                type="number"
                placeholder="Betrag ($)"
                value={newBudgetItem.amount}
                onChange={e => setNewBudgetItem({ ...newBudgetItem, amount: e.target.value })}
                className="text-xs border border-slate-300 rounded-xl px-3 py-2"
                required
              />
              <select
                value={newBudgetItem.category}
                onChange={e => setNewBudgetItem({ ...newBudgetItem, category: e.target.value })}
                className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
              >
                <option value="Verpflegung">Verpflegung</option>
                <option value="Shopping">Shopping</option>
                <option value="Aktivität">Aktivität</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold py-2 shadow">
                Hinzufügen
              </button>
            </form>

            <div className="divide-y divide-slate-100">
              {budgetItems.map(item => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{item.title}</span>
                    <span className="text-slate-400 ml-2">({item.category})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">${item.amount}</span>
                    <button
                      onClick={() => toggleBudgetPaid(item.id, item.isPaid)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${item.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                    >
                      {item.isPaid ? 'Bezahlt' : 'Offen'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
