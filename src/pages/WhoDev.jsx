import { useState } from 'react';
import './WhoDev.css';

function WhoDev() {
  
  const [videos] = useState([
    { id: 1, title: 'Echo: Fuzzy Tutorial', type: 'url', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 2, title: 'Fuzzy', type: 'mp4', src: '/assets/sample-video.mp4' },
  ]);
  const [articles] = useState([
    { id: 1, title: 'Star of fuzzy', url: 'https://example.com/article1', description: 'Where fuzzy started back in 2013' },
    { id: 2, title: 'XRP and Fuzzybears', url: 'https://example.com/article2', description: 'Exploring the XRP ecosystem.' },
  ]);
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);

  return (
    <div className="container">
      <div className="hero">
        <h1>Who is the Dev?</h1>
        <p>Learn about the secret dev behind Fuzzy through videos and articles!</p>
        <div className="dev-content">
          <div className="videos-section">
            <h2>Videos</h2>
            <div className="video-player">
              {selectedVideo.type === 'url' ? (
                <iframe
                  width="100%"
                  height="315"
                  src={selectedVideo.src}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video width="100%" height="315" controls>
                  <source src={selectedVideo.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            <div className="video-list">
              {videos.map((video) => (
                <button
                  key={video.id}
                  className={selectedVideo.id === video.id ? 'video-item active' : 'video-item'}
                  onClick={() => setSelectedVideo(video)}
                >
                  {video.title}
                </button>
              ))}
            </div>
          </div>
          <div className="articles-section">
            <h2>Articles</h2>
            <div className="article-list">
              {articles.map((article) => (
                <div key={article.id} className="article-item">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <h3>{article.title}</h3>
                  </a>
                  <p>{article.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhoDev;