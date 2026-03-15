"use client";

import { useMemo, useState } from "react";

export default function Page() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedTeam, setSelectedTeam] = useState("U11");

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

  const drills = [
    { title: "1v1 retvendt", category: "Basic teknisk", focus: "Førsteberøring", intensity: 3, duration: "12 min" },
    { title: "3v1 possession", category: "Pasningsspil", focus: "Afleveringer og orientering", intensity: 3, duration: "15 min" },
    { title: "Afslutninger 1", category: "Afslutninger", focus: "Inderside og vrist", intensity: 4, duration: "15 min" },
    { title: "Horst Wein 4v4", category: "Basic taktisk", focus: "Vende spillet og beslutninger", intensity: 4, duration: "20 min" },
    { title: "2v1 i to zoner", category: "Basic taktisk", focus: "Spille eller drible", intensity: 4, duration: "15 min" },
  ];

  const periodization: Record<string, string[]> = {
    Januar: ["Uge 1 – Pasningsspil", "Uge 2 – Førsteberøring", "Uge 3 – Afslutninger", "Uge 4 – Vende spillet"],
    Februar: ["Uge 5 – Dybde og bredde", "Uge 6 – Spil og løb", "Uge 7 – Gennembrudsstrategier", "Uge 8 – Pres"],
  };

  const weekPlan = [
    { block: "Opvarmning", title: "3v1 possession", duration: 15 },
    { block: "Teknisk", title: "1v1 retvendt", duration: 20 },
    { block: "Afslutning", title: "Afslutninger 1", duration: 20 },
    { block: "Spil", title: "Horst Wein 4v4", duration: 25 },
  ];

  const navigation = ["Dashboard", "Hold", "Spillere", "Spillestil", "Træningsbank", "Periodisering", "Video bibliotek", "AI Træner", "Spillerudvikling", "Indstillinger"];

  const currentTeam = useMemo(() => teams.find((t) => t.name === selectedTeam) || teams[0], [selectedTeam]);
  const players = teamPlayers[selectedTeam] || teamPlayers.U11;

  const pageHeader = (title: string, subtitle: string) => (
    <div className="header">
      <div>
        <h2>{title}</h2>
        <div className="muted">{subtitle}</div>
      </div>
      <div className="club-box">
        <div className="small">Aktiv klub</div>
        <div><strong>Vejle Boldklub</strong></div>
      </div>
    </div>
  );

  function renderDashboard() {
    return (
      <>
        {pageHeader("Dashboard", "Første prototype til Vejle Boldklub, bygget så andre klubber kan komme på senere.")}
        <div className="grid grid-3">
          <section className="card">
            <div className="row" style={{justifyContent:"space-between", marginBottom: 16}}>
              <h3>Holdoversigt</h3>
              <span className="muted">15 hold</span>
            </div>
            <div className="team-grid">
              {teams.map((team) => (
                <div key={team.name} className="team-item">
                  <button onClick={() => { setSelectedTeam(team.name); setActivePage("Hold"); }}>
                    <div><strong>{team.name}</strong></div>
                    <div className="muted">Årgang {team.age}</div>
                    <div className="small" style={{marginTop:8}}>{team.format} · {team.training}</div>
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section className="card">
            <h3>Ugens træning</h3>
            <div className="list">
              {weekPlan.map((item) => (
                <div key={item.title} className="list-item">
                  <div className="small">{item.block}</div>
                  <div><strong>{item.title}</strong></div>
                  <div className="muted">{item.duration} min</div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="grid grid-2" style={{marginTop:20}}>
          <section className="card">
            <h3>Spillestil</h3>
            {playStyle.map((group) => (
              <div key={group.title} className="section-box" style={{marginBottom:12}}>
                <div><strong>{group.title}</strong></div>
                <div style={{marginTop:8}}>
                  {group.sections.map((section) => <span className="badge" key={section.title}>{section.title}</span>)}
                </div>
              </div>
            ))}
          </section>
          <section className="card">
            <div className="row" style={{justifyContent:"space-between", marginBottom:16}}>
              <h3>Træningsbank</h3>
              <span className="muted">Testdata</span>
            </div>
            <div className="list">
              {drills.map((drill) => (
                <div key={drill.title} className="list-item">
                  <div className="row" style={{justifyContent:"space-between", alignItems:"flex-start"}}>
                    <div>
                      <div><strong>{drill.title}</strong></div>
                      <div className="muted">{drill.category}</div>
                    </div>
                    <span className="badge">Intensitet {drill.intensity}/5</span>
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
        {pageHeader("Hold", "Alle hold i klubben med årgang, kampformat og standard træningstid.")}
        <div className="grid" style={{gridTemplateColumns: "320px 1fr"}}>
          <section className="card">
            <h3>Holdliste</h3>
            <div className="nav" style={{marginTop:12}}>
              {teams.map((team) => (
                <button key={team.name} onClick={() => setSelectedTeam(team.name)} className={selectedTeam === team.name ? "active" : ""}>
                  <div><strong>{team.name}</strong></div>
                  <div className={selectedTeam === team.name ? "small" : "muted"}>Årgang {team.age}</div>
                </button>
              ))}
            </div>
          </section>
          <section className="card">
            <div className="row" style={{justifyContent:"space-between", alignItems:"flex-start"}}>
              <div>
                <h3 style={{fontSize:28, marginBottom:4}}>{currentTeam.name}</h3>
                <div className="muted">Årgang {currentTeam.age} · {currentTeam.format} · {currentTeam.training}</div>
              </div>
              <button className="primary-btn" onClick={() => setActivePage("Spillere")}>Se spillere</button>
            </div>
            <div className="stats">
              <div className="stat"><div className="muted">Træningsformat</div><div><strong>{currentTeam.format}</strong></div></div>
              <div className="stat"><div className="muted">Standard varighed</div><div><strong>{currentTeam.training}</strong></div></div>
              <div className="stat"><div className="muted">Spillere i prototype</div><div><strong>{players.length}</strong></div></div>
            </div>
            <div style={{marginTop:24}}>
              <h3>Seneste træningspas</h3>
              <div className="list">
                {weekPlan.map((item) => (
                  <div key={item.title} className="list-item row" style={{justifyContent:"space-between"}}>
                    <div>
                      <div><strong>{item.title}</strong></div>
                      <div className="muted">{item.block}</div>
                    </div>
                    <div className="muted">{item.duration} min</div>
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
        <div className="header">
          <div>
            <h2>Spillere</h2>
            <div className="muted">Midlertidige testspillere til prototypen for {selectedTeam}.</div>
          </div>
          <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="select">
            {teams.map((team) => <option key={team.name} value={team.name}>{team.name}</option>)}
          </select>
        </div>
        <div className="players-grid">
          {players.map((player) => (
            <section key={player.name} className="card">
              <div className="row">
                <div className="avatar">{player.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
                <div>
                  <div><strong>{player.name}</strong></div>
                  <div className="muted">{selectedTeam} · Årgang {player.year}</div>
                </div>
              </div>
              <div className="meta">
                <div className="meta-item"><span className="muted">Primær position</span><strong>{player.position}</strong></div>
                <div className="meta-item"><span className="muted">Teknik</span><strong>4/5</strong></div>
                <div className="meta-item"><span className="muted">Taktik</span><strong>3/5</strong></div>
                <div className="meta-item"><span className="muted">Fysik</span><strong>3/5</strong></div>
                <div className="meta-item"><span className="muted">Mental</span><strong>4/5</strong></div>
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
        {pageHeader("Spillestil", "Klubbens fælles fodboldsprog bygget ind som mapper og underpunkter.")}
        <div className="list">
          {playStyle.map((group) => (
            <section key={group.title} className="card">
              <h3>{group.title}</h3>
              <div className="section-grid">
                {group.sections.map((section) => (
                  <div key={section.title} className="section-box">
                    <h4>{section.title}</h4>
                    {section.points.map((point) => <div key={point} className="point">{point}</div>)}
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
        <div className="header">
          <div>
            <h2>Træningsbank</h2>
            <div className="muted">Øvelser med kategori, fokus og intensitet, klar til senere databasekobling.</div>
          </div>
          <button className="primary-btn">+ Ny øvelse</button>
        </div>
        <div className="drill-grid">
          {drills.map((drill) => (
            <section key={drill.title} className="card">
              <div className="row" style={{justifyContent:"space-between", alignItems:"flex-start"}}>
                <div>
                  <h3 style={{marginBottom:4}}>{drill.title}</h3>
                  <div className="muted">{drill.category}</div>
                </div>
                <span className="badge">Intensitet {drill.intensity}/5</span>
              </div>
              <div className="drill-meta">
                <div><div className="muted">Fokus</div><strong>{drill.focus}</strong></div>
                <div><div className="muted">Varighed</div><strong>{drill.duration}</strong></div>
                <div><div className="muted">Status</div><strong>Klar til brug</strong></div>
              </div>
              <div className="placeholder">Her kommer senere banetegning, video og detaljeret beskrivelse af øvelsen.</div>
            </section>
          ))}
        </div>
      </>
    );
  }

  function renderPeriodization() {
    return (
      <>
        {pageHeader("Periodisering", "Måneder og uger bygget som mapper, så trænere kan klikke sig ned i planen.")}
        <div className="month-grid">
          {Object.entries(periodization).map(([month, weeks]) => (
            <section key={month} className="card">
              <h3>{month}</h3>
              {weeks.map((week) => (
                <div key={week} className="week-item">
                  <div><strong>{week}</strong></div>
                  <div className="muted">Klikbar uge-mappe i den næste version.</div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </>
    );
  }

  function renderPlaceholder(title: string) {
    return <section className="card"><h2>{title}</h2><div className="muted">Denne side bygger vi i næste version.</div></section>;
  }

  function renderPage() {
    switch (activePage) {
      case "Dashboard": return renderDashboard();
      case "Hold": return renderTeams();
      case "Spillere": return renderPlayers();
      case "Spillestil": return renderPlayStyle();
      case "Træningsbank": return renderDrills();
      case "Periodisering": return renderPeriodization();
      default: return renderPlaceholder(activePage);
    }
  }

  return (
    <div className="page">
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <h1>Nordic Coach</h1>
            <p>Football Coaching & Development Platform</p>
          </div>
          <nav className="nav">
            {navigation.map((item) => (
              <button key={item} onClick={() => setActivePage(item)} className={activePage === item ? "active" : ""}>{item}</button>
            ))}
          </nav>
        </aside>
        <main className="main">{renderPage()}</main>
      </div>
    </div>
  );
}
