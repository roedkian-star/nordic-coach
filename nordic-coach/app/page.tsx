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
  developmentFocus?: string[];
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
  const [selectedWeek, setSelectedWeek] = useState<any>(null);
  const [selectedDrill, setSelectedDrill] = useState<SavedDrill | null>(null);
  const [trainingWeek, setTrainingWeek] = useState("Uge 1");
const [trainingDuration, setTrainingDuration] = useState("90");
const [trainingPitch, setTrainingPitch] = useState("5");
const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
const [selectedKeepers, setSelectedKeepers] = useState<string[]>([]);
const [selectedDefenders, setSelectedDefenders] = useState<string[]>([]);
const [selectedMidfielders, setSelectedMidfielders] = useState<string[]>([]);
const [selectedAttackers, setSelectedAttackers] = useState<string[]>([]);
const [selectedAbsentPlayers, setSelectedAbsentPlayers] = useState<string[]>([]);
  const [selectedSubThemes, setSelectedSubThemes] = useState<string[]>([]);
  const [drillForm, setDrillForm] = useState<DrillForm>({
    title: "",
    category: "Basic teknisk",
    focus: "",
    intensity: "3",
    duration: "15",
    ageGroup: "U11-U12",
    description: "",
  });
  const [focusInput, setFocusInput] = useState("");
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

const periodization = {
  Januar: [
    {
      week: "Uge 1",
      mainTheme: "Opbygningsspil",
      subThemes: ["Pasninger", "Førsteberøring", "Vendespil"],
      focus: ["Pasninger", "Afleveringer", "Førsteberøring"],
    },
    {
      week: "Uge 2",
      mainTheme: "Opbygningsspil",
      subThemes: ["Spilbarhed", "Pasninger"],
      focus: ["Pasninger", "Boldkontrol"],
    },
    {
      week: "Uge 3",
      mainTheme: "Afslutningsspil",
      subThemes: ["Afslutninger", "Løb i felt"],
      focus: ["Afslutninger", "Spark (kraft/præcision)"],
    },
    {
      week: "Uge 4",
      mainTheme: "Forsvarsspil",
      subThemes: ["Positionering", "Kompakthed"],
      focus: ["Positionering", "Kommunikation"],
    },
  ],

  Februar: [
    {
      week: "Uge 5",
      mainTheme: "Opbygningsspil",
      subThemes: ["Vendespil", "Pasninger"],
      focus: ["Afleveringer", "Spilforståelse"],
    },
    {
      week: "Uge 6",
      mainTheme: "Afslutningsspil",
      subThemes: ["Indlæg", "Cutbacks"],
      focus: ["Afslutninger", "Timing i løb"],
    },
    {
      week: "Uge 7",
      mainTheme: "Erobringsspil",
      subThemes: ["Pres", "Genpres"],
      focus: ["Pres og genpres", "Acceleration"],
    },
    {
      week: "Uge 8",
      mainTheme: "Forsvarsspil",
      subThemes: ["Restforsvar", "1v1 defensivt"],
      focus: ["Positionering", "Rolleforståelse"],
    },
  ],

  Marts: [
    {
      week: "Uge 9",
      mainTheme: "Opbygningsspil",
      subThemes: ["Førsteberøring", "Pasninger"],
      focus: ["Førsteberøring", "Afleveringer"],
    },
    {
      week: "Uge 10",
      mainTheme: "Afslutningsspil",
      subThemes: ["Afslutninger", "Indlæg"],
      focus: ["Spark (kraft/præcision)", "Afslutninger"],
    },
    {
      week: "Uge 11",
      mainTheme: "Erobringsspil",
      subThemes: ["Duelspil", "Aggressivitet"],
      focus: ["Pres og genpres", "Styrke"],
    },
    {
      week: "Uge 12",
      mainTheme: "Forsvarsspil",
      subThemes: ["Kompakthed", "Positionering"],
      focus: ["Kommunikation", "Positionering"],
    },
  ],

  April: [
    {
      week: "Uge 13",
      mainTheme: "Opbygningsspil",
      subThemes: ["Pasninger", "Spilbarhed"],
      focus: ["Pasninger", "Boldkontrol"],
    },
    {
      week: "Uge 14",
      mainTheme: "Afslutningsspil",
      subThemes: ["Løb i felt", "Cutbacks"],
      focus: ["Afslutninger", "Timing i løb"],
    },
    {
      week: "Uge 15",
      mainTheme: "Erobringsspil",
      subThemes: ["Genpres", "Pres"],
      focus: ["Pres og genpres", "Kommunikation"],
    },
    {
      week: "Uge 16",
      mainTheme: "Forsvarsspil",
      subThemes: ["Restforsvar", "1v1 defensivt"],
      focus: ["Positionering", "Rolleforståelse"],
    },
  ],

  Maj: [
    {
      week: "Uge 17",
      mainTheme: "Opbygningsspil",
      subThemes: ["Vendespil", "Førsteberøring"],
      focus: ["Førsteberøring", "Spilforståelse"],
    },
    {
      week: "Uge 18",
      mainTheme: "Afslutningsspil",
      subThemes: ["Afslutninger", "Indlæg"],
      focus: ["Afslutninger", "Spark (kraft/præcision)"],
    },
    {
      week: "Uge 19",
      mainTheme: "Erobringsspil",
      subThemes: ["Duelspil", "Aggressivitet"],
      focus: ["Styrke", "Pres og genpres"],
    },
    {
      week: "Uge 20",
      mainTheme: "Forsvarsspil",
      subThemes: ["Kompakthed", "Positionering"],
      focus: ["Kommunikation", "Positionering"],
    },
  ],

  Juni: [
    {
      week: "Uge 21",
      mainTheme: "Opbygningsspil",
      subThemes: ["Pasninger", "Spilbarhed"],
      focus: ["Pasninger", "Afleveringer"],
    },
    {
      week: "Uge 22",
      mainTheme: "Afslutningsspil",
      subThemes: ["Cutbacks", "Løb i felt"],
      focus: ["Afslutninger", "Timing i løb"],
    },
    {
      week: "Uge 23",
      mainTheme: "Erobringsspil",
      subThemes: ["Pres", "Genpres"],
      focus: ["Pres og genpres", "Acceleration"],
    },
    {
      week: "Uge 24",
      mainTheme: "Forsvarsspil",
      subThemes: ["Restforsvar", "1v1 defensivt"],
      focus: ["Positionering", "Rolleforståelse"],
    },
  ],

  Juli: [
    {
      week: "Uge 25",
      mainTheme: "Pause",
      subThemes: ["Sommerpause"],
      focus: ["Fri"],
    },
    {
      week: "Uge 26",
      mainTheme: "Pause",
      subThemes: ["Sommerpause"],
      focus: ["Fri"],
    },
    {
      week: "Uge 27",
      mainTheme: "Pause",
      subThemes: ["Sommerpause"],
      focus: ["Fri"],
    },
    {
      week: "Uge 28",
      mainTheme: "Pause",
      subThemes: ["Sommerpause"],
      focus: ["Fri"],
    },
  ],

  August: [
    {
      week: "Uge 29",
      mainTheme: "Opbygningsspil",
      subThemes: ["Pasninger", "Førsteberøring"],
      focus: ["Pasninger", "Førsteberøring"],
    },
    {
      week: "Uge 30",
      mainTheme: "Afslutningsspil",
      subThemes: ["Afslutninger", "Indlæg"],
      focus: ["Afslutninger", "Spark (kraft/præcision)"],
    },
    {
      week: "Uge 31",
      mainTheme: "Erobringsspil",
      subThemes: ["Pres", "Duelspil"],
      focus: ["Pres og genpres", "Styrke"],
    },
    {
      week: "Uge 32",
      mainTheme: "Forsvarsspil",
      subThemes: ["Positionering", "Kompakthed"],
      focus: ["Kommunikation", "Positionering"],
    },
  ],

  September: [
    {
      week: "Uge 33",
      mainTheme: "Opbygningsspil",
      subThemes: ["Vendespil", "Spilbarhed"],
      focus: ["Afleveringer", "Spilforståelse"],
    },
    {
      week: "Uge 34",
      mainTheme: "Afslutningsspil",
      subThemes: ["Løb i felt", "Cutbacks"],
      focus: ["Timing i løb", "Afslutninger"],
    },
    {
      week: "Uge 35",
      mainTheme: "Erobringsspil",
      subThemes: ["Genpres", "Aggressivitet"],
      focus: ["Pres og genpres", "Acceleration"],
    },
    {
      week: "Uge 36",
      mainTheme: "Forsvarsspil",
      subThemes: ["Restforsvar", "1v1 defensivt"],
      focus: ["Positionering", "Rolleforståelse"],
    },
  ],

  Oktober: [
    {
      week: "Uge 37",
      mainTheme: "Opbygningsspil",
      subThemes: ["Pasninger", "Førsteberøring"],
      focus: ["Pasninger", "Boldkontrol"],
    },
    {
      week: "Uge 38",
      mainTheme: "Afslutningsspil",
      subThemes: ["Indlæg", "Afslutninger"],
      focus: ["Spark (kraft/præcision)", "Afslutninger"],
    },
    {
      week: "Uge 39",
      mainTheme: "Erobringsspil",
      subThemes: ["Pres", "Duelspil"],
      focus: ["Pres og genpres", "Kommunikation"],
    },
    {
      week: "Uge 40",
      mainTheme: "Forsvarsspil",
      subThemes: ["Kompakthed", "Positionering"],
      focus: ["Kommunikation", "Positionering"],
    },
  ],

  November: [
    {
      week: "Uge 41",
      mainTheme: "Opbygningsspil",
      subThemes: ["Spilbarhed", "Vendespil"],
      focus: ["Spilforståelse", "Afleveringer"],
    },
    {
      week: "Uge 42",
      mainTheme: "Afslutningsspil",
      subThemes: ["Cutbacks", "Løb i felt"],
      focus: ["Timing i løb", "Afslutninger"],
    },
    {
      week: "Uge 43",
      mainTheme: "Erobringsspil",
      subThemes: ["Genpres", "Aggressivitet"],
      focus: ["Pres og genpres", "Styrke"],
    },
    {
      week: "Uge 44",
      mainTheme: "Forsvarsspil",
      subThemes: ["Restforsvar", "1v1 defensivt"],
      focus: ["Positionering", "Rolleforståelse"],
    },
  ],

  December: [
    {
      week: "Uge 45",
      mainTheme: "Opbygningsspil",
      subThemes: ["Pasninger", "Førsteberøring"],
      focus: ["Pasninger", "Førsteberøring"],
    },
    {
      week: "Uge 46",
      mainTheme: "Afslutningsspil",
      subThemes: ["Afslutninger", "Indlæg"],
      focus: ["Afslutninger", "Spark (kraft/præcision)"],
    },
    {
      week: "Uge 47",
      mainTheme: "Erobringsspil",
      subThemes: ["Pres", "Genpres"],
      focus: ["Pres og genpres", "Kommunikation"],
    },
    {
      week: "Uge 48",
      mainTheme: "Forsvarsspil",
      subThemes: ["Kompakthed", "Positionering"],
      focus: ["Positionering", "Kommunikation"],
    },
  ],
};
  
const weekPlan = [
  { block: "Opvarmning", title: "3v1 possession", duration: 15 },
  { block: "Teknisk", title: "1v1 retvendt", duration: 20 },
  { block: "Afslutning", title: "Afslutninger 1", duration: 20 },
  { block: "Spil", title: "Horst Wein 4v4", duration: 25 },
];

const materialOptions = [
  "Bolde",
  "Kegler",
  "Stænger",
  "Toppe",
  "Trøjer",
  "Små mål",
  "Store mål",
  "Hække",
  "Vægtstænger",
  "Kettlebells",
  "Måtter",
  "Swiss ball",
];

const focusAreaOptions = [
  "Pasninger",
  "Førsteberøring",
  "Vendespil",
  "Spilbarhed",
  "Afslutninger",
  "Løb i felt",
  "Pres og genpres",
  "Positionering",
  "Kommunikation",
  "Restitution",
  "EP",
  "Styrkevedligehold",
];

const currentTeamPlayerNames = currentPlayers.map((player) => player.name);
const currentWeeksForDropdown = currentWeeks.map((week: any) => week.week);

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
const developmentFocusOptions = {
  "Teknisk profil": [
    "Førsteberøring",
    "Pasninger",
    "Afleveringer",
    "Spark (kraft/præcision)",
    "Driblinger",
    "Boldkontrol",
  ],
  "Taktisk profil": [
    "Spilforståelse",
    "Positionering",
    "Pres og genpres",
    "Kommunikation",
    "Omstilling",
    "Rolleforståelse",
  ],
  "Fysisk profil": [
    "Hurtighed",
    "Acceleration",
    "Styrke",
    "Udholdenhed",
    "Smidighed",
  ],
  "Mental profil": [
    "Fokus / koncentration",
    "Træningsindsats",
    "Holdånd",
    "Læringsvillighed",
    "Selvtillid",
  ],
};
const mainThemeOptions = [
  "Opbygningsspil",
  "Afslutningsspil",
  "Erobringsspil",
  "Forsvarsspil",
   "Pause",
];

const subThemeOptionsByMainTheme = {
  Opbygningsspil: ["Pasninger", "Førsteberøring", "Vendespil", "Spilbarhed"],
  Afslutningsspil: ["Afslutninger", "Indlæg", "Løb i felt", "Cutbacks"],
  Erobringsspil: ["Pres", "Genpres", "Duelspil", "Aggressivitet"],
  Forsvarsspil: ["Positionering", "Kompakthed", "Restforsvar", "1v1 defensivt"],
};  
const currentPlayers = (savedPlayers[selectedTeam] || []).map((player) => ({
  technical: 4,
  tactical: 3,
  physical: 3,
  mental: 4,
  notes: "",
  developmentFocus: [],
  ...player,
}));
  
  const currentTeam = teams.find((team) => team.name === selectedTeam) || teams[0];
  const currentPlayStyle = playStyle.find((group) => group.title === selectedPlayStyleGroup) || playStyle[0];
  const currentWeeks: any[] = periodization[selectedMonth] || [];

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
       const grouped: Record<string, Player[]> = {};
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
            developmentFocus: data.developmentFocus ?? [],
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
      developmentFocus: [],
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
      developmentFocus: selectedPlayer.developmentFocus ?? [],
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
                developmentFocus: selectedPlayer.developmentFocus ?? [],
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
            developmentFocus: selectedPlayer.developmentFocus ?? [],
          }
        : prev
    );

    setSavedPlayersMessage("Spillerprofilen er gemt i databasen.");
  } catch (error) {
    console.error(error);
    setSavedPlayersMessage("Der opstod en fejl ved gemning af profilen.");
  }
}
function handleRemoveDevelopmentFocus(focusToRemove: string) {
  if (!selectedPlayer) return;

  const updatedFocus = (selectedPlayer.developmentFocus ?? []).filter(
    (focus) => focus !== focusToRemove
  );

  setSelectedPlayer({
    ...selectedPlayer,
    developmentFocus: updatedFocus,
  });
}
function handleAddDevelopmentFocus() {
  const value = focusInput.trim();

  if (!value) return;
  if (!selectedPlayer) return;

  const currentFocus = selectedPlayer.developmentFocus ?? [];

  if (currentFocus.includes(value)) {
    setFocusInput("");
    return;
  }

  const updatedFocus = [...currentFocus, value];

  // 🔥 vigtigt: brug prev (sikrer korrekt state)
  setSelectedPlayer((prev) =>
    prev
      ? {
          ...prev,
          developmentFocus: updatedFocus,
        }
      : prev
  );

  setFocusInput("");
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
    {(player.developmentFocus ?? []).length > 0 ? (
      (player.developmentFocus ?? []).map((focus) => (
        <span key={focus} className="player-tag">
          {focus}
        </span>
      ))
    ) : (
      <span className="player-tag">Ingen fokus valgt</span>
    )}
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
        <button className="primary-btn" onClick={() => setActivePage("Spillere")}>
          Gå til spillere
        </button>
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
        <button className="secondary-btn" onClick={() => setActivePage("Spillere")}>
          ← Tilbage til spillere
        </button>
      </div>

      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {selectedPlayer.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="profile-name">{selectedPlayer.name}</div>
              <div className="profile-sub">
                {selectedPlayer.position} · {selectedPlayer.team || selectedTeam} · Årgang {selectedPlayer.year}
              </div>
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
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, [item.key]: e.target.value }))
                  }
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

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <select
              className="form-input"
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
            >
              <option value="">Vælg fokuspunkt</option>

              {Object.entries(developmentFocusOptions).map(([category, items]) => (
                <optgroup key={category} label={category}>
                  {items.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <button
              type="button"
              className="primary-btn"
              onClick={handleAddDevelopmentFocus}
            >
              Tilføj
            </button>
          </div>

          <div className="player-tags">
            {(selectedPlayer.developmentFocus ?? []).length > 0 ? (
              (selectedPlayer.developmentFocus ?? []).map((focus) => (
                <div
                  key={focus}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginRight: 8,
                    marginBottom: 8,
                    background: "#f1f5f9",
                    borderRadius: 9999,
                    padding: "6px 10px",
                  }}
                >
                  <span className="player-tag" style={{ margin: 0 }}>
                    {focus}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveDevelopmentFocus(focus)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <span className="player-tag">Ingen fokus valgt</span>
            )}
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
            <button className="primary-btn" onClick={handleSaveProfile}>
              Gem profil
            </button>
            {savedPlayersMessage ? (
              <div className="form-feedback">{savedPlayersMessage}</div>
            ) : null}
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
  
function toggleSelection(
  value: string,
  selected: string[],
  setSelected: React.Dispatch<React.SetStateAction<string[]>>
) {
  setSelected((prev) =>
    prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
  );
}
function renderTraeningsbank() {
  const combinedDrills = [
    ...savedDrills,
    ...drillLibrary.filter(
      (drill) => !savedDrills.some((saved) => saved.title === drill.title)
    ),
  ];

  const selectedWeekFocus = selectedWeek?.focus || [];
  const selectedWeekLabel = selectedWeek?.week || "Uge ikke valgt";

  return (
    <>
      <h1 className="page-title">Træningsskabelon</h1>
      <p className="page-text">
        Træningspas vist som et rigtigt trænerark, så øvelser og fokus står som i den skabelon du sendte.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 1fr",
          gap: 0,
          border: "1px solid #94a3b8",
          background: "#fff",
          marginTop: 24,
        }}
      >
        <div
          style={{
            borderRight: "1px solid #94a3b8",
            padding: 16,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Træning</div>

          <div style={{ marginBottom: 12 }}>
            <strong>Cyklus / uge:</strong>
            <select
              value={trainingWeek}
              onChange={(e) => setTrainingWeek(e.target.value)}
              className="form-input"
              style={{ marginTop: 6 }}
            >
              {currentWeeksForDropdown.map((week) => (
                <option key={week} value={week}>
                  {week}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>Varighed:</strong>
            <select
              value={trainingDuration}
              onChange={(e) => setTrainingDuration(e.target.value)}
              className="form-input"
              style={{ marginTop: 6 }}
            >
              <option value="60">60 min</option>
              <option value="75">75 min</option>
              <option value="90">90 min</option>
              <option value="105">105 min</option>
              <option value="120">120 min</option>
            </select>
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>Bane:</strong>
            <select
              value={trainingPitch}
              onChange={(e) => setTrainingPitch(e.target.value)}
              className="form-input"
              style={{ marginTop: 6 }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pitch) => (
                <option key={pitch} value={String(pitch)}>
                  Bane {pitch}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 18 }}>
            <strong>Materialer:</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {materialOptions.map((item) => {
                const active = selectedMaterials.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleSelection(item, selectedMaterials, setSelectedMaterials)}
                    style={{
                      borderRadius: 9999,
                      border: active ? "1px solid #0f172a" : "1px solid #cbd5e1",
                      background: active ? "#0f172a" : "#ffffff",
                      color: active ? "#ffffff" : "#334155",
                      padding: "6px 10px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <strong>Fokus:</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {focusAreaOptions.map((item) => {
                const active = selectedFocusAreas.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleSelection(item, selectedFocusAreas, setSelectedFocusAreas)}
                    style={{
                      borderRadius: 9999,
                      border: active ? "1px solid #0f172a" : "1px solid #cbd5e1",
                      background: active ? "#0f172a" : "#ffffff",
                      color: active ? "#ffffff" : "#334155",
                      padding: "6px 10px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <hr style={{ margin: "18px 0", borderColor: "#94a3b8" }} />

          <div>
            <strong>Keepere</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {currentTeamPlayerNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleSelection(name, selectedKeepers, setSelectedKeepers)}
                  style={{
                    borderRadius: 9999,
                    border: selectedKeepers.includes(name) ? "1px solid #0f172a" : "1px solid #cbd5e1",
                    background: selectedKeepers.includes(name) ? "#0f172a" : "#ffffff",
                    color: selectedKeepers.includes(name) ? "#ffffff" : "#334155",
                    padding: "6px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <strong>Forsvar</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {currentTeamPlayerNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleSelection(name, selectedDefenders, setSelectedDefenders)}
                  style={{
                    borderRadius: 9999,
                    border: selectedDefenders.includes(name) ? "1px solid #0f172a" : "1px solid #cbd5e1",
                    background: selectedDefenders.includes(name) ? "#0f172a" : "#ffffff",
                    color: selectedDefenders.includes(name) ? "#ffffff" : "#334155",
                    padding: "6px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <strong>Midtbane</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {currentTeamPlayerNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleSelection(name, selectedMidfielders, setSelectedMidfielders)}
                  style={{
                    borderRadius: 9999,
                    border: selectedMidfielders.includes(name) ? "1px solid #0f172a" : "1px solid #cbd5e1",
                    background: selectedMidfielders.includes(name) ? "#0f172a" : "#ffffff",
                    color: selectedMidfielders.includes(name) ? "#ffffff" : "#334155",
                    padding: "6px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <strong>Angribere</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {currentTeamPlayerNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleSelection(name, selectedAttackers, setSelectedAttackers)}
                  style={{
                    borderRadius: 9999,
                    border: selectedAttackers.includes(name) ? "1px solid #0f172a" : "1px solid #cbd5e1",
                    background: selectedAttackers.includes(name) ? "#0f172a" : "#ffffff",
                    color: selectedAttackers.includes(name) ? "#ffffff" : "#334155",
                    padding: "6px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <hr style={{ margin: "18px 0", borderColor: "#94a3b8" }} />

          <div>
            <strong>SKADER / AFBUD</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {currentTeamPlayerNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleSelection(name, selectedAbsentPlayers, setSelectedAbsentPlayers)}
                  style={{
                    borderRadius: 9999,
                    border: selectedAbsentPlayers.includes(name) ? "1px solid #b91c1c" : "1px solid #cbd5e1",
                    background: selectedAbsentPlayers.includes(name) ? "#fee2e2" : "#ffffff",
                    color: selectedAbsentPlayers.includes(name) ? "#b91c1c" : "#334155",
                    padding: "6px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            borderRight: "1px solid #94a3b8",
            padding: 16,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700 }}>Midterkolonne</div>
          <div style={{ marginTop: 8 }}>Her bygger vi næste trin med øvelsestid, varighed og intensitet.</div>
        </div>

        <div
          style={{
            padding: 16,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700 }}>Højre kolonne</div>
          <div style={{ marginTop: 8 }}>
            <strong>INFO:</strong>
          </div>
        </div>
      </div>
    </>
  );
}

function renderPeriodisering() {
  const availableSubThemes =
    subThemeOptionsByMainTheme[
      selectedWeek?.mainTheme as keyof typeof subThemeOptionsByMainTheme
    ] || [];

  return (
    <>
      <h1 className="page-title">Periodisering</h1>
      <p className="page-text">
        Vælg måned i venstre kolonne. Uger, temaer og udviklingsfokus vises i midten.
      </p>

      <div className="hold-layout">
        <div className="hold-sidebar">
          <div className="section-title">Måneder</div>
          <div className="hold-list">
            {Object.keys(periodization).map((month) => {
              const active = selectedMonth === month;

              return (
                <button
                  key={month}
                  onClick={() => {
                    setSelectedMonth(month);
                    setSelectedWeek(null);
                  }}
                  className={`hold-list-btn ${active ? "active" : ""}`}
                >
                  <div>{month}</div>
                  <div className="hold-list-year">
                    {(periodization[month] || []).length} uger
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hold-main">
<div className="hold-header-card">
  <div>
    <div className="hold-main-title">{selectedMonth}</div>
    <div className="hold-main-sub">
      {(currentWeeks || []).length} uger i denne måned
    </div>
  </div>

  <button
    type="button"
    className="primary-btn"
    disabled
  >
    Kommer senere
  </button>
</div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Aktiv måned</div>
              <div className="stat-value">{selectedMonth}</div>
              <div className="stat-help">Planlægningsperiode</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Uger</div>
              <div className="stat-value">{(currentWeeks || []).length}</div>
              <div className="stat-help">I valgt måned</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Valgt uge</div>
              <div className="stat-value">{selectedWeek?.week || "-"}</div>
              <div className="stat-help">Aktuel arbejdsuge</div>
            </div>
          </div>

          <div className="dashboard-card" style={{ marginTop: 24 }}>
            <div className="section-title">Uger i {selectedMonth}</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 20,
                marginTop: 16,
              }}
            >
              {(currentWeeks || []).map((week: any) => {
                const active = selectedWeek?.week === week.week;

                return (
                  <button
                    key={week.week}
                    type="button"
                  onClick={() => {
                  setSelectedWeek(week);
                  setSelectedSubThemes(week.subThemes || []);
                   }}
                    style={{
                      border: active ? "1px solid #0f172a" : "1px solid #e2e8f0",
                      background: active ? "#0f172a" : "#ffffff",
                      color: active ? "#ffffff" : "#0f172a",
                      borderRadius: 28,
                      padding: 24,
                      textAlign: "left",
                      minHeight: 200,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: active
                        ? "0 10px 25px rgba(0,0,0,0.2)"
                        : "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          marginBottom: 12,
                          lineHeight: 1,
                        }}
                      >
                        {week.week}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: active ? "#cbd5e1" : "#64748b",
                          marginBottom: 6,
                        }}
                      >
                        Overordnet tema
                      </div>

                      <select
                        value={week.mainTheme}
                        disabled
                        style={{
                          width: "100%",
                          borderRadius: 14,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#0f172a",
                          padding: "10px 12px",
                          fontSize: 14,
                          marginBottom: 14,
                        }}
                      >
                        {mainThemeOptions.map((theme) => (
                          <option key={theme} value={theme}>
                            {theme}
                          </option>
                        ))}
                      </select>

                      <div
                        style={{
                          fontSize: 13,
                          color: active ? "#cbd5e1" : "#64748b",
                          marginBottom: 4,
                        }}
                      >
                        Underfokus
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: active ? "#94a3b8" : "#94a3b8",
                          marginBottom: 10,
                        }}
                      >
                        Styres af: {week.mainTheme}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                    {(availableSubThemes || []).map((sub: string) => {
  const active = selectedSubThemes.includes(sub);

  return (
    <span
      key={sub}
      onClick={() => {
        if (active) {
          setSelectedSubThemes((prev) => prev.filter((s) => s !== sub));
        } else {
          setSelectedSubThemes((prev) => [...prev, sub]);
        }
      }}
      style={{
        cursor: "pointer",
        borderRadius: 9999,
        border: active ? "1px solid #0f172a" : "1px solid #cbd5e1",
        background: active ? "#0f172a" : "#ffffff",
        color: active ? "#ffffff" : "#334155",
        padding: "8px 12px",
        fontSize: 13,
        transition: "all 0.2s ease",
      }}
    >
      {sub}
    </span>
  );
})}
                    
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedWeek ? (
            <div
              className="dashboard-card"
              style={{
                marginTop: 32,
                padding: 28,
                borderRadius: 28,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              <div
                className="hold-header-card"
                style={{
                  marginTop: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div className="text-sm text-slate-500">Valgt uge</div>

                  <div className="hold-main-title">{selectedWeek.week}</div>

                  <div className="hold-main-sub">
                    Aktiv uge i {selectedMonth}
                  </div>
                </div>

               <button
  type="button"
  className="primary-btn"
  disabled
>
  Kommer senere
</button>
              </div>

              <div className="stats-grid" style={{ marginTop: 24 }}>
                <div className="stat-card">
                  <div className="stat-label">Overordnet tema</div>
                  <div style={{ marginTop: 8 }}>
                    <select
                      value={selectedWeek.mainTheme}
                      disabled
                      className="form-input"
                    >
                      {mainThemeOptions.map((theme) => (
                        <option key={theme} value={theme}>
                          {theme}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="stat-help">Låst af struktur</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Underfokus</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#94a3b8",
                      marginTop: 6,
                      marginBottom: 10,
                    }}
                  >
                    Valgmuligheder styres af: {selectedWeek.mainTheme}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <select
                      value={(selectedWeek.subThemes || [])[0] || ""}
                      disabled
                      className="form-input"
                    >
                      {availableSubThemes.map((sub: string) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Udviklingsfokus</div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {(selectedWeek.focus || []).map((f: string) => (
                      <span
                        key={f}
                        style={{
                          borderRadius: 9999,
                          background: "#0f172a",
                          color: "#ffffff",
                          padding: "6px 10px",
                          fontSize: 12,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dashboard-card" style={{ marginTop: 24 }}>
                <div className="section-title">Underfokus i denne uge</div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  {(selectedWeek.subThemes || []).map((sub: string) => (
                    <span
                      key={sub}
                      style={{
                        borderRadius: 9999,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#334155",
                        padding: "8px 12px",
                        fontSize: 13,
                      }}
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
  
function renderPlaceholder(title: string) {
  return (
    <>
      <PageHeader
        title={title}
        text="Dette modul bliver bygget i næste version af Nordic Coach."
      />
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
