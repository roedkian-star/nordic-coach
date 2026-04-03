"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

type Player = {
  id?: string;
  name: string;
  position: string;
  year: number;
  team?: string;
  technical?: number;
  tactical?: number;
  physical?: number;
  mental?: number;
  notes?: string;
};

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
  const [playerForm, setPlayerForm] = useState({
  name: "",
  year: "2015",
  position: "CM",
  team: "U11",
});

  const [savedPlayers, setSavedPlayers] = useState<Record<string, Player[]>>({});
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [savedPlayersMessage, setSavedPlayersMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
  technical: "4",
  tactical: "3",
  physical: "3",
  mental: "4",
  notes: "",
});
  
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

const currentPlayers = (savedPlayers[selectedTeam] || []).map((player) => ({
  technical: 4,
  tactical: 3,
  physical: 3,
  mental: 4,
  notes: "",
  ...player,
}));
  
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

    async function loadPlayers() {
      try {
        const snapshot = await getDocs(collection(db, "players"));
        const grouped: Record<string, { id?: string; name: string; position: string; year: number; team?: string; technical?: number; tactical?: number; physical?: number; mental?: number; notes?: string }[]> = {};
        snapshot.docs.forEach((playerDoc) => {
          const data = playerDoc.data() as any;
          const team = data.team || "U11";
          if (!grouped[team]) grouped[team] = [];
          grouped[team].push({
            id: playerDoc.id,
            name: data.name,
            position: data.position,
            year: data.year,
            team,
            technical: data.technical ?? 4,
            tactical: data.tactical ?? 3,
            physical: data.physical ?? 3,
            mental: data.mental ?? 4,
            notes: data.notes ?? "",
          });
        });
        setSavedPlayers(grouped);
      } catch (error) {
        console.error(error);
      }
    }

    loadDrills();
    loadPlayers();
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

  async function handleCreatePlayer(e: React.FormEvent) {
    e.preventDefault();
    setSavedPlayersMessage("");

    const newPlayer = {
      name: playerForm.name,
      position: playerForm.position,
      year: Number(playerForm.year),
      team: playerForm.team,
      technical: 4,
      tactical: 3,
      physical: 3,
      mental: 4,
      notes: "",
    };

    try {
      const ref = await addDoc(collection(db, "players"), {
        ...newPlayer,
        createdAt: serverTimestamp(),
      });

      setSavedPlayers((prev) => ({
        ...prev,
        [playerForm.team]: [{ id: ref.id, ...newPlayer }, ...(prev[playerForm.team] || [])],
      }));

      setSelectedTeam(playerForm.team);
      setPlayerForm({
        name: "",
        year: playerForm.year,
        position: "CM",
        team: playerForm.team,
      });
      setSavedPlayersMessage("Spilleren er gemt i databasen.");
    } catch (error) {
      console.error(error);
      setSavedPlayersMessage("Der opstod en fejl ved gemning af spilleren.");
    }
  }

  async function handleSaveProfile() {
    if (!selectedPlayer?.id) return;

    try {
      await updateDoc(doc(db, "players", selectedPlayer.id), {
        technical: Number(profileForm.technical),
        tactical: Number(profileForm.tactical),
        physical: Number(profileForm.physical),
        mental: Number(profileForm.mental),
        notes: profileForm.notes,
      });

      setSavedPlayers((prev) => {
        const teamKey = selectedPlayer.team || selectedTeam;
        return {
          ...prev,
          [teamKey]: (prev[teamKey] || []).map((player) =>
            player.id === selectedPlayer.id
              ? {
                  ...player,
                  technical: Number(profileForm.technical),
                  tactical: Number(profileForm.tactical),
                  physical: Number(profileForm.physical),
                  mental: Number(profileForm.mental),
                  notes: profileForm.notes,
                }
              : player
          ),
        };
      });

      setSelectedPlayer((prev) =>
        prev
          ? {
              ...prev,
              technical: Number(profileForm.technical),
              tactical: Number(profileForm.tactical),
              physical: Number(profileForm.physical),
              mental: Number(profileForm.mental),
              notes: profileForm.notes,
            }
          : prev
      );
      setSavedPlayersMessage("Spillerprofilen er gemt i databasen.");
    } catch (error) {
      console.error(error);
      setSavedPlayersMessage("Der opstod en fejl ved gemning af profilen.");
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
      <h1 className="page-title">Dashboard</h1>
      <p className="page-text">
        Første prototype til Vejle Boldklub. Navigation ligger i venstre side, og arbejdsfladen i midten ændrer sig efter det modul du vælger.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Aktiv klub</div>
          <div className="stat-value">Vejle Boldklub</div>
          <div className="stat-help">Multi-klub struktur klar</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Hold</div>
          <div className="stat-value">15</div>
          <div className="stat-help">U6 til Senior 1</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Øvelser</div>
          <div className="stat-value">{savedDrills.length + drillLibrary.length}</div>
          <div className="stat-help">Testdata + database</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="section-title">Holdoversigt</div>
          <div className="team-grid">
            {teams.slice(0, 9).map((team) => (
              <button
                key={team.name}
                onClick={() => {
                  setSelectedTeam(team.name);
                  setActivePage("Hold");
                }}
                className="team-card-button"
              >
                <div className="team-card">
                  <div className="team-card-title">{team.name}</div>
                  <div className="team-card-sub">Årgang {team.age}</div>
                  <div className="team-card-meta">
                    {team.format} · {team.training}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-title">Ugens træning</div>
          <div className="training-list">
            {weekPlan.map((item) => (
              <div key={item.title} className="training-item">
                <div className="training-top">
                  <div>
                    <div className="training-block">{item.block}</div>
                    <div className="training-title">{item.title}</div>
                  </div>
                  <div className="training-duration">{item.duration} min</div>
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
      <h1 className="page-title">Hold</h1>
      <p className="page-text">
        Vælg et hold i venstre kolonne. Detaljer, spillere og seneste træningspas vises i midten.
      </p>

      <div className="hold-layout">
        <div className="hold-sidebar">
          <div className="section-title">Alle hold</div>
          <div className="hold-list">
            {teams.map((team) => {
              const active = selectedTeam === team.name;
              return (
                <button
                  key={team.name}
                  onClick={() => setSelectedTeam(team.name)}
                  className={`hold-list-btn ${active ? "active" : ""}`}
                >
                  <div>{team.name}</div>
                  <div className="hold-list-year">Årgang {team.age}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hold-main">
          <div className="hold-header-card">
            <div>
              <div className="hold-main-title">{currentTeam.name}</div>
              <div className="hold-main-sub">
                Årgang {currentTeam.age} · {currentTeam.format} · {currentTeam.training}
              </div>
            </div>

            <button
              onClick={() => setActivePage("Spillere")}
              className="primary-btn"
            >
              Se spillere
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Format</div>
              <div className="stat-value">{currentTeam.format}</div>
              <div className="stat-help">Kampformat</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Varighed</div>
              <div className="stat-value">{currentTeam.training}</div>
              <div className="stat-help">Standard træningstid</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Spillere</div>
              <div className="stat-value">{currentPlayers.length}</div>
              <div className="stat-help">Testspillere i denne version</div>
            </div>
          </div>

          <div className="dashboard-card" style={{ marginTop: 24 }}>
            <div className="section-title">Seneste træningsblokke</div>
            <div className="training-list">
              {weekPlan.map((item) => (
                <div key={item.title} className="training-item">
                  <div className="training-top">
                    <div>
                      <div className="training-block">{item.block}</div>
                      <div className="training-title">{item.title}</div>
                    </div>
                    <div className="training-duration">{item.duration} min</div>
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
    const developmentSummary = [
      { label: "Teknik", value: "4/5" },
      { label: "Taktik", value: "3/5" },
      { label: "Fysik", value: "3/5" },
      { label: "Mental", value: "4/5" },
    ];

    return (
      <>
        <h1 className="page-title">Spillere</h1>
        <p className="page-text">
          Spilleroversigt med holdvalg, profilkort og udviklingsområder.
        </p>

        <div className="players-layout">
          <div className="players-sidebar">
            <div className="section-title">Ny spiller</div>
            <div className="players-help">Opret en spiller og tilknyt hende til et hold</div>

            <form onSubmit={handleCreatePlayer} className="player-form">
              <div className="form-group">
                <label className="form-label">Navn</label>
                <input
                  className="form-input"
                  value={playerForm.name}
                  onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                  placeholder="Fx Emma Hansen"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hold</label>
                  <select
                    className="form-input"
                    value={playerForm.team}
                    onChange={(e) => setPlayerForm({ ...playerForm, team: e.target.value })}
                  >
                    {teams.map((team) => (
                      <option key={team.name} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Position</label>
                  <select
                    className="form-input"
                    value={playerForm.position}
                    onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                  >
                    <option value="GK">Keeper</option>
                    <option value="CB">Forsvar</option>
                    <option value="CM">Midtbane</option>
                    <option value="Wing">Kant</option>
                    <option value="ST">Angriber</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Årgang</label>
                <input
                  className="form-input"
                  value={playerForm.year}
                  onChange={(e) => setPlayerForm({ ...playerForm, year: e.target.value })}
                  placeholder="2015"
                  required
                />
              </div>

              <button type="submit" className="primary-btn form-button">Gem spiller</button>
              {savedPlayersMessage ? <div className="form-feedback">{savedPlayersMessage}</div> : null}
            </form>

            <div className="section-title" style={{ marginTop: 24 }}>Vælg hold</div>
            <div className="players-help">Filtrer spillere efter årgang</div>

            <div className="players-team-list">
              {teams.map((team) => {
                const active = selectedTeam === team.name;
                return (
                  <button
                    key={team.name}
                    onClick={() => setSelectedTeam(team.name)}
                    className={`players-team-btn ${active ? "active" : ""}`}
                  >
                    <div>{team.name}</div>
                    <div className="players-team-year">Årgang {team.age}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="players-main">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Aktivt hold</div>
                <div className="stat-value">{selectedTeam}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Spillere</div>
                <div className="stat-value">{currentPlayers.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Gennemsnit</div>
                <div className="stat-value">3.5/5</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Status</div>
                <div className="stat-value">Klar</div>
              </div>
            </div>

            <div className="players-grid">
              {currentPlayers.map((player) => (
                <div key={`${player.name}-${player.position}-${player.year}`} className="player-card">
                  <div className="player-top">
                    <div className="player-avatar">
                      {player.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="player-name">{player.name}</div>
                      <div className="player-sub">
                        {player.position} · Årgang {player.year}
                      </div>
                    </div>
                  </div>

                  <div className="player-stats">
  <div className="player-stat-row">
    <span>Teknik</span>
    <strong>{player.technical ?? 4}/5</strong>
  </div>
  <div className="player-stat-row">
    <span>Taktik</span>
    <strong>{player.tactical ?? 3}/5</strong>
  </div>
  <div className="player-stat-row">
    <span>Fysik</span>
    <strong>{player.physical ?? 3}/5</strong>
  </div>
  <div className="player-stat-row">
    <span>Mental</span>
    <strong>{player.mental ?? 4}/5</strong>
  </div>
</div>
            

                  <div className="player-focus-box">
                    <div className="player-focus-title">Udviklingsfokus</div>
                    <div className="player-tags">
                      <span className="player-tag">Førsteberøring</span>
                      <span className="player-tag">Overblik</span>
                      <span className="player-tag">Duelspil</span>
                    </div>
                  </div>

                  <div className="player-actions">
                    <button
                      className="primary-btn"
                      onClick={() => {
                        setSelectedPlayer(player);
                        setProfileForm({
                          technical: String(player.technical ?? 4),
                          tactical: String(player.tactical ?? 3),
                          physical: String(player.physical ?? 3),
                          mental: String(player.mental ?? 4),
                          notes: player.notes ?? "",
                        });
                        setActivePage("Spillerprofil");
                      }}
                    >
                      Se profil
                    </button>
                    <button className="secondary-btn">Vurder</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderSpillerprofil() {
    if (!selectedPlayer) {
      return (
        <>
          <h1 className="page-title">Spillerprofil</h1>
          <p className="page-text">Vælg først en spiller fra spillersiden.</p>
          <button className="primary-btn" onClick={() => setActivePage("Spillere")}>Gå til spillere</button>
        </>
      );
    }

    const profileStats = [
      { key: "technical", label: "Teknik", value: profileForm.technical },
      { key: "tactical", label: "Taktik", value: profileForm.tactical },
      { key: "physical", label: "Fysik", value: profileForm.physical },
      { key: "mental", label: "Mental", value: profileForm.mental },
    ];

    return (
      <>
        <div className="profile-topbar">
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>Spillerprofil</h1>
            <p className="page-text">Redigér vurdering og noter, og gem dem direkte i databasen.</p>
          </div>
          <button className="secondary-btn" onClick={() => setActivePage("Spillere")}>← Tilbage til spillere</button>
        </div>

        <div className="profile-layout">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {selectedPlayer.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div className="profile-name">{selectedPlayer.name}</div>
                <div className="profile-sub">{selectedPlayer.position} · {selectedPlayer.team || selectedTeam} · Årgang {selectedPlayer.year}</div>
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-box">
                <div className="profile-info-label">Hold</div>
                <div className="profile-info-value">{selectedPlayer.team || selectedTeam}</div>
              </div>
              <div className="profile-info-box">
                <div className="profile-info-label">Position</div>
                <div className="profile-info-value">{selectedPlayer.position}</div>
              </div>
              <div className="profile-info-box">
                <div className="profile-info-label">Årgang</div>
                <div className="profile-info-value">{selectedPlayer.year}</div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <div className="section-title">Vurdering</div>
            <div className="profile-form-grid">
              {profileStats.map((item) => (
                <div key={item.key} className="profile-form-group">
                  <label className="form-label">{item.label}</label>
                  <select
                    className="form-input"
                    value={item.value}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, [item.key]: e.target.value }))}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <div className="section-title">Udviklingsfokus</div>
            <div className="player-tags">
              <span className="player-tag">Førsteberøring</span>
              <span className="player-tag">Overblik</span>
              <span className="player-tag">Duelspil</span>
              <span className="player-tag">Retvendt modtagelse</span>
            </div>
          </div>

          <div className="profile-card">
            <div className="section-title">Trænernoter</div>
            <textarea
              className="profile-notes-input"
              value={profileForm.notes}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Skriv noter om spillerens udvikling, fokusområder og næste skridt"
            />
            <div className="profile-actions">
              <button className="primary-btn" onClick={handleSaveProfile}>Gem profil</button>
              {savedPlayersMessage ? <div className="form-feedback">{savedPlayersMessage}</div> : null}
            </div>
          </div>
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
      case "Spillerprofil":
        return renderSpillerprofil();
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
  <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-title">Nordic Coach</div>
      <div className="sidebar-subtitle">Football Coaching & Development Platform</div>

      <div className="club-box">
        <div className="club-label">Aktiv klub</div>
        <div className="club-name">Vejle Boldklub</div>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const active = activePage === item;
          return (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              className={`sidebar-btn ${active ? "active" : ""}`}
            >
              {item}
            </button>
          );
        })}
      </nav>
    </aside>

    <main className="main-content">
      <div className="content-card">
        {renderPage()}
      </div>
    </main>
  </div>
);
}
