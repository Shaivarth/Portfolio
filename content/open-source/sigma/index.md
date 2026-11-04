---
title: "SigmaHQ / sigma"
description: "The industry standard signature format for SIEM detection engineering."
weight: 20
logo: "img/sigma.png"
---

Upstream contributions to [SigmaHQ/sigma](https://github.com/SigmaHQ/sigma), the industry standard generic signature format for SIEM detection engineering.

### [#6549: Fix OriginalFileName leading backslash in Windows process creation rules](https://github.com/SigmaHQ/sigma/pull/6549)

<div class="pr-description">

Fixed dead `OriginalFileName` detection criteria across seven Windows process creation detection rules.

In Windows process auditing telemetry (Sysmon Event ID 1 / Security Event ID 4688), the `OriginalFileName` field records the binary's original internal PE header filename without any preceding path. Multiple rules attempted to match this field using values with a leading backslash (e.g. `\msiexec.exe`), causing exact-match filter conditions to never trigger and leaving renamed copies of target binaries undetected.

Removed the leading backslash from `OriginalFileName` across:
* **MsiExec Execution & Masquerading**: `proc_creation_win_msiexec_dll.yml` and `proc_creation_win_msiexec_masquerading.yml`.
* **Credential Access & Harvesting**: `proc_creation_win_rpcping_credential_capture.yml` and `proc_creation_win_hktl_inveigh.yml`.
* **Sensitive File Extraction**: `proc_creation_win_esentutl_sensitive_file_copy.yml`.
* **Administrative & Script Abuse**: `proc_creation_win_mssql_sqltoolsps_susp_execution.yml` and `proc_creation_win_susp_use_of_te_bin.yml`.

</div>

### [#6263: Office Autorun Keys Modification Rule Fixes](https://github.com/SigmaHQ/sigma/pull/6263)

<div class="pr-description">

Fixed filter matching bugs in registry_set_asep_reg_keys_modification_office.yml under filter_main_known_addins:
* Removed an accidental trailing space in 'C:\Windows\SysWOW64\regsvr32.exe ' that caused Image|startswith to fail when matching 32-bit regsvr32.exe execution.
* Corrected an unintended double backslash in \Outlook\Addins\OneNote.OutlookAddin so TargetObject|contains accurately matches the registry key path, preventing false positive alerts on legitimate Office add-ins.

</div>

### [#6239: CI Runtime Optimization & Test Suite Caching](https://github.com/SigmaHQ/sigma/pull/6239)

<div class="pr-description">

PR #6239 cut Sigma's test runtime by **5.4×**, saving around **75 sec** on each CI run. It was about making Sigma's automated tests much faster.

* Sigma has thousands of detection rules, and its test suite checks these rules automatically. I found that the tests were repeatedly opening and parsing the same YAML files, even when that data had already been loaded. I changed the test setup to scan the rule files once and keep the parsed data in memory so it could be reused instead of doing the same work again and again.

* A later PR by a maintainer, **#6272**, mentioned **#6239** as an inspiration and applied similar ideas to Sigma's regression testing. It introduced faster YAML parsing, parallel file scanning, and batched test execution.

* Together, those changes brought the regression test runtime from roughly **4 min** down to **20 sec**.

</div>

---

[View all PRs](https://github.com/SigmaHQ/sigma/pulls?q=is%3Apr+author%3AShaivarth) · [Sigma](https://github.com/SigmaHQ/sigma)
