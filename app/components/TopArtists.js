export default function TopArtists({ artists }) {
  if (!artists || artists.length === 0) {
    return null;
  }

  return (
    <section className="section">
      <h2>Top Artists</h2>
      <div className="grid">
        {artists.map((artist, index) => (
          <div className="card" key={index}>
            <img src={artist.imageUrl} alt={artist.artistName} />
            <div className="card-content">
              <h3>{artist.artistName}</h3>
              <p>Popularity: {artist.popularity}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
