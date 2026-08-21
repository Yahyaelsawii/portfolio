from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "Yahya_ElSawi_Portfolio_Roadmap_and_Sitemap.pdf"
LOCAL_BASE = "http://127.0.0.1:4173"
PRODUCTION_BASE = "https://yahya-elsawi-portfolio-bnj.pages.dev"

INK = colors.HexColor("#111827")
MUTED = colors.HexColor("#596164")
TEAL = colors.HexColor("#267C78")
TEAL_PALE = colors.HexColor("#EAF7F5")
PAPER = colors.HexColor("#F7F8FA")
WHITE = colors.white
LINE = colors.HexColor("#D8DEE5")
AMBER = colors.HexColor("#A65A20")
AMBER_PALE = colors.HexColor("#FFF3E8")
PRIVATE = colors.HexColor("#563B72")
PRIVATE_PALE = colors.HexColor("#F3EEFA")

PAGE_WIDTH, PAGE_HEIGHT = landscape(A4)


def href(base, route):
    suffix = "/" if route == "/" else route
    return f"{base}{suffix}"


PUBLIC_CORE = [
    ("Home", "/", "Starting point and primary navigation", "Direct entry"),
    ("Work", "/work/", "Header: Work", "Professional Experience opens first"),
    ("About", "/about/", "Header: About", "Public"),
    ("Recruiter Quick View", "/recruiter/", "Home or Work recruiter action", "Public"),
    ("Resume", "/resume/", "Header: Resume", "PDF opens first"),
    ("Contact", "/contact/", "Header: Contact", "Public form"),
    ("Yahya'AI Terminal", "/terminal/", "Header: Terminal", "Live AI or labeled fallback"),
    ("Privacy", "/privacy/", "Footer and privacy notices", "Public support page"),
]

PROJECTS = [
    ("VR Neuroanatomy", "/work/vr-neuroanatomy/", "Work > Case Studies > Locked", "Notice public; content withheld"),
    ("SmartMall Network Automation", "/work/network-automation/", "Work > Case Studies", "Published"),
    ("Mood Insights", "/work/mood-insights/", "Work > Case Studies", "Published"),
    ("RIT Student App", "/work/rit-app/", "Work > Case Studies", "Published"),
    ("Gift It", "/work/gift-it/", "Work > Case Studies", "Published"),
    ("Passwordless Redesign", "/work/passwordless/", "Work > Case Studies", "Published"),
    ("Vehicle Rental Database", "/work/vehicle-rental/", "Work > Case Studies", "Published"),
]

PRIVATE_ROUTES = [
    ("Admin Analytics", "/admin/", "Direct URL only", "Owner only - Cloudflare Access"),
    ("Private Developer Log", "/admin/log/", "Admin > Developer Log", "Owner only - Cloudflare Access"),
]


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="Kicker", fontName="Courier-Bold", fontSize=7.5, leading=10,
    textColor=TEAL, spaceAfter=8, uppercase=True,
))
styles.add(ParagraphStyle(
    name="Display", fontName="Helvetica-Bold", fontSize=30, leading=33,
    textColor=INK, spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="PageTitle", fontName="Helvetica-Bold", fontSize=20, leading=23,
    textColor=INK, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="Lead", fontName="Helvetica", fontSize=10.5, leading=15,
    textColor=MUTED, spaceAfter=14,
))
styles.add(ParagraphStyle(
    name="BodySmall", fontName="Helvetica", fontSize=8, leading=11,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="Body", fontName="Helvetica", fontSize=9, leading=13,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="CardTitle", fontName="Helvetica-Bold", fontSize=11, leading=13,
    textColor=INK, spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="TableHeader", fontName="Courier-Bold", fontSize=6.5, leading=8,
    textColor=WHITE, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="TableCell", fontName="Helvetica", fontSize=6.5, leading=8.5,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="TableCellBold", fontName="Helvetica-Bold", fontSize=6.5, leading=8.5,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="LinkCell", fontName="Helvetica-Bold", fontSize=6.5, leading=8.5,
    textColor=TEAL, alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    name="CenterSmall", fontName="Helvetica", fontSize=7.5, leading=10,
    textColor=MUTED, alignment=TA_CENTER,
))


class AccessCard(Flowable):
    def __init__(self, width, title, value, detail, fill, accent):
        super().__init__()
        self.width = width
        self.height = 72
        self.title = title
        self.value = value
        self.detail = detail
        self.fill = fill
        self.accent = accent

    def draw(self):
        self.canv.setFillColor(self.fill)
        self.canv.setStrokeColor(self.accent)
        self.canv.roundRect(0, 0, self.width, self.height, 5, fill=1, stroke=1)
        self.canv.setFillColor(self.accent)
        self.canv.setFont("Courier-Bold", 7)
        self.canv.drawString(12, 54, self.title.upper())
        self.canv.setFillColor(INK)
        self.canv.setFont("Helvetica-Bold", 19)
        self.canv.drawString(12, 30, self.value)
        self.canv.setFillColor(MUTED)
        self.canv.setFont("Helvetica", 7.5)
        self.canv.drawString(12, 13, self.detail)


class RoadmapDiagram(Flowable):
    def __init__(self, width=760, height=405):
        super().__init__()
        self.width = width
        self.height = height

    def box(self, x, y, w, h, title, subtitle="", fill=WHITE, stroke=LINE, title_size=8.5):
        c = self.canv
        c.setFillColor(fill)
        c.setStrokeColor(stroke)
        c.roundRect(x, y, w, h, 4, fill=1, stroke=1)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", title_size)
        c.drawCentredString(x + w / 2, y + h - 15, title)
        if subtitle:
            c.setFillColor(MUTED)
            c.setFont("Helvetica", 6.2)
            c.drawCentredString(x + w / 2, y + 8, subtitle)

    def connector(self, x1, y1, x2, y2, color=LINE):
        self.canv.setStrokeColor(color)
        self.canv.setLineWidth(1)
        self.canv.line(x1, y1, x2, y2)

    def draw(self):
        c = self.canv
        c.setFillColor(PAPER)
        c.roundRect(0, 0, self.width, self.height, 6, fill=1, stroke=0)

        home_x, home_y, home_w, home_h = 320, 348, 120, 42
        self.box(home_x, home_y, home_w, home_h, "HOME", "Primary entry", TEAL_PALE, TEAL, 10)

        primary = [
            ("Work", "Employment + projects"), ("About", "Biography"),
            ("Resume", "CV + credentials"), ("Contact", "Direct form"),
            ("Yahya'AI", "Assistant"), ("Recruiter", "Quick view"),
            ("Privacy", "Support"),
        ]
        start_x, gap, w, h, y = 15, 7, 98, 39, 270
        rail_y = 329
        self.connector(home_x + home_w / 2, home_y, home_x + home_w / 2, rail_y, TEAL)
        self.connector(start_x + w / 2, rail_y, start_x + 6 * (w + gap) + w / 2, rail_y, TEAL)
        for index, (title, subtitle) in enumerate(primary):
            x = start_x + index * (w + gap)
            self.connector(x + w / 2, rail_y, x + w / 2, y + h, TEAL)
            self.box(x, y, w, h, title, subtitle, WHITE, LINE)

        work_center = start_x + w / 2
        self.connector(work_center, y, work_center, 247, TEAL)
        self.connector(work_center, 247, 169, 247, TEAL)
        self.connector(64, 247, 64, 221, TEAL)
        self.connector(169, 247, 169, 221, TEAL)
        self.box(15, 182, 98, 39, "Experience", "Default tab", TEAL_PALE, TEAL)
        self.box(120, 182, 98, 39, "Case Studies", "Seven projects", TEAL_PALE, TEAL)

        project_names = ["Gift It", "RIT App", "Passwordless", "Vehicle DB", "Mood Insights", "SmartMall", "VR Locked"]
        project_x = [15, 120, 225, 330, 435, 540, 645]
        case_center = 169
        project_rail_y = 160
        self.connector(case_center, 182, case_center, project_rail_y, TEAL)
        self.connector(project_x[0] + 49, project_rail_y, project_x[-1] + 49, project_rail_y, TEAL)
        for index, title in enumerate(project_names):
            x = project_x[index]
            self.connector(x + 49, project_rail_y, x + 49, 134, TEAL)
            locked = title == "VR Locked"
            self.box(x, 95, 98, 39, title, "Notice only" if locked else "Published", AMBER_PALE if locked else WHITE, AMBER if locked else LINE)

        c.setStrokeColor(PRIVATE)
        c.setDash(3, 2)
        c.line(15, 69, 743, 69)
        c.setDash()
        c.setFillColor(PRIVATE)
        c.setFont("Courier-Bold", 7)
        c.drawString(15, 76, "OWNER-ONLY DIRECT ACCESS")
        self.box(195, 15, 150, 40, "Cloudflare Access", "Approved email login", PRIVATE_PALE, PRIVATE)
        self.box(390, 15, 150, 40, "Admin Analytics", "/admin/", PRIVATE_PALE, PRIVATE)
        self.box(585, 15, 150, 40, "Developer Log", "/admin/log/", PRIVATE_PALE, PRIVATE)
        self.connector(345, 35, 390, 35, PRIVATE)
        self.connector(540, 35, 585, 35, PRIVATE)


def page_footer(c: canvas.Canvas, doc):
    c.saveState()
    c.setStrokeColor(LINE)
    c.line(18 * mm, 12 * mm, PAGE_WIDTH - 18 * mm, 12 * mm)
    c.setFillColor(MUTED)
    c.setFont("Courier", 6.5)
    c.drawString(18 * mm, 7.5 * mm, "YAHYA EL-SAWI / PORTFOLIO ROUTE GUIDE / 21 AUG 2026")
    c.drawRightString(PAGE_WIDTH - 18 * mm, 7.5 * mm, f"PAGE {doc.page}")
    c.restoreState()


def title_block(kicker, title, lead):
    return [
        Paragraph(kicker, styles["Kicker"]),
        Paragraph(title, styles["PageTitle"]),
        Paragraph(lead, styles["Lead"]),
    ]


def access_table(rows, heading):
    header = [
        Paragraph("PAGE", styles["TableHeader"]),
        Paragraph("ROUTE", styles["TableHeader"]),
        Paragraph("HOW TO REACH IT", styles["TableHeader"]),
        Paragraph("ACCESS", styles["TableHeader"]),
        Paragraph("LOCAL", styles["TableHeader"]),
        Paragraph("PRODUCTION", styles["TableHeader"]),
    ]
    data = [header]
    for name, route, navigation, access in rows:
        local = href(LOCAL_BASE, route)
        production = href(PRODUCTION_BASE, route)
        data.append([
            Paragraph(name, styles["TableCellBold"]),
            Paragraph(route, styles["TableCell"]),
            Paragraph(navigation, styles["TableCell"]),
            Paragraph(access, styles["TableCell"]),
            Paragraph(f'<link href="{local}" color="#267C78">Open local</link>', styles["LinkCell"]),
            Paragraph(f'<link href="{production}" color="#267C78">Open production</link>', styles["LinkCell"]),
        ])
    table = Table(data, colWidths=[102, 102, 165, 145, 94, 102], repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, 0), 7),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
        ("TOPPADDING", (0, 1), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
    ]))
    return KeepTogether([Paragraph(heading, styles["CardTitle"]), Spacer(1, 6), table])


def private_route_cards():
    cards = []
    for name, route, navigation, access in PRIVATE_ROUTES:
        local = href(LOCAL_BASE, route)
        production = href(PRODUCTION_BASE, route)
        cards.append(Paragraph(
            f'<font name="Courier-Bold" size="7" color="#563B72">OWNER ONLY</font><br/>'
            f'<font name="Helvetica-Bold" size="12" color="#111827">{name}</font><br/>'
            f'<font name="Courier" size="7" color="#596164">{route}</font><br/><br/>'
            f'{navigation}<br/>{access}<br/><br/>'
            f'<link href="{local}" color="#267C78"><b>Open local</b></link> &nbsp;&nbsp; '
            f'<link href="{production}" color="#267C78"><b>Open production</b></link>',
            styles["Body"],
        ))
    table = Table([cards], colWidths=[356, 356], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, PRIVATE),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, PRIVATE),
        ("BACKGROUND", (0, 0), (-1, -1), PRIVATE_PALE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 13),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 13),
    ]))
    return KeepTogether([Paragraph("Owner-only routes", styles["CardTitle"]), Spacer(1, 6), table])


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT), pagesize=landscape(A4),
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=17 * mm, bottomMargin=18 * mm,
        title="Yahya El-Sawi Portfolio Roadmap and Sitemap",
        author="Yahya El-Sawi",
        subject="Local and production access guide for the portfolio website",
    )

    story = [
        Spacer(1, 18),
        Paragraph("PORTFOLIO INFORMATION ARCHITECTURE", styles["Kicker"]),
        Paragraph("Roadmap &amp;<br/>Sitemap.", styles["Display"]),
        Paragraph(
            "A complete guide to every functional route, how visitors navigate between pages, "
            "and how local, public, locked, and owner-only access differ.",
            styles["Lead"],
        ),
        Spacer(1, 10),
        Table([
            [
                AccessCard(170, "Functional routes", "17", "15 public + 2 owner-only", TEAL_PALE, TEAL),
                AccessCard(170, "Public routes", "15", "Includes the locked VR notice", PAPER, INK),
                AccessCard(170, "Owner-only", "2", "Protected by Cloudflare Access", PRIVATE_PALE, PRIVATE),
                AccessCard(170, "System page", "1", "404 fallback, outside navigation", AMBER_PALE, AMBER),
            ]
        ], colWidths=[178, 178, 178, 178], hAlign="LEFT"),
        Spacer(1, 24),
        Table([
            [Paragraph("LOCAL DEVELOPMENT", styles["CardTitle"]), Paragraph("PRODUCTION", styles["CardTitle"])],
            [
                Paragraph(
                    f'Base URL: <link href="{LOCAL_BASE}" color="#267C78">{LOCAL_BASE}</link><br/>'
                    "All pages are available for QA. Cloudflare Access does not run locally, and live APIs require local bindings.",
                    styles["Body"],
                ),
                Paragraph(
                    f'Base URL: <link href="{PRODUCTION_BASE}" color="#267C78">{PRODUCTION_BASE}</link><br/>'
                    "Public pages are open. Admin routes require the approved Cloudflare Access identity.",
                    styles["Body"],
                ),
            ],
        ], colWidths=[356, 356], style=TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.7, LINE),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
            ("BACKGROUND", (0, 0), (-1, 0), PAPER),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("RIGHTPADDING", (0, 0), (-1, -1), 14),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ])),
        Spacer(1, 16),
        Paragraph(
            "Reading rule: solid teal paths are normal public navigation. The amber node is a public locked notice. "
            "The purple path is direct owner access and does not appear in public navigation.",
            styles["BodySmall"],
        ),

        PageBreak(),
        *title_block(
            "01 / NAVIGATION ROADMAP",
            "How the website connects.",
            "Start from Home for the public journey. Work separates verified employment from case-study evidence; admin is intentionally outside the public tree.",
        ),
        RoadmapDiagram(),

        PageBreak(),
        *title_block(
            "02 / PUBLIC ROUTE DIRECTORY",
            "Every visitor-facing page.",
            "Use the navigation path for normal discovery or either link column for direct access. Project order follows the website's newest-first sorting rules.",
        ),
        access_table(PUBLIC_CORE, "Core pages"),
        Spacer(1, 14),
        access_table(PROJECTS, "Project pages"),

        PageBreak(),
        *title_block(
            "03 / CONTROLLED ACCESS",
            "Private, locked, and compatibility paths.",
            "These destinations are deliberately handled differently from normal public pages. Local access is for QA; production access follows the controls below.",
        ),
        private_route_cards(),
        Spacer(1, 16),
        Table([
            [Paragraph("LOCKED PROJECT", styles["CardTitle"]), Paragraph("PRIVATE ADMIN", styles["CardTitle"]), Paragraph("SYSTEM PAGE", styles["CardTitle"])],
            [
                Paragraph("VR Neuroanatomy is publicly reachable through Work, but only the ongoing-research notice is shown. The project content remains inaccessible.", styles["Body"]),
                Paragraph("Open /admin/ in production, complete Cloudflare Access with the approved owner email, then open the analytics dashboard or private developer log.", styles["Body"]),
                Paragraph("The 404 page appears automatically for an invalid route. It is public infrastructure, but it is not part of the normal site navigation.", styles["Body"]),
            ],
        ], colWidths=[237, 237, 237], style=TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.7, LINE),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
            ("BACKGROUND", (0, 0), (0, 0), AMBER_PALE),
            ("BACKGROUND", (1, 0), (1, 0), PRIVATE_PALE),
            ("BACKGROUND", (2, 0), (2, 0), PAPER),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 11),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
        ])),
        Spacer(1, 18),
        Paragraph("Compatibility redirects", styles["CardTitle"]),
        Paragraph(
            "Legacy project URLs redirect to /work/project-name. /experience redirects to /work. "
            "/log and /log.html redirect to /admin/log/ and remain behind Cloudflare Access. "
            "Redirects preserve old bookmarks but are not counted as additional pages.",
            styles["Body"],
        ),
        Spacer(1, 16),
        Paragraph("Fast access checklist", styles["CardTitle"]),
        Paragraph(
            "Public visitor: Home -> Work -> choose Professional Experience or Case Studies -> open a project. "
            "Recruiter: Home or Work -> Recruiter Quick View -> CV, evidence, contact, or Yahya'AI. "
            "Owner: direct /admin/ -> Cloudflare Access -> analytics -> private developer log.",
            styles["Body"],
        ),
    ]

    doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
