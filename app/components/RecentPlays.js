export default function RecentPlays({ plays }) {
  if (!plays || plays.length === 0) {
    return null;
  }

  return (
    <section className="section">
      <h2>Recently Played</h2>
      <div className="grid">
        {plays.map((play, index) => (
          <div className="card" key={index}>
            <img src={play.albumArt} alt={play.albumName} />
            <div className="card-content">
              <h3>{play.trackName}</h3>
              <p>{play.artistName}</p>
              <small>{new Date(play.playedAt).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
