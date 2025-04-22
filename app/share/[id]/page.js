import { notFound } from "next/navigation";
import Image from "next/image";
import { list } from "@vercel/blob";

// Generate metadata with Open Graph tags for better social sharing
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    // Find the image in blob storage by searching for the ID
    const { blobs } = await list({ prefix: `spotify-insights-${id}` });

    if (blobs.length === 0) {
      return {
        title: "Spotify Insights - Not Found",
        description: "The requested Spotify insights could not be found.",
      };
    }

    const imageUrl = blobs[0].url;

    return {
      title: "My Spotify Insights",
      description:
        "Check out my personalized Spotify listening statistics and insights!",
      openGraph: {
        title: "My Spotify Insights",
        description:
          "Check out my personalized Spotify listening statistics and insights!",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: "Spotify Insights",
          },
        ],
        site_name: "SpotiVibes",
      },
      twitter: {
        card: "summary_large_image",
        title: "My Spotify Insights",
        description:
          "Check out my personalized Spotify listening statistics and insights!",
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Spotify Insights",
      description: "Share your Spotify listening insights with friends.",
    };
  }
}

export default async function SharePage({ params }) {
  const { id } = params;

  try {
    // Find the image in blob storage
    const { blobs } = await list({ prefix: `spotify-insights-${id}` });

    if (blobs.length === 0) {
      notFound();
    }

    const imageUrl = blobs[0].url;

    return (
      <div className="share-page">
        <div className="share-container">
          <h1>My Spotify Insights</h1>
          <div className="image-container">
            <Image
              src={imageUrl}
              alt="Spotify Insights"
              width={600}
              height={800}
              style={{ maxWidth: "100%", height: "auto" }}
              priority
            />
          </div>
          <div className="share-info">
            <p>
              These are my personalized Spotify insights shared from SpotiVibes!
            </p>
            <p>
              <a href="/" className="create-button">
                Create Your Own Insights
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in share page:", error);
    return <div>Something went wrong loading your shared insights</div>;
  }
}
