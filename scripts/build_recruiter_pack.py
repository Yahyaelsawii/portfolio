#!/usr/bin/env python3
"""Build the concise recruiter brief distributed with the portfolio."""

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "pdfs" / "Yahya_ElSawi_Recruiter_Pack.pdf"
SITE = "https://yahya-elsawi-portfolio-bnj.pages.dev"
EMAIL = "yahyaelsawi1@gmail.com"
PHONE = "+971 50 168 1229"

PAGE_W, PAGE_H = A4
MARGIN = 42
NAVY = HexColor("#101827")
INK = HexColor("#172033")
MUTED = HexColor("#596273")
TEAL = HexColor("#008F83")
RED = HexColor("#EC1647")
SURFACE = HexColor("#F3F6F8")
BORDER = HexColor("#D8DEE6")


def split_lines(text, font, size, width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and stringWidth(candidate, font, size) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def wrapped(c, text, x, y, width, font="Helvetica", size=9, color=INK, leading=None, max_lines=None):
    leading = leading or size * 1.38
    lines = split_lines(text, font, size, width)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        last = lines[-1]
        while last and stringWidth(f"{last}...", font, size) > width:
            last = last[:-1]
        lines[-1] = f"{last.rstrip()}..."
    c.setFillColor(color)
    c.setFont(font, size)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def label(c, text, x, y, color=TEAL):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 7.2)
    c.drawString(x, y, text.upper())


def section_title(c, eyebrow, title, y):
    label(c, eyebrow, MARGIN, y)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(MARGIN, y - 24, title)
    return y - 42


def footer(c, page):
    c.setStrokeColor(BORDER)
    c.line(MARGIN, 28, PAGE_W - MARGIN, 28)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(MARGIN, 16, "Yahya El-Sawi / Recruiter brief / August 2026")
    c.drawRightString(PAGE_W - MARGIN, 16, f"{page} / 2")


def role_card(c, x, y, width, number, title, skills, body):
    height = 154
    c.setFillColor(SURFACE)
    c.setStrokeColor(BORDER)
    c.roundRect(x, y - height, width, height, 4, fill=1, stroke=1)
    label(c, f"{number} / Role fit", x + 14, y - 20)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x + 14, y - 43, title)
    wrapped(c, skills, x + 14, y - 65, width - 28, "Helvetica-Bold", 7.8, RED, 10.5, 3)
    wrapped(c, body, x + 14, y - 101, width - 28, "Helvetica", 8.2, MUTED, 11.2, 4)


def evidence_card(c, y, number, title, category, body, proof, url):
    x = MARGIN
    width = PAGE_W - (MARGIN * 2)
    height = 128
    c.setFillColor(SURFACE)
    c.setStrokeColor(BORDER)
    c.roundRect(x, y - height, width, height, 4, fill=1, stroke=1)
    c.setFillColor(TEAL)
    c.rect(x, y - height, 5, height, fill=1, stroke=0)
    label(c, f"{number} / {category}", x + 18, y - 20)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(x + 18, y - 42, title)
    wrapped(c, body, x + 18, y - 61, width - 190, "Helvetica", 8.5, MUTED, 11.5, 3)
    c.setFillColor(white)
    c.setStrokeColor(NAVY)
    c.roundRect(x + width - 154, y - 100, 136, 30, 3, fill=0, stroke=1)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(x + width - 86, y - 89, "OPEN CASE STUDY")
    c.linkURL(url, (x + width - 154, y - 100, x + width - 18, y - 70), relative=0)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 8.2)
    c.drawString(x + 18, y - 111, "Verified boundary:")
    wrapped(c, proof, x + 98, y - 111, width - 270, "Helvetica", 8, MUTED, 10.5, 2)
    return y - height - 14


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("Yahya El-Sawi — Recruiter Brief")
    c.setAuthor("Yahya El-Sawi")
    c.setSubject("Role fit, professional signals, and verified project evidence")

    # Page 1: role fit and practical hiring context.
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 166, PAGE_W, 166, fill=1, stroke=0)
    c.setFillColor(RED)
    c.roundRect(MARGIN, PAGE_H - 65, 24, 24, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(MARGIN + 12, PAGE_H - 57, "Y")
    label(c, "Recruiter brief / August 2026", MARGIN + 34, PAGE_H - 52, white)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(MARGIN, PAGE_H - 101, "Yahya El-Sawi")
    c.setFont("Helvetica", 11)
    c.drawString(MARGIN, PAGE_H - 124, "Product & UX / Frontend / Cybersecurity & Networks")
    wrapped(c, "A Dubai-based computing graduate who connects product judgment, responsive implementation, and disciplined technical evidence.", MARGIN, PAGE_H - 146, PAGE_W - (MARGIN * 2), "Helvetica", 8.8, HexColor("#D9E1EC"), 11, 2)

    y = PAGE_H - 198
    facts = [
        ("Location", "Dubai, UAE"),
        ("Availability", "As soon as needed"),
        ("Authorization", "Self-sponsored Golden Visa"),
        ("Mobility", "Remote + relocation"),
    ]
    fact_w = (PAGE_W - MARGIN * 2) / 4
    for index, (name, value) in enumerate(facts):
        x = MARGIN + index * fact_w
        if index:
            c.setStrokeColor(BORDER)
            c.line(x - 9, y + 4, x - 9, y - 37)
        label(c, name, x, y)
        wrapped(c, value, x, y - 18, fact_w - 18, "Helvetica-Bold", 8.8, INK, 11, 3)

    y = section_title(c, "01 / Target roles", "Three credible entry points.", PAGE_H - 284)
    gap = 10
    card_w = (PAGE_W - MARGIN * 2 - gap * 2) / 3
    role_card(c, MARGIN, y, card_w, "01", "Product & UX", "Figma / flows / responsive UX / accessibility", "Research-led product thinking with implementation-aware decisions and clear scope boundaries.")
    role_card(c, MARGIN + card_w + gap, y, card_w, "02", "Frontend", "HTML / CSS / JavaScript / Vue / testing", "Responsive production experience spanning UX, performance, databases, testing, and transactional communication.")
    role_card(c, MARGIN + (card_w + gap) * 2, y, card_w, "03", "Cybersecurity", "Palo Alto / AD / LDAP / Cisco / Python", "Hands-on isolated labs and academic automation work grounded in validation and systematic troubleshooting.")

    y = y - 187
    y = section_title(c, "02 / Professional signals", "Experience with accountable boundaries.", y)
    signals = [
        ("May 2024–Present", "Gift It", "Frontend Developer & Product Associate", "Production web features, UX, testing, performance, databases, and product collaboration."),
        ("Jul–Aug 2026", "StarLink, an Infinigate Group Company", "Cybersecurity Intern", "Enterprise firewall, identity, authentication, networking, traffic-analysis, and troubleshooting labs."),
    ]
    for index, (date, company, role, body) in enumerate(signals):
        row_y = y - index * 67
        c.setStrokeColor(BORDER)
        c.line(MARGIN, row_y - 50, PAGE_W - MARGIN, row_y - 50)
        label(c, date, MARGIN, row_y)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9.3)
        c.drawString(MARGIN + 92, row_y, company)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(MARGIN + 92, row_y - 17, role)
        wrapped(c, body, MARGIN + 316, row_y, PAGE_W - MARGIN - (MARGIN + 316), "Helvetica", 7.6, MUTED, 10, 4)

    c.setFillColor(SURFACE)
    c.setStrokeColor(BORDER)
    c.roundRect(MARGIN, 57, PAGE_W - MARGIN * 2, 84, 4, fill=1, stroke=1)
    label(c, "03 / Quick verification", MARGIN + 14, 122)
    checks = [
        ("11 credentials", "Visible previews + source files"),
        ("7 project records", "Contribution and outcome boundaries"),
        ("Direct contact", "Secure first-party form handler"),
    ]
    check_w = (PAGE_W - MARGIN * 2 - 28) / 3
    for index, (title, body) in enumerate(checks):
        x = MARGIN + 14 + index * check_w
        if index:
            c.setStrokeColor(BORDER)
            c.line(x - 10, 72, x - 10, 110)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 8.6)
        c.drawString(x, 99, title)
        wrapped(c, body, x, 83, check_w - 18, "Helvetica", 7.2, MUTED, 9, 3)

    footer(c, 1)
    c.showPage()

    # Page 2: case-study evidence and contact paths.
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 94, PAGE_W, 94, fill=1, stroke=0)
    label(c, "Evidence over claims", MARGIN, PAGE_H - 35, white)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 23)
    c.drawString(MARGIN, PAGE_H - 66, "A short path to the proof.")

    y = section_title(c, "03 / Selected evidence", "Three projects, three explicit boundaries.", PAGE_H - 126)
    y = evidence_card(c, y, "01", "Gift It Checkout & E-Invite Redesign", "Production-informed UX", "Maps checkout friction, trust, confirmation, and transactional communication into an end-to-end product proposal.", "No conversion lift is claimed; the case study defines what should be measured after implementation.", f"{SITE}/work/gift-it")
    y = evidence_card(c, y, "02", "SmartMall AI Network Automation", "Academic proof of concept", "Turns network intent into explainable plans, deployment actions, validation evidence, and closed-loop recovery in GNS3.", "Equal contribution across five collaborators; the demo improved passing pings from 7/10 to 9/10 in about seven minutes.", f"{SITE}/work/network-automation")
    y = evidence_card(c, y, "03", "Vehicle Rental Operations Database", "Backend & data", "An Oracle relational backend covering access control, operational queries, transactions, reporting views, and backup planning.", "The backend was implemented; the dashboard shown in the case study remains a product concept.", f"{SITE}/work/vehicle-rental")

    c.setFillColor(SURFACE)
    c.setStrokeColor(BORDER)
    c.roundRect(MARGIN, 127, PAGE_W - MARGIN * 2, 122, 4, fill=1, stroke=1)
    label(c, "04 / Education & toolkit", MARGIN + 16, 229)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(MARGIN + 16, 207, "BSc Computing and Information Technologies / Business Administration minor")
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawString(MARGIN + 16, 191, "Rochester Institute of Technology Dubai / Awarded May 2026")
    label(c, "Product & UX", MARGIN + 16, 166)
    c.setFillColor(INK)
    c.setFont("Helvetica", 7.8)
    c.drawString(MARGIN + 88, 166, "Figma / prototyping / responsive UX / accessibility")
    label(c, "Frontend", MARGIN + 16, 150)
    c.setFillColor(INK)
    c.setFont("Helvetica", 7.8)
    c.drawString(MARGIN + 88, 150, "HTML/CSS / JavaScript / Vue.js / React Native / testing")
    label(c, "Systems", MARGIN + 16, 134)
    c.setFillColor(INK)
    c.setFont("Helvetica", 7.8)
    c.drawString(MARGIN + 88, 134, "Oracle / Python / Cisco IOS / Palo Alto / Active Directory / LDAP/LDAPS")

    c.setFillColor(NAVY)
    c.roundRect(MARGIN, 52, PAGE_W - MARGIN * 2, 68, 4, fill=1, stroke=0)
    label(c, "Contact / deeper evidence", MARGIN + 16, 101, white)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN + 16, 80, EMAIL)
    c.setFont("Helvetica", 8)
    c.drawString(MARGIN + 16, 65, PHONE)
    c.setFont("Helvetica-Bold", 8)
    c.drawRightString(PAGE_W - MARGIN - 16, 80, "PORTFOLIO + FULL CV")
    c.setFont("Helvetica", 7.5)
    c.drawRightString(PAGE_W - MARGIN - 16, 65, SITE.replace("https://", ""))
    c.linkURL(f"mailto:{EMAIL}", (MARGIN + 16, 60, MARGIN + 180, 87), relative=0)
    c.linkURL(SITE, (PAGE_W - MARGIN - 240, 60, PAGE_W - MARGIN - 16, 91), relative=0)

    footer(c, 2)
    c.save()


if __name__ == "__main__":
    build()
    print(OUTPUT)
