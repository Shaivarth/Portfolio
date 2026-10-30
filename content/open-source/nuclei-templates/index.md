---
title: "ProjectDiscovery / nuclei-templates"
description: "Community-curated vulnerability scanning templates for Nuclei."
weight: 10
logo: "img/projectdiscovery.png"
---

Contributions to [ProjectDiscovery/nuclei-templates](https://github.com/projectdiscovery/nuclei-templates), the community-curated vulnerability scanning template library for the Nuclei engine.

### [#17510: fix: reduce false positives in Azure Pipelines exposure template](https://github.com/projectdiscovery/nuclei-templates/pull/17510)

<div class="pr-description">

Fixed false-positive detections in the detection template for **azure-pipelines-exposed** (Azure Pipelines Exposed Configuration).

The template previously matched configuration keywords (`trigger:`, `pool:`, and `variables:`) without restricting evaluation to the response body, and lacked content-type validation. As a result, HTML pages returning HTTP `200` status codes (such as Single Page Application / SPA fallbacks, custom error portals, or soft 404 pages) frequently triggered false alerts if their HTML or inline scripts mentioned those terms.

Added `part: body` to restrict keyword matching strictly to the HTTP response payload and introduced a negative header matcher to discard responses with `Content-Type: text/html`. Valid exposed pipeline definitions served as `application/x-yaml`, `text/plain`, or `application/octet-stream` remain reliably detected while eliminating false positive alerts across web applications.

</div>

### [#17395: Fix Dell DPI default login detection](https://github.com/projectdiscovery/nuclei-templates/pull/17395)

<div class="pr-description">

Fixed a false-negative detection in the detection template for **dell-dpi-default-login** (Dell DPI Remote Power Management Default Login).

The template failed to detect valid targets because uppercase strings in the title matcher were compared against lowercase-converted HTTP response bodies (`tolower(body_1)`). I corrected the matcher casing to lowercase and fixed the multi-request configuration by replacing unnecessary pitchfork payload overhead with direct variables and adding `req-condition: true` to properly evaluate status codes and body indicators across both requests.

During review, the maintainer refined the implementation by transitioning the multi-request logic to Nuclei's newer `flow` protocol (`flow: http(1) && http(2)`).

</div>

### [#17355: fix(CVE-2025-12536): correct cve-id in classification](https://github.com/projectdiscovery/nuclei-templates/pull/17355)

<div class="pr-description">

Corrected the `cve-id` classification metadata in the detection template for **CVE-2025-12536** (SureForms &lt;= 1.13.1 Sensitive Information Exposure).

The template contained a copy-paste mismatch where `classification.cve-id` was mistakenly set to `CVE-2025-14437` (which corresponds to Hummingbird Performance). This duplicate identifier collision prevented proper downstream EPSS score syncing and caused CLI filtering to associate the template with the incorrect vulnerability.

Updated `cve-id` to the canonical identifier `CVE-2025-12536`, resolving the collision and ensuring accurate scoring and filtering across the repository.

</div>

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
