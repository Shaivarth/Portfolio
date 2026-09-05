---
title: "SigmaHQ / sigma"
description: "The Generic Signature Format for SIEM Systems, providing an open and vendor-agnostic standard for threat detection rules."
weight: 10
---

Upstream contributions to [SigmaHQ/sigma](https://github.com/SigmaHQ/sigma), the industry standard generic signature format for SIEM detection engineering.

### [#6239](https://github.com/SigmaHQ/sigma/pull/6239): CI Runtime Optimization & Test Suite Caching

**#6239** cut Sigma's test runtime by **5.4×**, saving around **75 sec** on each CI run. It was about making Sigma's automated tests much faster.

Sigma has thousands of detection rules, and its test suite checks these rules automatically. I found that the tests were repeatedly opening and parsing the same YAML files, even when that data had already been loaded. I changed the test setup to scan the rule files once and keep the parsed data in memory so it could be reused instead of doing the same work again and again.

A later PR by a maintainer, **#6272**, mentioned **#6239** as an inspiration and applied similar ideas to Sigma's regression testing. It introduced faster YAML parsing, parallel file scanning, and batched test execution.

Together, those changes brought the regression test runtime from roughly **4 min** down to **20 sec**.

### [#6263](https://github.com/SigmaHQ/sigma/pull/6263): Office Autorun Keys Modification Rule Fixes

Fixed filter matching bugs in **registry_set_asep_reg_keys_modification_office.yml** under **filter_main_known_addins**:
* Removed an accidental trailing space in **'C:\Windows\SysWOW64\regsvr32.exe '** that caused **Image|startswith** to fail when matching 32-bit **regsvr32.exe** execution.
* Corrected an unintended double backslash in **\Outlook\Addins\OneNote.OutlookAddin** so **TargetObject|contains** accurately matches the registry key path, preventing false positive alerts on legitimate Office add-ins.

---

[View all PRs](https://github.com/SigmaHQ/sigma/pulls?q=is%3Apr+author%3AShaivarth) · [Sigma](https://github.com/SigmaHQ/sigma)

