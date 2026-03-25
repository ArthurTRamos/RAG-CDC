"""
Get the CDB's text and parse the required infos (title, chapter and article)
"""

import re
from dataclasses import dataclass

import requests
from bs4 import BeautifulSoup


@dataclass
class Chunk:
    text: str
    article: str
    chapter: str
    title: str


def fetch_html(URL: str):
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "pt-BR,pt;q=0.9"
    }

    response = requests.get(URL, headers=headers)
    response.encoding = response.apparent_encoding
    return response.text


def parse_cdc(html: str):
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(separator="\n")

    chunks = []
    curr_title = ""
    curr_chapter = ""
    buffer = ""
    min_buffer_size = 20

    def save_buffer(buf, title, chapter):
        buf = buf.strip()

        if len(buf) < min_buffer_size:
            return

        num = re.search(r"Art\.\s*(\d+)", buf)
        chunks.append(Chunk(
            text=buf,
            article=num.group(1) if num else "?",
            title=title,
            chapter=chapter,
        ))

    for line in text.split("\n"):
        line_part = line.strip()

        if re.match(r"^T[ÍI]TULO\s+[IVXLC]+", line_part):
            curr_title = line_part

        elif re.match(r"^CAP[ÍI]TULO\s+[IVXLC]+", line_part):
            curr_chapter = line_part

        elif re.match(r"^Art\.\s*\d+", line_part):
            save_buffer(buffer, curr_title, curr_chapter)
            buffer = line + "\n"

        else:
            buffer += line + "\n"

    save_buffer(buffer, curr_title, curr_chapter)

    return chunks[1:]
