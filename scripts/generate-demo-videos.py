from pathlib import Path
import math

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "demo-videos"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 854, 480
FPS = 24
DURATION = 10
S = W / 1280


def font(size: int, bold: bool = False):
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


TITLE = font(int(44 * S), True)
SUBTITLE = font(int(28 * S))
BODY = font(int(24 * S))
SMALL = font(int(18 * S))


def xy(x: int, y: int):
    return int(x * S), int(y * S)


def box(left: int, top: int, right: int, bottom: int):
    return int(left * S), int(top * S), int(right * S), int(bottom * S)


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def gradient_bg(t: float, strong: bool):
    if strong:
        c1 = (8, 18, 30)
        c2 = (14, 116, 105)
        c3 = (245, 112, 70)
    else:
        c1 = (23, 28, 40)
        c2 = (72, 84, 104)
        c3 = (164, 118, 76)
    img = Image.new("RGB", (W, H), c1)
    draw = ImageDraw.Draw(img, "RGBA")
    ox = int(W * (0.18 + 0.02 * math.sin(t)))
    oy = int(H * 0.18)
    draw.ellipse((ox - 210, oy - 160, ox + 260, oy + 260), fill=(*c2, 120))
    ox2 = int(W * 0.82)
    oy2 = int(H * (0.74 + 0.02 * math.cos(t)))
    draw.ellipse((ox2 - 260, oy2 - 220, ox2 + 260, oy2 + 220), fill=(*c3, 90))
    draw.rectangle((0, 0, W, H), outline=(255, 255, 255, 18), width=1)
    return np.array(img)


def draw_avatar(draw, center, radius, initials, strong):
    cx, cy = center
    color = (20, 184, 166) if strong else (100, 116, 139)
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color)
    draw.ellipse((cx - radius + 8, cy - radius + 8, cx + radius - 8, cy + radius - 8), outline=(255, 255, 255, 90), width=3)
    bbox = draw.textbbox((0, 0), initials, font=TITLE)
    draw.text((cx - (bbox[2] - bbox[0]) / 2, cy - int(27 * S)), initials, fill=(255, 255, 255), font=TITLE)


def make_video(filename: str, strong: bool):
    path = OUT / filename
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"mp4v"), FPS, (W, H))
    if not writer.isOpened():
        raise RuntimeError("OpenCV could not open MP4 writer")

    candidate = "Maya Kapoor" if strong else "Dev Patel"
    role = "AI Product Engineer" if strong else "Frontend Developer"
    initials = "MK" if strong else "DP"
    score = 94 if strong else 68
    beats = [
        "Frames the problem clearly",
        "Gives quantified project impact",
        "Explains tradeoffs with confidence",
    ] if strong else [
        "Introduces background clearly",
        "Mentions tools without depth",
        "Needs sharper impact examples",
    ]
    transcript = (
        "I led a cross-functional launch, reduced review time by 41%, and built the evaluation loop in Next.js and Supabase."
        if strong
        else
        "I worked on React pages, fixed bugs, and collaborated with the team. I am comfortable learning new tools."
    )

    for frame_idx in range(FPS * DURATION):
        t = frame_idx / FPS
        img = Image.fromarray(gradient_bg(t, strong))
        draw = ImageDraw.Draw(img, "RGBA")

        rounded_rect(draw, box(64, 54, 1216, 666), int(34 * S), (255, 255, 255, 30), (255, 255, 255, 65), 2)
        rounded_rect(draw, box(96, 94, 610, 626), int(28 * S), (5, 10, 18, 190), (255, 255, 255, 45), 1)
        rounded_rect(draw, box(650, 94, 1184, 626), int(28 * S), (255, 255, 255, 235), None, 1)

        wave = int(5 * S * math.sin(t * 2.4))
        draw_avatar(draw, xy(353, 265 + wave), int(104 * S), initials, strong)
        draw.text(xy(132, 420), candidate, fill=(255, 255, 255), font=TITLE)
        draw.text(xy(132, 477), role, fill=(205, 213, 225), font=SUBTITLE)
        draw.text(xy(132, 530), "AI interview recording", fill=(20, 184, 166) if strong else (251, 146, 60), font=BODY)

        draw.text(xy(692, 132), "HireSight AI review", fill=(15, 23, 42), font=SUBTITLE)
        rounded_rect(draw, box(1022, 118, 1138, 178), int(18 * S), (20, 184, 166) if strong else (251, 146, 60), None)
        draw.text(xy(1048, 129), f"{score}%", fill=(255, 255, 255), font=SUBTITLE)

        y = 218
        for idx, beat in enumerate(beats):
            progress = min(1, max(0, (t - idx * 1.4) / 1.4))
            alpha = int(80 + 175 * progress)
            rounded_rect(draw, box(692, y, 1142, y + 72), int(18 * S), (241, 245, 249, alpha), (203, 213, 225, 180), 1)
            draw.ellipse(box(714, y + 23, 740, y + 49), fill=(20, 184, 166) if strong else (251, 146, 60))
            draw.text(xy(758, y + 21), beat, fill=(30, 41, 59, alpha), font=BODY)
            y += 94

        rounded_rect(draw, box(692, 506, 1142, 590), int(18 * S), (15, 23, 42, 235), None)
        draw.text(xy(718, 525), transcript[:88], fill=(226, 232, 240), font=SMALL)
        if len(transcript) > 88:
            draw.text(xy(718, 552), transcript[88:], fill=(226, 232, 240), font=SMALL)

        pulse = int((18 + 10 * math.sin(t * 5)) * S)
        rec_x, rec_y = xy(100, 110)
        draw.ellipse((rec_x, rec_y, rec_x + pulse, rec_y + pulse), fill=(239, 68, 68, 210))
        draw.text(xy(132, 107), "REC", fill=(255, 255, 255), font=SMALL)

        writer.write(cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR))

    writer.release()
    print(path)


if __name__ == "__main__":
    make_video("strong-ai-interview.mp4", True)
    make_video("average-ai-interview.mp4", False)
