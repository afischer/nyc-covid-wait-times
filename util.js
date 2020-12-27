function getCleanName(name) {
  const lowerName = name.toLowerCase();

  // Use startsWith as sometimes text extraction can be a bit unreliable late in words
  if (lowerName.startsWith("bathgate")) return "Bathgate Contract Postal Station";
  if (lowerName.startsWith("bellevue")) return "Bellevue Hospital";
  if (lowerName.startsWith("belvis")) return "Belvis DTC";
  if (lowerName.startsWith("ci ida g israel")) return "Ida G. Israel CHC";
  if (lowerName.startsWith("cu jonathan")) return "Jonathan Williams Houses";
  if (lowerName.startsWith("cu vanderbilt")) return "Vanderbilt";
  if (lowerName.startsWith("cu woodside")) return "Woodside Houses";
  if (lowerName.startsWith("coney island hospital")) return "Coney Island Hospital";
  if (lowerName.startsWith("cumberland dtc")) return "Cumberland DTC";
  if (lowerName.startsWith("elmhurst hospital")) return "Elmhurst Hospital";
  if (lowerName.startsWith("ey east new york")) return "East New York DTC";
  if (lowerName.startsWith("greenbelt rec")) return "Greenbelt Recreation Center";
  if (lowerName.startsWith("kings county hospital")) return "Kings County Hospital";
  if (lowerName.startsWith("metropolitan hospital")) return "Metropolitan Hospital";
  if (lowerName.startsWith("morrisania diag")) return "Morrisania DTC";
  if (lowerName.startsWith("mt. lor")) return "Mt. Loretto Sportsplex";
  if (lowerName.startsWith("north central bronx")) return "North Central Bronx Hospital";
  if (lowerName.startsWith("rain boston road ")) return "Rain Boston Road Senior Center";
  if (lowerName.startsWith("red hook rec")) return "Red Hook Recreation Center";
  if (lowerName.startsWith("sy dyckman")) return "Dyckman Clinica de Las Americas";
  if (lowerName.startsWith("sy st. nicholas")) return "St. Nicholas CHC";
  if (lowerName.startsWith("sorren")) return "Sorreno Recreation Center";
  if (lowerName.startsWith("sydenham")) return "Sydenham Health Center";
  if (lowerName.startsWith("st. george ferry")) return "St. George Ferry Terminal";
  if (lowerName.startsWith("st. james rec")) return "St. James Recreation Center";
  if (lowerName.startsWith("tremont community")) return "Tremont CHC";
  return name;
}

function getNormalizedTime(time) {
  switch (time.toLowerCase()) {
    case "not reported yet":
      return "NR";

    case "no wait time":
      return "0";

    case "< 30 minutes":
    case "0-30 minutes":
      return "0-30";

    case "< 60 minutes":
    case "30-60 minutes":
      return "30-60";
    case "< 90 minutes":
    case "1-1.5 hours":
      return "60-90";

    case "1.5-2 hours":
      return "90-120";

    case "more than 2 hours":
      return ">120"

    default:
      return time;
  }
}

module.exports = {
  getCleanName,
  getNormalizedTime
}
