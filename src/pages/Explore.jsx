import { Link } from 'react-router-dom';
import '../styles/Explore.css';

const ecosystems = [
  {
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
    title: 'Delhi Ridge Forest',
    desc: 'Acts as the green lungs of Delhi.',
  },
  {
    img: 'https://tse2.mm.bing.net/th/id/OIP.8P0GiIjVw1jO6t5_Xms2IQHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    title: 'Yamuna River',
    desc: 'Major river facing pollution challenges.',
  },
  {
    img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    title: 'Okhla Bird Sanctuary',
    desc: 'Important wetland for migratory birds.',
  },
  {
    img: 'https://im.whatshot.in/img/2023/Jun/body-image-1-1688029401.jpg',
    title: 'Urban Parks',
    desc: 'Lodhi Garden and Nehru Park conservation.',
  },
  {
    img: 'https://resize.indiatvnews.com/en/resize/newbucket/1200_-/2025/10/PTI10_21_2025_000251B.webp',
    title: 'Air Quality Zones',
    desc: 'Monitoring pollution in Delhi NCR.',
  },
  {
    img: 'https://thecsruniverse.com/adminxsafe/uploads/20250830080219',
    title: 'Waste Management',
    desc: 'Reducing landfill waste and promoting recycling.',
  },
];

export default function Explore() {
  return (
    <div className="explore-page">
      <header className="explore-header">
        <h1>EcoSphere</h1>
        <nav>
          <Link to="/">← Back to Home</Link>
        </nav>
      </header>

      <section className="explore-section">
        <h2>Explore Ecosystems in Delhi</h2>
        <p>
          EcoSphere focuses on conservation efforts across Delhi including forests,
          urban green spaces, wetlands, and river ecosystems.
        </p>

        <div className="card-grid">
          {ecosystems.map((eco, i) => (
            <div className="card" key={i}>
              <img src={eco.img} alt={eco.title} />
              <h3>{eco.title}</h3>
              <p>{eco.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
