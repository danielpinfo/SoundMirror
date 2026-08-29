"""Build an offline comparison report for SoundMirror's Arabic catalog.

This is a certification aid, not an application dependency. It expects the
research-only CAMeL Tools and Mishkal environments described in the audit notes.
The generated JSON is intentionally review material; it never marks a catalog
entry approved by itself.
"""

from __future__ import annotations

import argparse
import ast
import json
import re
from pathlib import Path

from camel_tools.disambig.mle import MLEDisambiguator
from camel_tools.tokenizers.word import simple_word_tokenize
from camel_tools.utils.dediac import dediac_ar
from mishkal.tashkeel import TashkeelClass


WORDS_BLOCK = re.compile(r"words\s*:\s*\[(.*?)\]", re.DOTALL)
GROUP_ID = re.compile(r'id\s*:\s*"([^"]+)"')
QUOTED = re.compile(r'"((?:[^"\\]|\\.)*)"')
TRUTH_GROUP = re.compile(
    r"(group_[a-z]+)\s*:\s*Object\.freeze\(\[(.*?)\]\)", re.DOTALL
)
FINAL_CASE_MARKS = re.compile(r"[\u064b-\u0650\u0652]+$")


def parse_catalog(source_path: Path) -> list[dict]:
    source = source_path.read_text(encoding="utf-8")
    groups = []

    cursor = 0
    for match in WORDS_BLOCK.finditer(source):
        header = source[cursor : match.start()]
        group_matches = list(GROUP_ID.finditer(header))
        if not group_matches:
            raise ValueError(f"Could not identify group before offset {match.start()}")

        group_id = group_matches[-1].group(1)
        words = [json.loads(f'"{item.group(1)}"') for item in QUOTED.finditer(match.group(1))]
        groups.append({"groupId": group_id, "words": words})
        cursor = match.end()

    return groups


def parse_truth(truth_path: Path) -> dict[str, list[str]]:
    source = truth_path.read_text(encoding="utf-8")
    return {
        match.group(1): ast.literal_eval("[" + match.group(2) + "]")
        for match in TRUTH_GROUP.finditer(source)
    }


def normalize_candidate(value: str) -> str:
    return " ".join(value.strip().split())


def pausal_compare(value: str) -> str:
    return " ".join(FINAL_CASE_MARKS.sub("", token) for token in value.split())


def camel_candidates(disambiguator: MLEDisambiguator, text: str) -> dict:
    tokens = simple_word_tokenize(text)
    disambiguated = disambiguator.disambiguate(tokens)
    token_reports = []

    for token, word in zip(tokens, disambiguated):
        analyses = []
        seen = set()
        for scored in word.analyses:
            analysis = scored.analysis
            diac = normalize_candidate(analysis.get("diac", token))
            key = (diac, analysis.get("pos"), analysis.get("lex"))
            if key in seen:
                continue
            seen.add(key)
            analyses.append(
                {
                    "diac": diac,
                    "score": round(float(scored.score), 6),
                    "pos": analysis.get("pos"),
                    "lex": analysis.get("lex"),
                    "gloss": analysis.get("gloss"),
                    "root": analysis.get("root"),
                    "person": analysis.get("per"),
                    "gender": analysis.get("gen"),
                    "number": analysis.get("num"),
                    "aspect": analysis.get("asp"),
                    "case": analysis.get("cas"),
                    "source": analysis.get("source"),
                }
            )

        token_reports.append(
            {
                "source": token,
                "analyses": analyses,
                "top": analyses[0]["diac"] if analyses else token,
            }
        )

    return {
        "tokens": token_reports,
        "top": " ".join(token["top"] for token in token_reports),
    }


def build_report(source_path: Path, truth_path: Path | None = None) -> dict:
    groups = parse_catalog(source_path)
    truth_groups = parse_truth(truth_path) if truth_path else {}
    disambiguator = MLEDisambiguator.pretrained("calima-msa-r13", top=12)
    mishkal = TashkeelClass()
    unique = {}
    occurrences = []

    for group in groups:
        for index, source in enumerate(group["words"]):
            normalized = normalize_candidate(source)
            occurrence = {
                "groupId": group["groupId"],
                "index": index,
                "source": source,
                "normalized": normalized,
            }
            occurrences.append(occurrence)
            unique.setdefault(normalized, []).append(
                {"groupId": group["groupId"], "index": index}
            )

    entries = []
    for source, positions in unique.items():
        camel = camel_candidates(disambiguator, source)
        mishkal_value = normalize_candidate(mishkal.tashkeel(source))
        camel_top = normalize_candidate(camel["top"])
        truth_values = {
            truth_groups[position["groupId"]][position["index"]]
            for position in positions
            if position["groupId"] in truth_groups
        }
        if len(truth_values) > 1:
            raise ValueError(f"Conflicting truth readings for {source}: {truth_values}")
        truth = next(iter(truth_values), None)

        camel_support = False
        if truth:
            truth_tokens = truth.split()
            if len(truth_tokens) == len(camel["tokens"]):
                camel_support = all(
                    any(
                        pausal_compare(analysis["diac"])
                        == pausal_compare(truth_token)
                        for analysis in token_report["analyses"]
                    )
                    for truth_token, token_report in zip(truth_tokens, camel["tokens"])
                )
        entries.append(
            {
                "source": source,
                "dediacritized": dediac_ar(source),
                "occurrences": positions,
                "camel": camel,
                "mishkal": mishkal_value,
                "enginesAgree": camel_top == mishkal_value,
                "truth": truth,
                "camelSupportsTruth": camel_support,
                "mishkalSupportsTruth": bool(truth)
                and pausal_compare(mishkal_value) == pausal_compare(truth),
            }
        )

    return {
        "schemaVersion": 1,
        "purpose": "candidate-comparison-only",
        "sources": {
            "camel": "CAMeL Tools calima-msa-r13 MLE, top 12 analyses",
            "mishkal": "Mishkal rule/dictionary vocalizer",
        },
        "summary": {
            "groups": len(groups),
            "occurrences": len(occurrences),
            "unique": len(entries),
            "engineAgreements": sum(entry["enginesAgree"] for entry in entries),
            "camelSupportsTruth": sum(entry["camelSupportsTruth"] for entry in entries),
            "mishkalSupportsTruth": sum(entry["mishkalSupportsTruth"] for entry in entries),
            "unsupportedTruth": sum(
                bool(entry["truth"])
                and not entry["camelSupportsTruth"]
                and not entry["mishkalSupportsTruth"]
                for entry in entries
            ),
        },
        "entries": entries,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--truth", type=Path)
    args = parser.parse_args()

    report = build_report(
        args.source.resolve(), args.truth.resolve() if args.truth else None
    )
    args.output.resolve().write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report["summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
