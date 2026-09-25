---
title: "ProjectDiscovery / nuclei-templates"
description: "Community-curated vulnerability scanning templates for Nuclei."
weight: 10
logo: "img/projectdiscovery.png"
---

Contributions to [ProjectDiscovery/nuclei-templates](https://github.com/projectdiscovery/nuclei-templates), the community-curated vulnerability scanning template library for the Nuclei engine.

### [#17294: fix: prevent false positive in sap-readconfigfile-disclosure](https://github.com/projectdiscovery/nuclei-templates/pull/17294)

<div class="pr-description">

Fixed a matcher logic flaw in the detection template for **sap-readconfigfile-disclosure** (SAPControl SOAP ReadConfigFile).

The second HTTP verification request lacked `matchers-condition: and`, causing Nuclei to evaluate the matcher blocks with default `OR` logic. Consequently, any target returning an HTTP `200` status code triggered a false-positive configuration disclosure alert, even when `ReadConfigFileResponse` and `<lines>` were completely absent from the response body.

Added `matchers-condition: and` to require that the HTTP `200` status and the SOAP body indicators (`ReadConfigFileResponse` and `<lines>`) match simultaneously before flagging a vulnerability, eliminating false-positive findings in automated scans.

</div>

### [#17293: fix: prevent false positive in CVE-2024-33832](https://github.com/projectdiscovery/nuclei-templates/pull/17293)

<div class="pr-description">

Fixed a matcher logic flaw in the detection template for **CVE-2024-33832** (OneNav SSRF).

The template lacked a top-level `matchers-condition`, causing Nuclei to evaluate multiple matcher blocks with default `OR` logic. Consequently, any target responding with `Content-Type: application/json` or matching generic response indicators triggered a false-positive SSRF alert, even when no outbound interaction with the OAST server (`interactsh`) took place.

Added `matchers-condition: and` to mandate that the out-of-band interactsh protocol interaction and HTTP response indicators must match simultaneously before reporting the vulnerability, eliminating false-positive alerts in automated scans.

</div>

### [#17240: fix: prevent false positive in CVE-2026-31807](https://github.com/projectdiscovery/nuclei-templates/pull/17240)

<div class="pr-description">

Fixed a matcher logic flaw in the detection template for **CVE-2026-31807**.

The second HTTP verification request was missing `matchers-condition: and`. In Nuclei, omitting this directive causes multiple matcher blocks to evaluate with `OR` logic. As a result, supporting indicators like an HTTP `200` status or an `image/svg+xml` Content-Type header caused the template to fire on benign targets even when the payload was completely sanitized and not reflected.

Added `matchers-condition: and` to mandate that the reflected XSS payload, the SVG MIME type, and the HTTP `200` response must all match simultaneously before reporting a vulnerability. This aligns with the related [CVE-2026-31809](https://github.com/projectdiscovery/nuclei-templates/blob/main/http/cves/2026/CVE-2026-31809.yaml) template and eliminates false positive alerts in automated scans.

</div>

---

[View all PRs](https://github.com/projectdiscovery/nuclei-templates/pulls?q=is%3Apr+author%3AShaivarth) · [Nuclei Templates](https://github.com/projectdiscovery/nuclei-templates)
