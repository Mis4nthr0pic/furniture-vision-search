# README eval + CI polish (2026-05-21)

**Prompt:** User will add screenshots; apply the remaining packaging feedback.

**Changes:**
- Added a README section explaining why the app is not just a GPT vision wrapper.
- Corrected mislabeled static eval fixtures so expected labels target visible furniture in the images.
- Published a local eval baseline comparing hybrid retrieval and hybrid + image rerank.
- Added an explicit CI `Root check` job that runs `npm run check`.
- Updated testing docs for the current 94-test suite.
