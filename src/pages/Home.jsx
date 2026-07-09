import Menu from "../components/navbar";
import "../styles/home.css";

const Home = () => {
  return (
    <main className="home-page">
      <Menu />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Lujo inteligente</p>
          <h1 className="hero-title">Fragancias elegantes con un estilo sobrio y refinado.</h1>
          <p className="hero-text">
            Mym Parfums combina notas frescas con una paleta azul profunda para una experiencia formal y moderna.
          </p>
          <div className="hero-actions">
            <button className="hero-button">Ver colección</button>
            <button className="hero-button hero-button-secondary">Descubrir aromas</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
