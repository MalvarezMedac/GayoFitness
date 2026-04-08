import { useState } from "react";

// ─── DATOS ───────────────────────────────────────────────────────────────────
const recipes = [
  {
    id: 1,
    title: "Tazón de Açaí Energético",
    kcal: 320,
    time: "10 min",
    img: "/ruta/imagen1.jpg", // ← PON TU RUTA AQUÍ
    favorited: false,
  },
  {
    id: 2,
    title: "Ensalada de Quinoa Mediterránea",
    kcal: 380,
    time: "25 min",
    img: "/ruta/imagen2.jpg", // ← PON TU RUTA AQUÍ
    favorited: true,
  },
  {
    id: 3,
    title: "Salmón a la Parrilla con Espárragos",
    kcal: 420,
    time: "30 min",
    img: "/ruta/imagen3.jpg", // ← PON TU RUTA AQUÍ
    favorited: false,
  },
  {
    id: 4,
    title: "Batido Verde Detox",
    kcal: 180,
    time: "5 min",
    img: "/ruta/imagen4.jpg", // ← PON TU RUTA AQUÍ
    favorited: false,
    rating: 4.6,
    difficulty: "Fácil",
  },
  {
    id: 5,
    title: "Bowl de Verduras al Vapor",
    kcal: 210,
    time: "35 min",
    img: "/ruta/imagen5.jpg", // ← PON TU RUTA AQUÍ
    favorited: false,
  },
  {
    id: 6,
    title: "Tostada de Aguacate con Huevo",
    kcal: 290,
    time: "15 min",
    img: "/ruta/imagen6.jpg", // ← PON TU RUTA AQUÍ
    favorited: true,
  },
];

const categories = ["Todos", "Desayuno", "Almuerzo"];

// ─── ICONOS SVG ──────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#ef4444" : "#999"}
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FireIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
    <path d="M12 2c0 0-5 4-5 9a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-3 3s-2-2-2-4c0-1 0-2 2-3z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CameraIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─── ESTILOS INLINE ───────────────────────────────────────────────────────────
const styles = {
  phone: {
    width: 390,
    height: 720,
    background: "#f5f0ea",
    borderRadius: 36,
    overflow: "hidden",
    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Nunito', sans-serif",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 16px 16px",
    scrollbarWidth: "none",        // Firefox
    msOverflowStyle: "none",       // IE/Edge
  },
  searchRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    background: "white",
    borderRadius: 14,
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
  },
  searchPlaceholder: {
    color: "#ccc",
    fontSize: 13,
    fontWeight: 600,
    flex: 1,
  },
  filterBtn: {
    background: "#ef4444",
    borderRadius: 14,
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
    border: "none",
    cursor: "pointer",
  },
  pillsRow: {
    display: "flex",
    gap: 10,
    marginBottom: 18,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    paddingBottom: 8,
  },
  card: {
    background: "white",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
  imgWrapper: {
    position: "relative",
    height: 130,
    background: "#e8e0d5",
    overflow: "hidden",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  timeBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    background: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    padding: "3px 8px",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  timeBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: 700,
  },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "white",
    border: "none",
    borderRadius: "50%",
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
  },
  cardInfo: {
    padding: "10px 12px 12px",
  },
  cardTitle: {
    fontWeight: 800,
    fontSize: 13,
    color: "#1a1a1a",
    lineHeight: 1.3,
    marginBottom: 6,
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  kcalText: {
    fontSize: 12,
    color: "#666",
    fontWeight: 600,
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    marginLeft: 4,
  },
  ratingText: {
    fontSize: 11,
    color: "#f59e0b",
    fontWeight: 700,
  },
  diffBadge: {
    background: "#dcfce7",
    color: "#16a34a",
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 6,
    padding: "2px 6px",
    marginLeft: 4,
  },
  // iframe bottom nav
  bottomNav: {
    width: "100%",
    height: 68,
    border: "none",
    flexShrink: 0,
    display: "block",
  },
};

// HTML del bottom nav inyectado en el iframe (decorativo, no funcional)
const bottomNavHTML = `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Nunito', sans-serif; background: white; border-top: 1.5px solid #f0ece6; }
    nav { display: flex; justify-content: space-around; align-items: center; padding: 10px 0 14px; }
    .item { display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .icon { font-size: 20px; }
    .label { font-size: 11px; font-weight: 700; color: #bbb; }
    .active .label { color: #ef4444; }
  </style>
</head>
<body>
  <nav>
    <div class="item"><span class="icon">⊞</span><span class="label">Dashboard</span></div>
    <div class="item"><span class="icon">🏃</span><span class="label">Workouts</span></div>
    <div class="item active"><span class="icon">🍴</span><span class="label">Recipes</span></div>
    <div class="item"><span class="icon">💬</span><span class="label">Trainer</span></div>
    <div class="item"><span class="icon">🛍</span><span class="label">Store</span></div>
  </nav>
</body>
</html>
`;

// ─── COMPONENTE TARJETA ───────────────────────────────────────────────────────
function RecipeCard({ recipe }) {
  const [fav, setFav] = useState(recipe.favorited);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? "scale(1.025)" : "scale(1)",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.13)"
          : "0 2px 12px rgba(0,0,0,0.07)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagen */}
      <div style={styles.imgWrapper}>
        <img
          src={recipe.img}
          alt={recipe.title}
          style={styles.img}
          onError={(e) => { e.target.style.display = "none"; }}
        />

        {/* Badge tiempo */}
        <div style={styles.timeBadge}>
          <ClockIcon />
          <span style={styles.timeBadgeText}>{recipe.time}</span>
        </div>

        {/* Corazón */}
        <button
          style={styles.heartBtn}
          onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
        >
          <HeartIcon filled={fav} />
        </button>
      </div>

      {/* Info */}
      <div style={styles.cardInfo}>
        <p style={styles.cardTitle}>{recipe.title}</p>
        <div style={styles.cardMeta}>
          <FireIcon />
          <span style={styles.kcalText}>{recipe.kcal} kcal</span>

          {recipe.rating && (
            <>
              <div style={styles.ratingRow}>
                <StarIcon />
                <span style={styles.ratingText}>{recipe.rating}</span>
              </div>
              <span style={styles.diffBadge}>{recipe.difficulty}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function RecipesApp() {
  const [activeTab, setActiveTab] = useState("Todos");

  return (
    <div style={styles.phone}>

      {/* ── Área scrollable ── */}
      <div style={styles.scrollArea}>

        {/* Barra de búsqueda */}
        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <SearchIcon />
            <span style={styles.searchPlaceholder}>Buscar recetas o ingredientes...</span>
            <CameraIcon />
          </div>
          <button style={styles.filterBtn}>
            <FilterIcon />
          </button>
        </div>

        {/* Pills de categorías */}
        <div style={styles.pillsRow}>
          {categories.map((cat) => {
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 22,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  transition: "all 0.2s",
                  background: isActive ? "#ef4444" : "white",
                  color: isActive ? "white" : "#555",
                  boxShadow: isActive
                    ? "0 3px 10px rgba(239,68,68,0.3)"
                    : "0 1px 5px rgba(0,0,0,0.08)",
                }}
              >
                {cat === "Desayuno" ? "☀️ " : cat === "Almuerzo" ? "🍽 " : ""}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid de recetas */}
        <div style={styles.grid}>
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </div>

      {/* ── Bottom nav (iframe decorativo, no funcional) ── */}
      <iframe
        title="bottom-nav"
        srcDoc={bottomNavHTML}
        style={styles.bottomNav}
        scrolling="no"
        sandbox=""        // sandbox vacío = sin JS, sin navegación, sin nada
      />
    </div>
  );
}