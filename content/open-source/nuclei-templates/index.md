---
title: "projectdiscovery / nuclei-templates"
description:
weight: 20
---

Contributions to [projectdiscovery/nuclei-templates](https://github.com/projectdiscovery/nuclei-templates), the community-curated vulnerability scanning template library for the Nuclei engine.

### [#17240](https://github.com/projectdiscovery/nuclei-templates/pull/17240): fix: prevent false positive in CVE-2026-31807

Fixed a matcher logic flaw in the detection template for **CVE-2026-31807**.

The second HTTP verification request was missing `matchers-condition: and`. In Nuclei, omitting this directive causes multiple matcher blocks to evaluate with `OR` logic. As a result, supporting indicators like an HTTP `200` status or an `image/svg+xml` Content-Type header caused the template to fire on benign targets even when the payload was completely sanitized and not reflected.

Added `matchers-condition: and` to mandate that the reflected XSS payload, the SVG MIME type, and the HTTP `200` response must all match simultaneously before reporting a vulnerability. This aligns with the related [CVE-2026-31809](https://github.com/projectdiscovery/nuclei-templates/blob/main/http/cves/2026/CVE-2026-31809.yaml) template and eliminates false positive alerts in automated scans.

---

[View all PRs](https://github.com/projectdiscovery/nuclei-templates/pulls?q=is%3Apr+author%3AShaivarth) · [Nuclei Templates](https://github.com/projectdiscovery/nuclei-templates)
