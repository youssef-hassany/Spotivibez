export default function TopTracks({ tracks }) {
  if (!tracks || tracks.length === 0) {
    return null;
  }

  return (
    <section className="section">
      <h2>Top Tracks</h2>
      <div className="grid">
        {tracks.map((track, index) => (
          <div className="card" key={index}>
            <img src={track.albumArt} alt={track.albumName} />
            <div className="card-content">
              <h3>{track.trackName}</h3>
              <p>{track.artistNames}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
