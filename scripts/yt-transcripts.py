"""Pobiera napisy z filmów YouTube i zapisuje je jako czysty tekst.

Użycie:
    python scripts/yt-transcripts.py URL [URL ...]
    python scripts/yt-transcripts.py --playlist URL_KANAŁU_LUB_PLAYLISTY [--limit 20]

Pliki trafiają do marketing/wiedza/transkrypcje/. Pobiera tylko napisy, bez wideo.
Wymaga: python -m pip install --user yt-dlp
"""
import argparse
import os
import re
import subprocess
import sys
import tempfile
from glob import glob

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "marketing", "wiedza", "transkrypcje")


def vtt_to_text(path: str) -> str:
    lines, prev = [], ""
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if not line or "-->" in line or line.startswith(("WEBVTT", "Kind:", "Language:")) or line.isdigit():
            continue
        line = re.sub(r"<[^>]+>", "", line).strip()
        if line and line != prev and (not lines or line != lines[-1]):
            lines.append(line)
        prev = line
    clean = []
    for line in lines:
        if clean and line.startswith(clean[-1]):
            clean[-1] = line
        elif clean and clean[-1].endswith(line):
            continue
        else:
            clean.append(line)
    return re.sub(r"\s+", " ", " ".join(clean))


def video_ids(url: str, limit: int) -> list[str]:
    res = subprocess.run(
        [sys.executable, "-m", "yt_dlp", "--flat-playlist", "--print", "id", "--playlist-end", str(limit), url],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    return [x for x in res.stdout.split() if x]


def fetch(video_id: str, tmp: str) -> None:
    meta = subprocess.run(
        [sys.executable, "-m", "yt_dlp", "--js-runtimes", "node", "--skip-download", "--write-subs", "--write-auto-subs",
         "--sub-langs", "en-orig,en,en-US,nl,pl", "--sub-format", "vtt", "--sleep-subtitles", "3",
         "--print", "%(title)s|%(channel)s", "--no-simulate", "-o", os.path.join(tmp, "%(id)s.%(ext)s"), "--", video_id],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    title = (meta.stdout.strip().splitlines() or [video_id])[-1]
    files = sorted(glob(os.path.join(tmp, video_id + ".*.vtt")), key=lambda f: "orig" not in f)
    if not files:
        print(f"BRAK NAPISÓW: {video_id} {title}")
        return
    text = vtt_to_text(files[0])
    name = re.sub(r"[^A-Za-z0-9]+", "-", title.replace("|", " - "))[:80].strip("-") or video_id
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name + ".txt"), "w", encoding="utf-8") as f:
        f.write(f"# {title}\nhttps://www.youtube.com/watch?v={video_id}\n\n{text}\n")
    print(f"{len(text.split()):6d} słów  {name}")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("urls", nargs="*")
    p.add_argument("--playlist")
    p.add_argument("--limit", type=int, default=20)
    a = p.parse_args()
    ids = []
    for u in a.urls:
        m = re.search(r"(?:v=|youtu\.be/|shorts/)([\w-]{11})", u)
        ids.append(m.group(1) if m else u)
    if a.playlist:
        ids += video_ids(a.playlist, a.limit)
    with tempfile.TemporaryDirectory() as tmp:
        for vid in ids:
            fetch(vid, tmp)


if __name__ == "__main__":
    main()
