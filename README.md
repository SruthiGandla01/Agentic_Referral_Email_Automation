# Agentic Referral Email Automation – n8n Workflow

This project is an **agentic email automation system** implemented entirely
as an n8n workflow (`email-automation-workflow.json`). It automates
cold-referral outreach by:

1. Reading target companies, job titles, and job URLs from Google Sheets  
2. Finding relevant contacts with Hunter.io  
3. Using **three LLM-based agents**:
   - Controller Agent (fit scoring + should_proceed)
   - Context Builder Agent (skills, achievements, job focus)
   - Email Writer Agent (final referral email)
4. Validating and cleaning LLM output with a **custom JSON validator tool**  
5. Choosing between **Template A** and **Template B** using an RL-like node  
6. Sending validated emails via Gmail  
7. Logging history and metrics back to Google Sheets

The workflow file you should import into n8n is:

- `Email Automation.json`

  
---

## 1. Prerequisites

- An n8n instance (cloud or self-hosted), version 1.x or later
- Access to the following external services:
  - **Google Sheets API** (OAuth2) – used by `Get row(s) in sheet`, `Append row...` nodes
  - **Google Drive API** – used to download the resume file
  - **Hunter.io API** – to discover email contacts
  - **OpenAI (or compatible) API** – used by LLM Agent nodes
  - **Gmail** (OAuth2) – to send emails

---

## 2. Setup Instructions

### 2.1 Import Workflow

1. Open your n8n instance.
2. Click **Workflows → Import from File**.
3. Select `email-automation-workflow.json`.
4. Save the imported workflow as `Email Automation`.

---

### 2.2 Configure Credentials

Create and configure the following credentials in n8n:

1. **Google Sheets OAuth2**
   - Used by:
     - `Get row(s) in sheet`
     - `Append or update row in Result`
     - `Append row in History`
     - `Append row in History sheet`
     - `Get row(s) in History`
     - `Append row in metrics`
   - Scope: Sheets + Drive as required.

2. **Google Drive OAuth2**
   - Used by `Download file1` to fetch the resume PDF from Google Drive.

3. **Hunter API**
   - Used by `Hunter` node to query company domains for contacts.

4. **OpenAI API**
   - Used by:
     - `OpenAI Chat Model`
     - `OpenAI Chat Model1`
     - `OpenAI Chat Model2`
     - `Controller Agent`
     - `Context Builder Agent`
     - `AI Agent`
   - Point the nodes to the correct model (e.g., `gpt-4o`).

5. **Gmail OAuth2**
   - Used by `Send a message` node to send final referral emails.

Make sure each node is linked to the appropriate credential in the n8n UI.

---

### 2.3 Google Sheets Structure

The workflow expects one Google Spreadsheet with at least these sheets:

1. **Main Jobs Sheet** (e.g., `Sheet1`)
   - Columns (example names):
     - `Company Name`
     - `Position`
     - `URL`

2. **Results Sheet** (e.g., `Results`)
   - Columns:
     - `Name`
     - `Email`
     - `Company`
     - `Subject`
     - `Email Body`

3. **History Sheet** (e.g., `History`)
   - Columns:
     - `Email`
     - `Company`
     - `Job Title`
     - `Job URL`
     - `Template_Variant`
     - `Sent_At`
     - `Validation_Status`
     - `Reply_Received`
     - `Reward`
     - (optional) `should_proceed`

4. **Metrics Sheet** (e.g., `Metrics`)
   - Columns:
     - `Timestamp`
     - `Validity Rate`
     - `Skip rate`
     - `Reply rate A`
     - `Reply rate B`
     - `end-to-end success rate`

Make sure your node parameters refer to the correct Sheet IDs and tab names.

---

### 2.4 Resume PDF

The workflow uses:

- `Download file1` (Google Drive node) + `Extract from File` node  
  to pull Sruthi’s resume text.

Update the **Google Drive file URL** in the `Download file1` node so it
points to your actual resume file.

---

## 3. Running the Workflow

1. Open the “Email Automation” workflow in n8n.
2. Click **Execute workflow** (or set up a schedule/trigger node).
3. For each row in the main Google Sheet:
   - Contacts will be fetched via Hunter.io.
   - The Controller Agent will decide if the job is a good match.
   - The Context Builder Agent will extract relevant skills/achievements.
   - The RL Node will choose template A or B using History.
   - The AI Agent will generate an email.
   - The JSON Validator will clean/validate the output.
   - If valid, the email will be sent via Gmail.
   - All actions will be logged in Results, History, and Metrics sheets.

---

## 4. Custom Code Nodes

Three **Code** nodes contain custom JavaScript:

1. `Code in JavaScript`  
   - JSON validator & cleaner for email output.

2. `Code in RL Node`  
   - RL-like template selection based on the History sheet.

3. `Metrics Code`  
   - Metrics aggregation from History to Metrics sheet.

Their fully commented source code is provided in:
- `json_validator_tool.js`
- `rl_template_selector.js`
- `metrics_code.js`

---

## 5. Limitations

- Dependent on external LLM (OpenAI) availability and output stability.
- Hunter.io contact accuracy is not guaranteed.
- Reward values must be updated manually in the History sheet to train the RL node.
- Email deliverability and spam filtering are not explicitly optimized.

---

## 6. Future Improvements

- Use richer reward signals (e.g., reply sentiment or actual referral outcomes).
- Add dashboards (e.g., Looker Studio or Tableau) on top of Metrics sheet.
- Enhance JSON semantic validation (e.g., schema-based checks).




