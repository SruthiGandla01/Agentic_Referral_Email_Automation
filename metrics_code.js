// Rows from the History sheet
const rows = $input.all().map(i => i.json);

// Initialize counters
let total = rows.length;
let validEmails = 0;
let skipCount = 0;

let A_count = 0;
let A_reward = 0;

let B_count = 0;
let B_reward = 0;

let successfulSends = 0;

// Loop through History rows
for (const r of rows) {
  // Email validity - check multiple possible field names
  const validationStatus = r.Validation_Status || r.validation_status || r.Validation_status;
  if (validationStatus !== "parse_error" && validationStatus !== "#ERROR!") {
    validEmails++;
  }

  // Skip rate (controller decision)
  if (r.should_proceed === "no") {
    skipCount++;
  }

  // Success (valid JSON + sent)
  const replyReceived = r.Reply_Received || r.reply_received;
  const email = r.Email || r.email;
  if (validationStatus !== "parse_error" &&
      validationStatus !== "#ERROR!" &&
      replyReceived !== "ERROR" &&
      email) {
    successfulSends++;
  }

  // Template performance - handle multiple field name variations
  const templateVariant = r.Template_Variant || r.template_variant || r['Template Variant'];
  const reward = Number(r.Reward || r.reward || 0);
  
  if (templateVariant === "A") {
    A_count++;
    A_reward += reward;
  }
  if (templateVariant === "B") {
    B_count++;
    B_reward += reward;
  }
}

// Final metrics - avoid division by zero
let emailValidityRate = total > 0 ? validEmails / total : 0;
let skipRate = total > 0 ? skipCount / total : 0;
let replyRateA = A_count > 0 ? A_reward / A_count : 0;
let replyRateB = B_count > 0 ? B_reward / B_count : 0;
let endToEndSuccessRate = total > 0 ? successfulSends / total : 0;

return [
  {
    json: {
      total_rows: total,
      emailValidityRate: emailValidityRate,
      skipRate: skipRate,
      replyRateA: replyRateA,
      replyRateB: replyRateB,
      endToEndSuccessRate: endToEndSuccessRate
    }
  }
];
