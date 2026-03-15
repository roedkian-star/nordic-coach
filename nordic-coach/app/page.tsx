import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export default function NordicCoachPrototype() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedTeam, setSelectedTeam] = useState("U11");
  const [drillForm, setDrillForm] = useState({
    title: "",
    category: "Basic teknisk",
    focus: "",
    intensity: "3",
    duration: "15",
    ageGroup: "U11-U12",
    description: "",
  });
  const [savedDrills, setSavedDrills] = useState<any[]>([]);
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

  const teamPlayers = {
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

  const drills = [
    {
      title: "1v1 retvendt",
      category: "Basic teknisk",
      focus: "Førsteberøring",
      intensity: 3,
      duration: "12 min",
      ageGroup: "U11-U12",
      description: "Funktionel øvelse med fokus på førsteberøring og retvendt duel.",
    },
    {
      title: "3v1 possession",
      category: "Pasningsspil",
      focus: "Afleveringer og orientering",
      intensity: 3,
      duration: "15 min",
      ageGroup: "U11-U12",
      description: "Kort pasningsspil med fokus på vinkler og tempo.",
    },
    {
      title: "Afslutninger 1",
      category: "Afslutninger",
      focus: "Inderside og vrist",
      intensity: 4,
      duration: "15 min",
      ageGroup: "U11-U12",
      description: "Afslutningsøvelse med fokus på forskellige afslutningsteknikker.",
    },
    {
      title: "Horst Wein 4v4",
      category: "Basic taktisk",
      focus: "Vende spillet og beslutninger",
      intensity: 4,
      duration: "20 min",
      ageGroup: "U11-U12",
      description: "Spiløvelse med fokus på orientering, relationer og beslutningstagning.",
    },
    {
      title: "2v1 i to zoner",
      category: "Basic taktisk",
      focus: "Spille eller drible",
      intensity: 4,
      duration: "15 min",
      ageGroup: "U11-U12",
      description: "Øvelse med fokus på valg mellem aflevering og dribling.",
    },
  ];

  const periodization = {
    Januar: ["Uge 1 – Pasningsspil", "Uge 2 – Førsteberøring", "Uge 3 – Afslutninger", "Uge 4 – Vende spillet"],
    Februar: ["Uge 5 – Dybde og bredde", "Uge 6 – Spil og løb", "Uge 7 – Gennembrudsstrategier", "Uge 8 – Pres"],
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

  const currentTeam = useMemo(
    () => teams.find((team) => team.name === selectedTeam) || teams[0],
    [selectedTeam]
  );

  const players = teamPlayers[selectedTeam] || teamPlayers.U11;

  useEffect(() => {
    async function loadDrills() {
      try {
        const q = query(collection(db, "drills"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSavedDrills(items);
      } catch (error) {
        console.error(error);
      }
    }

    loadDrills();
  }, []);

  async function handleCreateDrill(e: any) {
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
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSavedDrills(items);
    } catch (error) {
      console.error(error);
      setDrillMessage("Der opstod en fejl ved gemning af øvelsen.");
    } finally {
      setIsSavingDrill(false);
    }
  }

  function renderDashboard() {
    return (
      <>
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-slate-500">Første prototype til Vejle Boldklub, bygget så andre klubber kan komme på senere.</p>
          </div>
          <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Aktiv klub</div>
            <div className="font-semibold">Vejle Boldklub</div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Holdoversigt</h2>
              <span className="text-sm text-slate-500">15 hold</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {teams.map((team) => (
                <button
                  key={team.name}
                  onClick={() => {
                    setSelectedTeam(team.name);
                    setActivePage("Hold");
                  }}
                  className="rounded-2xl border bg-slate-50 p-4 text-left transition hover:bg-slate-100"
                >
                  <div className="font-semibold">{team.name}</div>
                  <div className="text-sm text-slate-500">Årgang {team.age}</div>
                  <div className="mt-2 text-xs text-slate-500">{team.format} · {team.training}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Ugens træning</h2>
            <div className="space-y-3">
              {weekPlan.map((item) => (
                <div key={item.title} className="rounded-2xl border bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{item.block}</div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-slate-500">{item.duration} min</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Spillestil</h2>
            <div className="space-y-4">
              {playStyle.map((group) => (
                <div key={group.title} className="rounded-2xl border bg-slate-50 p-4">
                  <div className="mb-2 font-semibold">{group.title}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.sections.map((item) => (
                      <span key={item.title} className="rounded-full border bg-white px-3 py-1 text-sm text-slate-700">
                        {item.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Træningsbank</h2>
              <span className="text-sm text-slate-500">Testdata</span>
            </div>
            <div className="space-y-3">
              {drills.map((drill) => (
                <div key={drill.title} className="rounded-2xl border bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{drill.title}</div>
                      <div className="text-sm text-slate-500">{drill.category}</div>
                    </div>
                    <span className="rounded-full border bg-white px-3 py-1 text-sm">Intensitet {drill.intensity}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </>
    );
  }

  function renderTeams() {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Hold</h1>
          <p className="text-slate-500">Alle hold i klubben med årgang, kampformat og standard træningstid.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Holdliste</h2>
            <div className="space-y-2">
              {teams.map((team) => {
                const active = selectedTeam === team.name;
                return (
                  <button
                    key={team.name}
                    onClick={() => setSelectedTeam(team.name)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${active ? "border-slate-900 bg-slate-900 text-white" : "bg-slate-50 hover:bg-slate-100"}`}
                  >
                    <div className="font-semibold">{team.name}</div>
                    <div className={`text-sm ${active ? "text-slate-200" : "text-slate-500"}`}>Årgang {team.age}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{currentTeam.name}</h2>
                <p className="text-slate-500">Årgang {currentTeam.age} · {currentTeam.format} · {currentTeam.training}</p>
              </div>
              <button
                onClick={() => setActivePage("Spillere")}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Se spillere
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Træningsformat</div>
                <div className="mt-1 text-lg font-semibold">{currentTeam.format}</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Standard varighed</div>
                <div className="mt-1 text-lg font-semibold">{currentTeam.training}</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Spillere i prototype</div>
                <div className="mt-1 text-lg font-semibold">{players.length}</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold">Seneste træningspas</h3>
              <div className="space-y-3">
                {weekPlan.map((item) => (
                  <div key={item.title} className="rounded-2xl border bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-slate-500">{item.block}</div>
                      </div>
                      <div className="text-sm text-slate-500">{item.duration} min</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  function renderPlayers() {
    return (
      <>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Spillere</h1>
            <p className="text-slate-500">Midlertidige testspillere til prototypen for {selectedTeam}.</p>
          </div>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="rounded-2xl border bg-white px-4 py-2 text-sm"
          >
            {teams.map((team) => (
              <option key={team.name} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <section key={player.name} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                  {player.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h2 className="font-semibold">{player.name}</h2>
                  <div className="text-sm text-slate-500">{selectedTeam} · Årgang {player.year}</div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">Primær position</span>
                  <span className="font-medium">{player.position}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">Teknik</span>
                  <span className="font-medium">4/5</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">Taktik</span>
                  <span className="font-medium">3/5</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">Fysik</span>
                  <span className="font-medium">3/5</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">Mental</span>
                  <span className="font-medium">4/5</span>
                </div>
              </div>
            </section>
          ))}
        </div>
      </>
    );
  }

  function renderPlayStyle() {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Spillestil</h1>
          <p className="text-slate-500">Klubbens fælles fodboldsprog bygget ind som mapper og underpunkter.</p>
        </div>

        <div className="space-y-5">
          {playStyle.map((group) => (
            <section key={group.title} className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">{group.title}</h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {group.sections.map((section) => (
                  <div key={section.title} className="rounded-2xl border bg-slate-50 p-4">
                    <h3 className="mb-3 font-semibold">{section.title}</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      {section.points.map((point) => (
                        <div key={point} className="rounded-xl bg-white px-3 py-2 border">{point}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </>
    );
  }

  function renderDrills() {
    return (
      <>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Øvelsesbank</h1>
            <p className="text-slate-500">Opret og gem øvelser direkte i databasen, så de senere kan bruges i træningsplaner.</p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Ny øvelse</h2>
            <form onSubmit={handleCreateDrill} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Navn på øvelse</label>
                <input
                  value={drillForm.title}
                  onChange={(e) => setDrillForm({ ...drillForm, title: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Fx 4v2 rondo"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Kategori</label>
                  <select
                    value={drillForm.category}
                    onChange={(e) => setDrillForm({ ...drillForm, category: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                  >
                    <option>Basic teknisk</option>
                    <option>Basic taktisk</option>
                    <option>Pasningsspil</option>
                    <option>Afslutninger</option>
                    <option>Pres</option>
                    <option>Spiløvelser</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Aldersgruppe</label>
                  <input
                    value={drillForm.ageGroup}
                    onChange={(e) => setDrillForm({ ...drillForm, ageGroup: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    placeholder="Fx U11-U12"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Fokus</label>
                <input
                  value={drillForm.focus}
                  onChange={(e) => setDrillForm({ ...drillForm, focus: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Fx førsteberøring"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Intensitet</label>
                  <select
                    value={drillForm.intensity}
                    onChange={(e) => setDrillForm({ ...drillForm, intensity: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                  >
                    <option value="1">1 - meget lav</option>
                    <option value="2">2 - lav</option>
                    <option value="3">3 - medium</option>
                    <option value="4">4 - høj</option>
                    <option value="5">5 - meget høj</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Varighed (min)</label>
                  <input
                    type="number"
                    value={drillForm.duration}
                    onChange={(e) => setDrillForm({ ...drillForm, duration: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Beskrivelse</label>
                <textarea
                  value={drillForm.description}
                  onChange={(e) => setDrillForm({ ...drillForm, description: e.target.value })}
                  className="min-h-[120px] w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Skriv kort hvordan øvelsen afvikles"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingDrill}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isSavingDrill ? "Gemmer..." : "Gem øvelse"}
              </button>

              {drillMessage ? <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm">{drillMessage}</div> : null}
            </form>
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Gemte øvelser</h2>
              <span className="text-sm text-slate-500">Firestore</span>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {[...savedDrills, ...drills.filter((drill) => !savedDrills.some((saved) => saved.title === drill.title))].map((drill: any) => (
                <section key={drill.id || drill.title} className="rounded-2xl border bg-slate-50 p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{drill.title}</h2>
                      <p className="text-sm text-slate-500">{drill.category}</p>
                    </div>
                    <div className="rounded-full border bg-white px-3 py-1 text-sm">Intensitet {drill.intensity}/5</div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3 text-sm">
                    <div className="rounded-xl bg-white px-3 py-3">
                      <div className="text-slate-500">Fokus</div>
                      <div className="mt-1 font-medium">{drill.focus}</div>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <div className="text-slate-500">Varighed</div>
                      <div className="mt-1 font-medium">{String(drill.duration).replace(" min", "")} min</div>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <div className="text-slate-500">Aldersgruppe</div>
                      <div className="mt-1 font-medium">{drill.ageGroup || drill.age_group || "Ikke angivet"}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-dashed bg-white p-4 text-sm text-slate-600">
                    {drill.description || "Beskrivelse kommer her."}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </>
    );
  }

  function renderPeriodization() {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Periodisering</h1>
          <p className="text-slate-500">Måneder og uger bygget som mapper, så trænere kan klikke sig ned i planen.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {Object.entries(periodization).map(([month, weeks]) => (
            <section key={month} className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">{month}</h2>
              <div className="space-y-3">
                {weeks.map((week) => (
                  <div key={week} className="rounded-2xl border bg-slate-50 p-4">
                    <div className="font-medium">{week}</div>
                    <div className="mt-1 text-sm text-slate-500">Klikbar uge-mappe i den næste version.</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </>
    );
  }

  function renderPlaceholder(title) {
    return (
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-slate-500">Denne side bygger vi i næste version.</p>
      </div>
    );
  }

  function renderPage() {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();
      case "Hold":
        return renderTeams();
      case "Spillere":
        return renderPlayers();
      case "Spillestil":
        return renderPlayStyle();
      case "Træningsbank":
        return renderDrills();
      case "Periodisering":
        return renderPeriodization();
      default:
        return renderPlaceholder(activePage);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="border-r bg-white p-5">
          <div className="mb-8">
            <div className="text-2xl font-bold tracking-tight">Nordic Coach</div>
            <div className="text-sm text-slate-500">Football Coaching & Development Platform</div>
          </div>

          <nav className="space-y-2 text-sm">
            {navigation.map((item) => (
              <button
                key={item}
                onClick={() => setActivePage(item)}
                className={`w-full rounded-xl px-3 py-2 text-left transition ${activePage === item ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="p-6 md:p-8">{renderPage()}</main>
      </div>
    </div>
  );
}
