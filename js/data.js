/* Pokémon Uranium Field Binder: static data. Badge names/leaders/types from pokemon-uranium.fandom.com (CC BY-SA 3.0). */
window.MON = {};
window.sprite = () => '';
window.LOCS = [];
window.BADGES = [
  { id: "normal", name: "Normal Badge", gym: "Nowtoch City", leader: "Maria", type: "Normal", color: "#a8a77a" },
  { id: "brightgem", name: "Bright Gem Badge", gym: "Burole Town", leader: "Davern", type: "Rock / Ground / Poison", color: "#b6a136" },
  { id: "tide", name: "Tide Badge", gym: "Bealbeach City", leader: "Cali", type: "Water / Grass", color: "#4f86d9" },
  { id: "pixel", name: "Pixel Badge", gym: "Vinoville Town", leader: "Sheldon", type: "Psychic / Steel", color: "#9a9ab8" },
  { id: "salsa", name: "Salsa Badge", gym: "Amatree Town", leader: "Tiko", type: "Fire", color: "#ee8130" },
  { id: "drama", name: "Drama Badge", gym: "Venesi City", leader: "Rosalind", type: "Psychic / Ghost / Fairy", color: "#b0538f" },
  { id: "apex", name: "Apex Badge", gym: "Snowbank Town", leader: "Vaeryn", type: "Dragon / Ice", color: "#69c6c3" },
  { id: "zen", name: "Zen Badge", gym: "Tsukinami Village", leader: "Hinata & Kaito", type: "Day / Night", color: "#5b5f86" }
];
window.TYPE_COLORS = {
  Normal: "#a8a77a", Fire: "#ee8130", Water: "#6390f0", Electric: "#d8b51c", Grass: "#7ac74c", Ice: "#69c6c3",
  Fighting: "#c22e28", Poison: "#a33ea1", Ground: "#d6b85a", Flying: "#8f7ee8", Psychic: "#f95587", Bug: "#a6b91a",
  Rock: "#b6a136", Ghost: "#735797", Dragon: "#6f35fc", Dark: "#705746", Steel: "#9a9ab8", Fairy: "#d685ad",
  Nuclear: "#2f6b1a", Light: "#d8b51c"
};
window.STARTERS = [];
