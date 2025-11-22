// Simple RL-like policy: choose template A or B based on historical reward.
// Assumes input items are rows from History sheet for this company/job_title.
// Columns: Template_Variant, Reward

const rows = $input.all().map(i => i.json);

let stats = {
  A: { count: 0, reward: 0 },
  B: { count: 0, reward: 0 },
};

// Aggregate stats
for (const row of rows) {
  const variant = row.Template_Variant || row.template_variant || "A";
  const reward = Number(row.Reward || 0);

  if (!stats[variant]) {
    stats[variant] = { count: 0, reward: 0 };
  }
  stats[variant].count += 1;
  stats[variant].reward += reward;
}

// Compute average reward with small smoothing
function avgReward(v) {
  if (!stats[v]) return 0;
  return (stats[v].reward + 1) / (stats[v].count + 2); // Laplace smoothing
}

const avgA = avgReward("A");
const avgB = avgReward("B");

// Choose the better-performing variant; if equal, default to A
let chosen = "A";
if (avgB > avgA) chosen = "B";

// Output single item with chosen variant
return [
  {
    json: {
      chosen_template_variant: chosen,
      avg_reward_A: avgA,
      avg_reward_B: avgB,
      history_count_A: stats.A.count,
      history_count_B: stats.B.count
    }
  }
];
