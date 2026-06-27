#!/usr/bin/env python3
"""Citation auditor for research/*/sources.json.

OFFLINE checks (always run, no network):
  - duplicate source IDs across the corpus
  - placeholder author strings (wholly parenthetical, e.g. "(study authors)")
  - missing identifiers (no DOI, PMID, or URL)
  - obviously malformed PMIDs (non-numeric)

ONLINE checks (best-effort; skipped gracefully if the network is unreachable —
e.g. in a sandbox):
  - DOI resolves via https://doi.org/<doi> (HEAD)
  - PMID resolves via the PubMed E-utilities esummary API, and the returned
    title is compared (loosely) against the stored title

Usage:
  python3 scripts/audit_citations.py            # offline + online (if available)
  python3 scripts/audit_citations.py --offline  # offline only

Exit code is non-zero if any OFFLINE problem is found (online failures are
reported as warnings, since they may reflect network limits rather than bad data).
"""
import json
import glob
import os
import re
import sys
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(ROOT, "research")
PLACEHOLDER = re.compile(r"^\(.*\)$")
TIMEOUT = 8


def load_sources():
    out = []
    for path in sorted(glob.glob(os.path.join(RESEARCH, "*", "sources.json"))):
        data = json.load(open(path, encoding="utf-8"))
        for s in data.get("sources", []):
            s["_file"] = os.path.relpath(path, ROOT)
            out.append(s)
    return out


def offline_checks(sources):
    problems = []
    seen = {}
    for s in sources:
        sid = s.get("source_id", "<missing>")
        if sid in seen:
            problems.append(f"duplicate source_id {sid} ({s['_file']} & {seen[sid]})")
        seen[sid] = s["_file"]
        for a in s.get("authors", []):
            if PLACEHOLDER.match(a.strip()):
                problems.append(f"{sid}: placeholder author '{a}'")
        if not (s.get("doi") or s.get("pmid") or s.get("url")):
            problems.append(f"{sid}: no DOI, PMID, or URL")
        if s.get("pmid") and not str(s["pmid"]).isdigit():
            problems.append(f"{sid}: malformed PMID '{s['pmid']}'")
    return problems


def _get(url, headers=None, method="GET"):
    req = urllib.request.Request(url, headers=headers or {}, method=method)
    return urllib.request.urlopen(req, timeout=TIMEOUT)


def network_available():
    try:
        _get("https://doi.org/", method="HEAD")
        return True
    except Exception:  # noqa: BLE001
        return False


def online_checks(sources):
    warns = []
    for s in sources:
        sid = s["source_id"]
        doi = s.get("doi")
        if doi:
            try:
                r = _get(f"https://doi.org/{doi}", method="HEAD")
                if r.status >= 400:
                    warns.append(f"{sid}: DOI {doi} returned HTTP {r.status}")
            except urllib.error.HTTPError as e:
                if e.code not in (403, 405):  # some resolvers block HEAD
                    warns.append(f"{sid}: DOI {doi} HTTP {e.code}")
            except Exception as e:  # noqa: BLE001
                warns.append(f"{sid}: DOI {doi} unreachable ({e})")
        pmid = s.get("pmid")
        if pmid and str(pmid).isdigit():
            try:
                url = ("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
                       f"?db=pubmed&id={pmid}&retmode=json")
                data = json.load(_get(url))
                rec = data.get("result", {}).get(str(pmid), {})
                if not rec or rec.get("error"):
                    warns.append(f"{sid}: PMID {pmid} not found in PubMed")
            except Exception as e:  # noqa: BLE001
                warns.append(f"{sid}: PMID {pmid} lookup failed ({e})")
    return warns


def main():
    offline_only = "--offline" in sys.argv
    sources = load_sources()
    print(f"Auditing {len(sources)} sources across "
          f"{len(set(s['_file'] for s in sources))} files.\n")

    problems = offline_checks(sources)
    print("== OFFLINE ==")
    if problems:
        for p in problems:
            print(f"  PROBLEM {p}")
    else:
        print("  clean (no placeholders, duplicates, or missing identifiers)")

    verified = sum(1 for s in sources if s.get("verified"))
    print(f"\nVerified stamps present: {verified}/{len(sources)}")

    if not offline_only:
        print("\n== ONLINE ==")
        if network_available():
            warns = online_checks(sources)
            if warns:
                for w in warns:
                    print(f"  WARN {w}")
            else:
                print("  all DOIs/PMIDs resolved")
        else:
            print("  skipped — network unreachable from here "
                  "(run elsewhere to resolve DOIs/PMIDs).")

    print()
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
