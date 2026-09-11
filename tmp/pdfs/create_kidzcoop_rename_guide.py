from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = "output/pdf/kidzcoop-renaming-and-domain-setup.pdf"
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 0.68 * inch


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="TitleCustom",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=29,
        textColor=colors.HexColor("#17324D"),
        alignment=TA_LEFT,
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        name="Subtitle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor("#536476"),
        spaceAfter=18,
    )
)
styles.add(
    ParagraphStyle(
        name="Section",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#17324D"),
        spaceBefore=12,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="BodyCustom",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#253241"),
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="BulletCustom",
        parent=styles["BodyCustom"],
        leftIndent=14,
        firstLineIndent=-8,
        bulletIndent=0,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="CodeBlockCustom",
        parent=styles["BodyText"],
        fontName="Courier",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#182331"),
        backColor=colors.HexColor("#F3F6FA"),
        borderPadding=5,
        spaceAfter=7,
    )
)


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#17324D"))
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 0.42 * inch, "KidZcoop Rename Runbook")
    canvas.setFillColor(colors.HexColor("#8A97A6"))
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(PAGE_WIDTH - MARGIN, 0.38 * inch, f"Page {doc.page}")
    canvas.restoreState()


def p(text, style="BodyCustom"):
    return Paragraph(text, styles[style])


def bullet(text):
    return Paragraph(text, styles["BulletCustom"], bulletText="-")


def code(text):
    return Paragraph(text.replace("\n", "<br/>"), styles["CodeBlockCustom"])


doc = BaseDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=MARGIN,
    leftMargin=MARGIN,
    topMargin=0.72 * inch,
    bottomMargin=0.6 * inch,
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=header_footer)])

story = [
    p("KidZcoop Project Rename and Domain Setup", "TitleCustom"),
    p(
        "A practical checklist for changing the project from KidZcoop/kidzcoop to "
        "KidZcoop/kidzcoop, then buying and assigning a custom domain in Vercel.",
        "Subtitle",
    ),
    p("1. Code Rename Already Applied", "Section"),
    bullet("Visible brand text uses <b>KidZcoop</b>."),
    bullet("Technical slug/package name uses <b>kidzcoop</b>."),
    bullet("SEO metadata, Open Graph, Twitter card titles, JSON-LD organization names, translations, logo alt text, README, and setup docs were updated."),
    bullet("Default generated URLs now point to <b>https://kidzcoop.vercel.app</b>."),
    bullet("Social image path now uses <b>/social-share.jpeg</b>, matching the existing asset."),
    p("Do not change the local database name unless the actual database was renamed:", "BodyCustom"),
    code("DB_NAME=freedb_kidzcoop"),
    p("2. Rename The Vercel Project", "Section"),
    bullet("Open the Vercel dashboard."),
    bullet("Select the existing <b>kidzcoop</b> project."),
    bullet("Go to <b>Settings -> General</b>."),
    bullet("Change <b>Project Name</b> to <b>kidzcoop</b>."),
    bullet("Save the change and redeploy production."),
    p("Expected free Vercel URL after the rename:", "BodyCustom"),
    code("https://kidzcoop.vercel.app"),
    p("3. Update Environment Variables", "Section"),
    bullet("In the Vercel project, go to <b>Settings -> Environment Variables</b>."),
    bullet("Set the public site URL to the generated Vercel domain first, or to the custom domain after purchase."),
    code("NEXT_PUBLIC_SITE_URL=https://kidzcoop.vercel.app"),
    p("After buying a custom domain, change it to:", "BodyCustom"),
    code("NEXT_PUBLIC_SITE_URL=https://kidzcoop.com"),
    bullet("Redeploy production after changing environment variables."),
    p("4. Buy A Domain In Vercel", "Section"),
    bullet("Go to <b>vercel.com/domains</b> while logged into the same Vercel account/team."),
    bullet("Search for <b>kidzcoop.com</b>."),
    bullet("Review the exact price shown by Vercel before checkout."),
    bullet("If available and the price is acceptable, complete checkout."),
    bullet("Domain purchases are usually annual and may auto-renew depending on your Vercel billing settings."),
    p("Pricing expectation:", "BodyCustom"),
    bullet("<b>kidzcoop.vercel.app</b> is free."),
    bullet("A normal <b>.com</b> domain is commonly around <b>$10-20/year</b>, but Vercel shows the live price before payment."),
    bullet("Some alternative TLDs can be cheaper; premium names can be much more expensive."),
    p("5. Assign The Domain To The Project", "Section"),
    bullet("Open the <b>kidzcoop</b> project in Vercel."),
    bullet("Go to <b>Settings -> Domains</b>."),
    bullet("Add or select the purchased domain, for example <b>kidzcoop.com</b>."),
    bullet("Vercel should configure DNS and SSL automatically if the domain was purchased through Vercel."),
    bullet("Wait until the domain status is valid and SSL is issued."),
    p("6. Redirect Or Keep The Old Domain", "Section"),
    bullet("The old generated domain <b>kidzcoop.vercel.app</b> may still exist temporarily depending on Vercel project/domain state."),
    bullet("Use the old URL only as a temporary fallback while testing."),
    bullet("For a clean public launch, share only the new custom domain or <b>kidzcoop.vercel.app</b>."),
    p("7. Post-Launch Checks", "Section"),
    bullet("Open the homepage and confirm the logo and visible text say <b>KidZcoop</b>."),
    bullet("Open <b>/robots.txt</b> and confirm the sitemap URL uses the new domain."),
    bullet("Open <b>/sitemap.xml</b> and confirm listed URLs use the new domain."),
    bullet("Share a link in a chat/social preview tester and confirm the title/image use <b>KidZcoop</b>."),
    bullet("Check Vercel deployment logs for build or runtime errors."),
    p("8. Current Local Verification", "Section"),
    bullet("<b>npm run build</b> completed successfully after the rename."),
    bullet("<b>npm run lint</b> currently prompts to create an ESLint config, so it was not allowed to modify project setup."),
]

summary = [
    ["Item", "Target value"],
    ["Visible brand", "KidZcoop"],
    ["Technical slug", "kidzcoop"],
    ["Free Vercel URL", "https://kidzcoop.vercel.app"],
    ["Preferred custom domain", "https://kidzcoop.com"],
    ["Vercel env var", "NEXT_PUBLIC_SITE_URL"],
]
table = Table(summary, colWidths=[1.75 * inch, 4.5 * inch], hAlign="LEFT")
table.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9.5),
            ("LEADING", (0, 0), (-1, -1), 12),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F7F9FC")),
            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CCD5DF")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
    )
)

story.extend([Spacer(1, 10), p("Quick Reference", "Section"), table])

doc.build(story)
print(OUTPUT)
