import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parent.parent
PROFILE = json.loads((ROOT / "data" / "career.json").read_text())
OUTPUT = ROOT / "assets" / "pdfs" / "Yahya_ElSawi_CV.pdf"
NAVY = colors.HexColor("#142238")
INK = colors.HexColor("#1F2937")
MUTED = colors.HexColor("#536173")
ACCENT = colors.HexColor("#C94F3D")
LINE = colors.HexColor("#D6DCE3")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CVSection", fontName="Helvetica-Bold", fontSize=9.3, leading=12, textColor=NAVY, spaceBefore=5, spaceAfter=4, uppercase=True))
styles.add(ParagraphStyle(name="CVBody", fontName="Helvetica", fontSize=7.7, leading=10, textColor=INK, spaceAfter=2))
styles.add(ParagraphStyle(name="CVRole", fontName="Helvetica-Bold", fontSize=8.1, leading=10, textColor=INK))
styles.add(ParagraphStyle(name="CVDate", fontName="Helvetica-Bold", fontSize=7.2, leading=10, textColor=ACCENT, alignment=TA_RIGHT))
styles.add(ParagraphStyle(name="CVSmall", fontName="Helvetica", fontSize=7.1, leading=9.2, textColor=MUTED))
styles.add(ParagraphStyle(name="CVProject", fontName="Helvetica-Bold", fontSize=7.5, leading=9.3, textColor=INK))


def P(text, style="CVBody"):
    return Paragraph(text.replace("&", "&amp;"), styles[style])


def section(title):
    return [P(title, "CVSection"), Table([['']], colWidths=[174 * mm], rowHeights=[0.45], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), LINE)]))]


def draw_page(canvas, document):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 34 * mm, width, 34 * mm, fill=1, stroke=0)
    canvas.setFillColor(ACCENT)
    canvas.roundRect(18 * mm, height - 20 * mm, 8 * mm, 8 * mm, 1.2 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawCentredString(22 * mm, height - 17.2 * mm, "Y")
    canvas.setFont("Helvetica-Bold", 19)
    canvas.drawString(30 * mm, height - 17 * mm, "Yahya El-Sawi")
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#E6EDF5"))
    canvas.drawString(30 * mm, height - 25 * mm, PROFILE["headline"])
    canvas.setFont("Helvetica", 6.7)
    canvas.setFillColor(colors.white)
    canvas.drawRightString(width - 18 * mm, height - 11.5 * mm, PROFILE["location"])
    canvas.drawRightString(width - 18 * mm, height - 17.5 * mm, PROFILE["email"])
    canvas.drawRightString(width - 18 * mm, height - 23.5 * mm, f"{PROFILE['phone']} · {PROFILE['linkedin']}")
    canvas.drawRightString(width - 18 * mm, height - 29 * mm, "yahyaelsawi.website")
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 6.6)
    canvas.drawString(18 * mm, 8 * mm, f"Yahya El-Sawi · CV · Updated {PROFILE['updated']}")
    canvas.restoreState()


def main():
    document = SimpleDocTemplate(
        str(OUTPUT), pagesize=A4,
        rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=38 * mm, bottomMargin=13 * mm,
        title="Yahya El-Sawi — CV", author="Yahya El-Sawi",
        subject="Product design, UX, and frontend experience",
    )
    story = [P(PROFILE["summary"]), Spacer(1, 1.2 * mm)]
    story += section("Experience")
    for item in PROFILE["experience"]:
        heading = Table([[P(f"{item['role']} · {item['company']}", "CVRole"), P(item["date"], "CVDate")]], colWidths=[127 * mm, 47 * mm], style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        story.extend([heading, P(item["description"], "CVSmall"), Spacer(1, 1.2 * mm)])
    story += section("Selected projects")
    for item in PROFILE["projects"]:
        line = Table([[P(f"{item['name']} — {item['description']}", "CVSmall"), P(item["date"], "CVDate")]], colWidths=[134 * mm, 40 * mm], style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 1),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        story.append(line)
    story += section("Education")
    education = PROFILE["education"]
    story.append(P(f"<b>{education['degree']}</b> · {education['institution']}<br/>Minor in {education['minor']} · Awarded {education['awarded']}", "CVBody"))
    story += section("Skills")
    skills = PROFILE["skills"]
    for title, key in [("Product & UX", "productDesign"), ("Frontend", "frontend"), ("Technical systems", "technicalSystems")]:
        story.append(P(f"<b>{title}:</b> {skills[key]}", "CVSmall"))
    story.append(Spacer(1, 1.6 * mm))
    story.append(P(f"{PROFILE['availability']} · {PROFILE['workAuthorization']}", "CVSmall"))
    document.build(story, onFirstPage=draw_page, onLaterPages=draw_page)


if __name__ == "__main__":
    main()
