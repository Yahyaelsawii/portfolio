from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "assets" / "pdfs" / "Yahya_ElSawi_CV.pdf"

INK = colors.HexColor("#0F172A")
TEXT = colors.HexColor("#334155")
MUTED = colors.HexColor("#64748B")
ACCENT = colors.HexColor("#0F766E")
LINE = colors.HexColor("#CBD5E1")
SOFT = colors.HexColor("#F1F5F9")


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="Name",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=25,
    leading=29,
    textColor=INK,
    alignment=TA_CENTER,
    spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="Role",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=10.5,
    leading=14,
    textColor=ACCENT,
    alignment=TA_CENTER,
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="Contact",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.3,
    leading=11,
    textColor=TEXT,
    alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    name="Section",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=10.5,
    leading=13,
    textColor=INK,
    spaceBefore=12,
    spaceAfter=7,
    borderWidth=0,
    borderPadding=0,
))
styles.add(ParagraphStyle(
    name="ItemTitle",
    parent=styles["Heading3"],
    fontName="Helvetica-Bold",
    fontSize=9.4,
    leading=12,
    textColor=INK,
    spaceAfter=2,
))
styles.add(ParagraphStyle(
    name="ItemMeta",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=8.2,
    leading=10.5,
    textColor=ACCENT,
    spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="Body",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=8.7,
    leading=12.2,
    textColor=TEXT,
    spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="CVBullet",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=8.45,
    leading=11.6,
    textColor=TEXT,
    leftIndent=10,
    firstLineIndent=-8,
    spaceAfter=2.5,
))
styles.add(ParagraphStyle(
    name="Skill",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=8.2,
    leading=11.5,
    textColor=TEXT,
    spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="Small",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=7.4,
    leading=10,
    textColor=MUTED,
))


def section(title):
    heading = Table([[Paragraph(title.upper(), styles["Section"])], [""]], colWidths=[None])
    heading.setStyle(TableStyle([
        ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
        ("TOPPADDING", (0, 0), (-1, 0), 0),
        ("LINEBELOW", (0, 0), (-1, 0), 0.7, LINE),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 0),
        ("TOPPADDING", (0, 1), (-1, 1), 0),
    ]))
    return heading


def bullets(items):
    return [Paragraph(f"- {item}", styles["CVBullet"]) for item in items]


def role(title, organization, timeline, summary, items):
    content = [
        Paragraph(title, styles["ItemTitle"]),
        Paragraph(f"{organization} | {timeline}", styles["ItemMeta"]),
        Paragraph(summary, styles["Body"]),
        *bullets(items),
    ]
    return KeepTogether(content)


def project(title, meta, summary, items):
    return KeepTogether([
        Paragraph(title, styles["ItemTitle"]),
        Paragraph(meta, styles["ItemMeta"]),
        Paragraph(summary, styles["Body"]),
        *bullets(items),
    ])


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, 14 * mm, A4[0] - doc.rightMargin, 14 * mm)
    canvas.setFont("Helvetica", 7.2)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 9 * mm, "Yahya El-Sawi | Public CV | Updated August 2026")
    canvas.drawRightString(A4[0] - doc.rightMargin, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def build():
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=20 * mm,
        title="Yahya El-Sawi - CV",
        author="Yahya El-Sawi",
        subject="UI/UX, frontend, product, and technical systems experience",
    )

    contact = (
        '<link href="mailto:yahyaelsawi1@gmail.com" color="#0F766E">yahyaelsawi1@gmail.com</link>'
        '  |  +971 50 168 1229  |  Dubai, UAE  |  '
        '<link href="https://www.linkedin.com/in/yahya-elsawi/" color="#0F766E">LinkedIn</link>'
        '  |  <link href="https://github.com/Yahyaelsawii" color="#0F766E">GitHub</link>'
        '  |  <link href="https://yahya-elsawi-portfolio-bnj.pages.dev" color="#0F766E">Portfolio</link>'
    )

    story = [
        Paragraph("YAHYA EL-SAWI", styles["Name"]),
        Paragraph("UI/UX Designer | Frontend Developer | Product and Technical Systems", styles["Role"]),
        Paragraph(contact, styles["Contact"]),
        Spacer(1, 7),
        Table([[Paragraph(
            "Computing and Information Technologies graduate with production web experience and a practice spanning product UX, responsive frontend development, databases, software testing, and technical systems. Based in Dubai, available as soon as needed, open to remote work and relocation, and self-sponsored through a UAE Golden Visa.",
            styles["Body"],
        )]], colWidths=[None], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), SOFT),
            ("BOX", (0, 0), (-1, -1), 0.6, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])),
        section("Professional experience"),
        role(
            "Software & Web Developer",
            "Gift It, Dubai, UAE",
            "May 2024 - Present",
            "Joined as a three-month intern before moving into a full-time role spanning production web, UX, databases, testing, performance, and product collaboration.",
            [
                "Develop and maintain responsive product experiences across desktop and mobile.",
                "Support production features, database schemas, software testing, performance improvements, and bug documentation.",
                "Build transactional HTML/CSS emails and improve checkout, confirmation, and e-invite user flows.",
                "Collaborate directly with the founder on product direction and business-focused digital improvements.",
            ],
        ),
        Spacer(1, 6),
        role(
            "Cybersecurity & IT Intern - Part-time",
            "StarLink, an Infinigate Group Company, Dubai, UAE",
            "9 Jun - 28 Aug 2026 (dates pending final HR record)",
            "Isolated-lab training across enterprise firewall administration, directory services, certificates, network services, security policy, and troubleshooting.",
            [
                "Validated Active Directory-backed LDAP on TCP 389 and LDAPS on TCP 636.",
                "Configured lab firewall interfaces, zones, security policy, NAT, DNS, DHCP, routing, and administrator authentication.",
                "Worked with Palo Alto Networks, PAN-OS, Windows Server 2019, SSL/TLS certificates, Certificate Authority integration, VMware, Wireshark, GlobalProtect, and Forcepoint DLP concepts.",
                "Public material excludes internal and customer configurations, credentials, documents, diagrams, procedures, communications, and proprietary training content.",
            ],
        ),
        section("Education"),
        KeepTogether([
            Paragraph("Bachelor of Science in Computing and Information Technologies", styles["ItemTitle"]),
            Paragraph("Rochester Institute of Technology Dubai | Awarded May 2026", styles["ItemMeta"]),
            Paragraph("Minor in Business Administration", styles["Body"]),
        ]),
        section("Core skills"),
        Paragraph("<b>Product and design:</b> UI/UX design, product thinking, accessibility, design systems, responsive design, wireframing, prototyping, Figma, Arabic localization", styles["Skill"]),
        Paragraph("<b>Frontend and software:</b> HTML, CSS, JavaScript, Vue.js, React Native, Tailwind CSS, PHP, Flask, Python, Java, C#, Bash", styles["Skill"]),
        Paragraph("<b>Data and systems:</b> MySQL, Oracle SQL, database design, normalization, data integrity, software testing, Git/GitHub, AWS, Shopify, Odoo, SendGrid", styles["Skill"]),
        Paragraph("<b>Networking and security:</b> Palo Alto Networks, PAN-OS, Active Directory, LDAP/LDAPS, SSL/TLS, Cisco IOS, GNS3, VLANs, ACLs, OSPF, NAT, DNS, DHCP, Netmiko, Docker, Wireshark, iperf3", styles["Skill"]),
        Paragraph("<b>Immersive technology:</b> Unity, OpenXR, XR Interaction Toolkit, world-space UI, Meta Quest, VR accessibility", styles["Skill"]),
        PageBreak(),
        section("Selected project evidence"),
        project(
            "Gift It Checkout & E-Invite Flow Redesign",
            "UX / Product (Web)",
            "A conversion-focused redesign addressing checkout friction, trust, e-invite setup, confirmation states, and transactional communication.",
            [
                "Proposed a clearer stepper, earlier trust and support information, smart e-invite defaults, optional messaging and scheduling, and clearer post-purchase status.",
                "Defined a measurement plan covering checkout and payment completion, e-invite completion, time to purchase, support volume, email engagement, and refunds or disputes.",
            ],
        ),
        Spacer(1, 7),
        project(
            "RIT Student App 2.0",
            "Product / UX | RIT Dubai | Sep - Dec 2023",
            "A proposed replacement for the Pulse student experience focused on reliable sign-in, timely notifications, accessibility, and unified myCourses and SIS access.",
            [
                "Led design and development around a task-led information architecture for daily academic and administrative work.",
                "Produced user flows and high-fidelity mobile screens grounded in student pain points.",
            ],
        ),
        Spacer(1, 7),
        project(
            "Vehicle Rental Operations Database",
            "Database Developer | RIT Dubai",
            "An implemented Oracle relational database with normalized operations data, least-privilege roles, operational queries and views, transaction logic, and a cold-backup-to-S3 strategy.",
            [
                "Modeled customers, vehicles, rentals, maintenance, employees, and daily cost data.",
                "The accompanying dashboard visual is a product concept; the database and backend operations were the implemented scope.",
            ],
        ),
        Spacer(1, 7),
        project(
            "SmartMall AI Network Automation",
            "Collaborative five-person academic project | RIT Dubai | Spring 2026",
            "A GNS3 proof of concept combining a browser dashboard, AI-assisted planning, Python and Netmiko automation, Cisco routing and switching, tenant orchestration, validation, and closed-loop correction.",
            [
                "Yahya's documented contribution was 16%, centered on documentation and error handling; all system outcomes are team results.",
                "In the demonstrated recovery scenario, team results improved from 7 of 10 successful pings to 9 of 10 after correction, with the sequence reported at about seven minutes.",
                "Limitations included a small IPv4-only Cisco-focused topology, single-site scope, no production RBAC, no simultaneous onboarding, validation latency, and policy variability in AI-generated ACLs.",
            ],
        ),
        section("Additional experience and credentials"),
        Paragraph("<b>NASA Space Apps Hackathon, Oct 2023:</b> Contributed team-matching logic to Winder, an open-source swipe-based project-discovery platform.", styles["Body"]),
        Paragraph("<b>Selected credentials:</b> Software Design: Modeling with UML; Business Analysis and Process Management; Odoo Technical Bootcamp; RIT Dubai and ZainTECH Data Challenge; active CITI training in minimal-risk student research, social and behavioral research, research security, and export compliance.", styles["Body"]),
        Paragraph("Arabic and English: native proficiency.", styles["Body"]),
        Spacer(1, 8),
        Table([[Paragraph(
            'Detailed case studies, verified credentials, and the public privacy notice are available at <link href="https://yahya-elsawi-portfolio-bnj.pages.dev" color="#0F766E">yahya-elsawi-portfolio-bnj.pages.dev</link>.',
            styles["Small"],
        )]], colWidths=[None], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), SOFT),
            ("BOX", (0, 0), (-1, -1), 0.6, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ])),
    ]

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(f"Built {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    build()
