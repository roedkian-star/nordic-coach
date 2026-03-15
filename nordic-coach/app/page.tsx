"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

type DrillForm = {
  title: string;
  category: string;
  focus: string;
  intensity: string;
  duration: string;
  ageGroup: string;
  description: string;
};

type SavedDrill = {
  id?: string;
  title: string;
  category: string;
  focus: string;
  intensity: number;
  duration: number | string;
  ageGroup?: string;
  description?: string;
};

export default function NordicCoachPrototype() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedTeam, setSelectedTeam] = useState("U11");
  const [selectedPlayStyleGroup, setSelectedPlayStyleGroup] = useState("Vi har bolden");
  const [selectedMonth, setSelectedMonth] = useState("Januar");
  const [drillForm, setDrillForm] = useState<DrillForm>({
    title: "",
    category: "Basic teknisk",
    focus: "",
    intensity: "3",
    duration: "15",
    ageGroup: "U11-U12",
    description: "",
  });
  const [savedDrills, setSavedDrills] = useState<SavedDrill[]>([]);
  const [isSavingDrill, setIsSavingDrill] = useState(false);
  const [drillMessage, setDrillMessage] = useState("");

  const teams = [
    { name: "U6", age: 2020, format: "3v3", training: "60 min" },
    { name: "U7", age: 2019, format: "3v3", training: "60 min" },
    { name: "U8", age: 2018, format: "5v5", training: "60 min" },
    { name: "U9", age: 2017, format: "5v5", training: "75 min" },
    { name: "U10", age: 2016, format: "5v5", training: "75 min" },
    { name: "U11", age: 2015, format: "8v8", training: "90 min" },
    { name: "U12", age: 2014, format: "8v8", training: "90 min" },
    { name: "U13", age: 2013, format: "11v11", training: "90 min" },
    { name: "U14", age: 2012, format: "11v11", training: "90 min" },
    { name: "U15", age: 2011, format: "11v11", training: "90 min" },
    { name: "U16", age: 2010, format: "11v11", training: "90 min" },
    { name: "U17", age: 2009, format: "11v11", training: "90 min" },
    { name: "U19", age: 2008, format: "11v11", training: "90 min" },
    { name: "Senior 2", age: 2007, format: "11v11", training: "90 min" },
    { name: "Senior 1", age: 2006, format: "11v11", training: "90 min" },
  ];

  const teamPlayers: Record<string, { name: string; position: string; year: number }[]> = {
    U11: [
      { name: "Emma Hansen", position: "CM", year: 2015 },
      { name: "Sofie Larsen", position: "Wing", year: 2015 },
      { name: "Freja Nielsen", position: "CB", year: 2015 },
      { name: "Clara Jensen", position: "ST", year: 2015 },
      { name: "Laura Pedersen", position: "GK", year: 2015 },
    ],
    U12: [
      { name: "Alma Christensen", position: "CM", year: 2014 },
      { name: "Ida Sørensen", position: "CB", year: 2014 },
      { name: "Victoria Madsen", position: "Wing", year: 2014 },
      { name: "Mathilde Andersen", position: "ST", year: 2014 },
      { name: "Anna Thomsen", position: "GK", year: 2014 },
    ],
  };

  const playStyle = [
    {
      title: "Vi har bolden",
      sections: [
        {
          title: "Fase 1 – Opbygning",
          points: [
            "Skabe numerisk overtal +1 i bagkæden",
            "Involvere målmanden som ekstra markspiller",
            "Spille med få berøringer og søge den frie spiller",
          ],
        },
        {
          title: "Fase 2 – Opbygning på modstanders banehalvdel",
          points: [
            "Skabe trekanter og diamanter",
            "Kontrollere bolden og skabe scoringstilmuligheder",
            "Beskytte mod genpres ved korte relationer",
          ],
        },
        {
          title: "Fase 3 – Afslutningsspil",
          points: [
            "Hurtig boldbevægelse",
            "Fremadrettede løb og kombinationsspil",
            "Variation i angrebsmuligheder og overbelastning centralt",
          ],
        },
      ],
    },
    {
      title: "De har bolden",
      sections: [
        {
          title: "Lavt pres",
          points: [
            "Holde organisationen kompakt",
            "Lukke centrale kanaler",
            "Tvinge spillet mod siderne",
          ],
        },
        {
          title: "Midtbanepres",
          points: [
            "Reducere tid og plads for boldholder",
            "Skabe fejl centralt",
            "Være klar til hurtig omstilling",
          ],
        },
        {
          title: "Højt pres",
          points: [
            "Koordineret og aggressivt pres",
            "Generobre bolden tæt på modstanders mål",
            "Høj intensitet og timing i fælles pres",
          ],
        },
      ],
    },
    {
      title: "Erobringsspil",
      sections: [
        {
          title: "Grundprincipper",
          points: [
            "Intensitet, aggressivitet og hurtige retningsskift",
            "Organisation som samlet enhed",
            "Hurtig kontra efter erobring",
          ],
        },
      ],
    },
  ];

  const drillLibrary: SavedDrill[] = [
    {
      title: "1v1 retvendt",
      category: "Basic teknisk",
      focus: "Førsteberøring",
      intensity: 3,
      duration: 12,
      ageGroup: "U11-U12",
      description: "Funktionel øvelse med fokus på førsteberøring og retvendt duel.",
    },
    {
      title: "3v1 possession",
      category: "Pasningsspil",
      focus: "Afleveringer og orientering",
      intensity: 3,
      duration: 15,
      ageGroup: "U11-U12",
      description: "Kort pasningsspil med fokus på vinkler og tempo.",
    },
    {
      title: "Afslutninger 1",
      category: "Afslutninger",
      focus: "Inderside og vrist",
      intensity: 4,
      duration: 15,
      ageGroup: "U11-U12",
      description: "Afslutningsøvelse med fokus på forskellige afslutningsteknikker.",
    },
    {
      title: "Horst Wein 4v4",
      category: "Basic taktisk",
      focus: "Vende spillet og beslutninger",
      intensity: 4,
      duration: 20,
      ageGroup: "U11-U12",
      description: "Spiløvelse med fokus på orientering, relationer og beslutningstagning.",
    },
  ];

  const periodization: Record<string, string[]> = {
    Januar: ["Uge 1 – Pasningsspil", "Uge 2 – Førsteberøring", "Uge 3 – Afslutninger", "Uge 4 – Vende spillet"],
    Februar: ["Uge 5 – Dybde og bredde", "Uge 6 – Spil og løb", "Uge 7 – Gennembrudsstrategier", "Uge 8 – Pres"],
    Marts: ["Uge 9 – Build up", "Uge 10 – Pres", "Uge 11 – Afslutninger", "Uge 12 – Kampforberedelse"],
  };

  const weekPlan = [
    { block: "Opvarmning", title: "3v1 possession", duration: 15 },
    { block: "Teknisk", title: "1v1 retvendt", duration: 20 },
    { block: "Afslutning", title: "Afslutninger 1", duration: 20 },
    { block: "Spil", title: "Horst Wein 4v4", duration: 25 },
  ];

  const navigation = [
    "Dashboard",
    "Hold",
    "Spillere",
    "Spillestil",
    "Træningsbank",
    "Periodisering",
    "Video bibliotek",
    "AI Træner",
    "Spillerudvikling",
    "Indstillinger",
  ];

  const currentTeam = useMemo(() => teams.find((team) => team.name === selectedTeam) || teams[0], [selectedTeam]);
  const currentPlayers = teamPlayers[selectedTeam] || teamPlayers.U11;
  const currentPlayStyle = playStyle.find((group) => group.title === selectedPlayStyleGroup) || playStyle[0];
  const currentWeeks = periodization[selectedMonth] || [];

  useEffect(() => {
    async function loadDrills() {
      try {
        const q = query(collection(db, "drills"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as SavedDrill) }));
        setSavedDrills(items);
      } catch (error) {
        console.error(error);
      }
    }

    loadDrills();
  }, []);

  async function handleCreateDrill(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingDrill(true);
    setDrillMessage("");

    try {
      await addDoc(collection(db, "drills"), {
        title: drillForm.title,
        category: drillForm.category,
        focus: drillForm.focus,
        intensity: Number(drillForm.intensity),
        duration: Number(drillForm.duration),
        ageGroup: drillForm.ageGroup,
        description: drillForm.description,
        createdAt: serverTimestamp(),
      });

      setDrillMessage("Øvelsen er gemt i databasen.");
      setDrillForm({
        title: "",
        category: "Basic teknisk",
        focus: "",
        intensity: "3",
        duration: "15",
        ageGroup: "U11-U12",
        description: "",
      });

      const q = query(collection(db, "drills"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as SavedDrill) }));
      setSavedDrills(items);
    } catch (error) {
      console.error(error);
      setDrillMessage("Der opstod en fejl ved gemning af øvelsen. Tjek Firestore regler.");
    } finally {
      setIsSavingDrill(false);
    }
  }

  function StatCard({ label, value, help }: { label: string; value: string; help: string }) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
        <div className="mt-1 text-xs text-slate-400">{help}</div>
      </div>
    );
  }

  function PageHeader({ title, text }: { title: string; text: string }) {
    return (
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="max-w-3xl text-sm text-slate-500">{text}</p>
      </div>
    );
  }

  function renderDashboard() {
    return (
      <>
        <PageHeader title="Dashboard" text="Første prototype til Vejle Boldklub. Navigation ligger i venstre side, og arbejdsfladen i midten ændrer sig efter det modul du vælger." />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Aktiv klub" value="Vejle Boldklub" help="Multi-klub struktur klar" />
          <StatCard label="Hold" value="15" help="U6 til Senior 1" />
          <StatCard label="Øvelser" value={String(savedDrills.length + drillLibrary.length)} help="Testdata + database" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Holdoversigt</h2>
              <button onClick={() => setActivePage("Hold")} className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">Åbn hold</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {teams.slice(0, 9).map((team) => (
                <button
                  key={team.name}
                  onClick={() => {
                    setSelectedTeam(team.name);
                    setActivePage("Hold");
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="font-semibold text-slate-900">{team.name}</div>
                  <div className="mt-1 text-sm text-slate-500">Årgang {team.age}</div>
                  <div className="mt-2 text-xs text-slate-400">{team.format} · {team.training}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ugens træning</h2>
              <button onClick={() => setActivePage("Periodisering")} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">Se periode</button>
            </div>
            <div className="space-y-3">
              {weekPlan.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">{item.block}</div>
                      <div className="font-medium text-slate-900">{item.title}</div>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-sm text-slate-700">{item.duration} min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderHold() {
    return (
      <>
        <PageHeader title="Hold" text="Vælg et hold i venstre kolonne. Detaljer, spillere og seneste træningspas vises i midten." />
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-500">Alle hold</div>
            <div className="space-y-2">
              {teams.map((team) => {
                const active = selectedTeam === team.name;
                return (
                  <button
                    key={team.name}
                    onClick={() => setSelectedTeam(team.name)}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition ${active ? "bg-slate-900 text-white" : "border border-slate-200 bg-slate-50 text-slate-900 hover:bg-white"}`}
                  >
                    <div className="font-semibold">{team.name}</div>
                    <div className={`text-sm ${active ? "text-slate-300" : "text-slate-500"}`}>Årgang {team.age}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{currentTeam.name}</h2>
                  <p className="text-slate-500">Årgang {currentTeam.age} · {currentTeam.format} · {currentTeam.training}</p>
                </div>
                <button onClick={() => setActivePage("Spillere")} className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">Se spillere</button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <StatCard label="Format" value={currentTeam.format} help="Kampformat" />
                <StatCard label="Varighed" value={currentTeam.training} help="Standard træningstid" />
                <StatCard label="Spillere" value={String(currentPlayers.length)} help="Testspillere i denne version" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Seneste træningsblokke</h3>
              <div className="grid gap-3">
                {weekPlan.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{item.title}</div>
                        <div className="text-sm text-slate-500">{item.block}</div>
                      </div>
                      <div className="text-sm text-slate-500">{item.duration} min</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderSpillere() {
    return (
      <>
        <PageHeader title="Spillere" text="Oversigt over spillere på det valgte hold. Her bygger vi senere udviklingsvurderinger og historik ovenpå." />
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-slate-500">Viser hold:</span>
          <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            {teams.map((team) => (
              <option key={team.name} value={team.name}>{team.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {currentPlayers.map((player) => (
            <div key={player.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
                  {player.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{player.name}</div>
                  <div className="text-sm text-slate-500">{player.position} · Årgang {player.year}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ["Teknik", "4/5"],
                  ["Taktik", "3/5"],
                  ["Fysik", "3/5"],
                  ["Mental", "4/5"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  function renderSpillestil() {
    return (
      <>
        <PageHeader title="Spillestil" text="Hovedmenuen ligger til venstre. Her vælger du hovedområde, og underpunkterne vises i midten." />
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-500">Hovedområder</div>
            <div className="space-y-2">
              {playStyle.map((group) => {
                const active = selectedPlayStyleGroup === group.title;
                return (
                  <button
                    key={group.title}
                    onClick={() => setSelectedPlayStyleGroup(group.title)}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition ${active ? "bg-slate-900 text-white" : "border border-slate-200 bg-slate-50 text-slate-900 hover:bg-white"}`}
                  >
                    {group.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">{currentPlayStyle.title}</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {currentPlayStyle.sections.map((section) => (
                <div key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-3 font-semibold text-slate-900">{section.title}</h3>
                  <div className="space-y-2">
                    {section.points.map((point) => (
                      <div key={point} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderTraeningsbank() {
    const combinedDrills = [...savedDrills, ...drillLibrary.filter((drill) => !savedDrills.some((saved) => saved.title === drill.title))];

    return (
      <>
        <PageHeader title="Øvelsesbank" text="Opret nye øvelser i venstre side. Gemte øvelser vises i midten og kan senere bruges i træningsplaner." />
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Ny øvelse</h2>
            <form onSubmit={handleCreateDrill} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Navn</label>
                <input value={drillForm.title} onChange={(e) => setDrillForm({ ...drillForm, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Kategori</label>
                  <select value={drillForm.category} onChange={(e) => setDrillForm({ ...drillForm, category: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option>Basic teknisk</option>
                    <option>Basic taktisk</option>
                    <option>Pasningsspil</option>
                    <option>Afslutninger</option>
                    <option>Pres</option>
                    <option>Spiløvelser</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Aldersgruppe</label>
                  <input value={drillForm.ageGroup} onChange={(e) => setDrillForm({ ...drillForm, ageGroup: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Fokus</label>
                <input value={drillForm.focus} onChange={(e) => setDrillForm({ ...drillForm, focus: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Intensitet</label>
                  <select value={drillForm.intensity} onChange={(e) => setDrillForm({ ...drillForm, intensity: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option value="1">1 - meget lav</option>
                    <option value="2">2 - lav</option>
                    <option value="3">3 - medium</option>
                    <option value="4">4 - høj</option>
                    <option value="5">5 - meget høj</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Varighed</label>
                  <input type="number" value={drillForm.duration} onChange={(e) => setDrillForm({ ...drillForm, duration: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Beskrivelse</label>
                <textarea value={drillForm.description} onChange={(e) => setDrillForm({ ...drillForm, description: e.target.value })} className="min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <button type="submit" disabled={isSavingDrill} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
                {isSavingDrill ? "Gemmer..." : "Gem øvelse"}
              </button>
              {drillMessage ? <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">{drillMessage}</div> : null}
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Gemte øvelser</h2>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{combinedDrills.length} øvelser</div>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {combinedDrills.map((drill, index) => (
                <div key={drill.id || `${drill.title}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{drill.title}</div>
                      <div className="text-sm text-slate-500">{drill.category}</div>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-sm text-slate-700">Intensitet {drill.intensity}/5</div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-white px-3 py-3 text-sm">
                      <div className="text-slate-400">Fokus</div>
                      <div className="mt-1 font-medium text-slate-900">{drill.focus}</div>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3 text-sm">
                      <div className="text-slate-400">Varighed</div>
                      <div className="mt-1 font-medium text-slate-900">{String(drill.duration)} min</div>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3 text-sm">
                      <div className="text-slate-400">Aldersgruppe</div>
                      <div className="mt-1 font-medium text-slate-900">{drill.ageGroup || "Ikke angivet"}</div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl bg-white px-3 py-3 text-sm text-slate-700">{drill.description || "Beskrivelse kommer her."}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderPeriodisering() {
    return (
      <>
        <PageHeader title="Periodisering" text="Måneder vælges i venstre side. Uger og fokusområder vises i midten som en arbejdsflade." />
        <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-500">Måneder</div>
            <div className="space-y-2">
              {Object.keys(periodization).map((month) => {
                const active = selectedMonth === month;
                return (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition ${active ? "bg-slate-900 text-white" : "border border-slate-200 bg-slate-50 text-slate-900 hover:bg-white"}`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">{selectedMonth}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {currentWeeks.map((week) => (
                <div key={week} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="font-semibold text-slate-900">{week}</div>
                  <div className="mt-2 text-sm text-slate-500">Klikbar uge-mapning udbygges i næste version.</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderPlaceholder(title: string) {
    return (
      <>
        <PageHeader title={title} text="Dette modul bliver bygget i næste version af Nordic Coach." />
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-slate-500 shadow-sm">
          Indhold kommer snart.
        </div>
      </>
    );
  }

  function renderPage() {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();
      case "Hold":
        return renderHold();
      case "Spillere":
        return renderSpillere();
      case "Spillestil":
        return renderSpillestil();
      case "Træningsbank":
        return renderTraeningsbank();
      case "Periodisering":
        return renderPeriodisering();
      default:
        return renderPlaceholder(activePage);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-950 p-5 text-white">
          <div className="mb-8">
            <div className="text-2xl font-bold tracking-tight">Nordic Coach</div>
            <div className="mt-1 text-sm text-slate-400">Football Coaching & Development Platform</div>
          </div>

          <div className="mb-6 rounded-2xl bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">Aktiv klub</div>
            <div className="mt-1 font-semibold">Vejle Boldklub</div>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const active = activePage === item;
              return (
                <button
                  key={item}
                  onClick={() => setActivePage(item)}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${active ? "bg-white text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                >
                  {item}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="p-6 xl:p-8">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm xl:p-8">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
