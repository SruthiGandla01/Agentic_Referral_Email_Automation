// JSON Validator & Cleaner Custom Tool
// This tool validates, cleans, and normalizes the LLM output from the Email Writer Agent.

const items = $input.all().map(item => {

  // 1. Extract raw model output
  let raw = item.json.output || item.json || "";

  // If raw is object, convert to string to clean/parse
  if (typeof raw === 'object') {
    raw = JSON.stringify(raw);
  }

  let parsed = {};
  let status = "ok";
  let error = "";

  try {
    // 2. Cleanup: remove ```json fences or backticks
    raw = raw.trim()
             .replace(/^`+json/i, "")
             .replace(/^`+/, "")
             .replace(/`+$/, "")
             .trim();

    // 3. Parse JSON
    parsed = JSON.parse(raw);

  } catch (err) {
    status = "parse_error";
    error = `JSON parse failed: ${err.message}`;
    parsed = {
      subject: "",
      email_body: "",
      anchor_topics: []
    };
  }

  // 4. Ensure required keys exist
  parsed.subject = parsed.subject || "";
  parsed.email_body = parsed.email_body || "";
  parsed.anchor_topics = parsed.anchor_topics || [];

  // 5. Validations
  // Subject must be 3–7 words
  const subjectWordCount = parsed.subject.trim().split(/\s+/).filter(Boolean).length;
  if (subjectWordCount < 3 || subjectWordCount > 7) {
    status = "validation_warning";
    error += " | Subject must be 3–7 words.";
  }

  // Email must reference resume + LinkedIn
  if (!parsed.email_body.toLowerCase().includes("resume") ||
      !parsed.email_body.toLowerCase().includes("linkedin")) {
    status = "validation_warning";
    error += " | CTA missing mention of resume and LinkedIn.";
  }

  // Should contain job link from sheet
  try {
    const jobLink = $('Get row(s) in sheet').item.json.URL;
    if (!parsed.email_body.includes(jobLink)) {
      status = "validation_warning";
      error += " | Job link not detected in the email body.";
    }
  } catch (e) {
    // ignore if sheet didn't load
  }

  // 6. Output cleaned values
  item.json.subject = parsed.subject;
  item.json.email_body = parsed.email_body;
  item.json.anchor_topics = parsed.anchor_topics;
  item.json.validation_status = status;
  item.json.validation_error = error || null;

  return item;
});

// 7. Return validated/cleaned items
return items;
