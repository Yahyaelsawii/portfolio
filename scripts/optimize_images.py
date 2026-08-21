import argparse
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parent.parent
PICTURES = ROOT / "assets" / "Pictures"
RESPONSIVE = PICTURES / "responsive"
NETWORK = PICTURES / "network-automation"
CREDENTIALS = PICTURES / "credentials"
RESUME = PICTURES / "resume"
PDFS = ROOT / "assets" / "pdfs"

GALLERY_STEMS = [
    "Checkout",
    "Daily_checkins",
    "ERD",
    "E_invite_confirmation",
    "E_invite_payment_confirmation0",
    "E_invite_steps",
    "Home_screen",
    "Homescreen",
    "Login",
    "Login_giftiti",
    "Mood_avg",
    "Notifications",
    "Order_confirmation0",
    "Sign_up_giftit",
    "Updated_user_flows",
    "Verification",
    "flowmap",
]

NETWORK_STEMS = [
    "baseline-topology",
    "correction-engine",
    "network-brain-setup",
    "pipeline",
    "recovery-verified",
    "reports",
    "tech-stack",
    "tenant-onboarding",
    "validation-iperf",
    "validation-pings",
]

PDF_CREDENTIALS = {
    "RIT_BSc_Diploma.pdf": "rit-bsc-diploma",
    "Odoo_Technical_Bootcamp.pdf": "odoo-technical-bootcamp",
    "Software_Design_UML.pdf": "software-design-uml",
    "MMX_Business_Simulation.pdf": "mmx-business-simulation",
    "Business_Analysis_Process_Management.pdf": "business-analysis-process-management",
    "CITI_Export_Compliance.pdf": "citi-export-compliance",
    "CITI_Research_Security.pdf": "citi-research-security",
    "CITI_Social_Behavioral_Research.pdf": "citi-social-behavioral-research",
    "CITI_Minimal_Risk_Student_Research.pdf": "citi-minimal-risk-student-research",
    "ZainTECH_Data_Challenge.pdf": "zaintech-data-challenge",
}


def trim_outer_background(image: Image.Image, threshold: int = 18) -> Image.Image:
    rgb = image.convert("RGB")
    corners = [
        rgb.getpixel((1, 1)),
        rgb.getpixel((rgb.width - 2, 1)),
        rgb.getpixel((1, rgb.height - 2)),
        rgb.getpixel((rgb.width - 2, rgb.height - 2)),
    ]
    background = tuple(sum(pixel[channel] for pixel in corners) // 4 for channel in range(3))
    difference = ImageChops.difference(rgb, Image.new("RGB", rgb.size, background)).convert("L")
    mask = difference.point(lambda value: 255 if value > threshold else 0)
    bounds = mask.getbbox()
    if not bounds:
        return rgb

    padding = max(10, round(min(rgb.size) * 0.012))
    left = max(0, bounds[0] - padding)
    top = max(0, bounds[1] - padding)
    right = min(rgb.width, bounds[2] + padding)
    bottom = min(rgb.height, bounds[3] + padding)

    original_area = rgb.width * rgb.height
    cropped_area = (right - left) * (bottom - top)
    if cropped_area / original_area > 0.985:
        return rgb
    return rgb.crop((left, top, right, bottom))


def save_image(image: Image.Image, destination: Path, quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(f".{destination.stem}.tmp{destination.suffix}")
    options = {"quality": quality}
    if destination.suffix == ".webp":
        options.update({"method": 6})
    image.save(temporary, **options)
    temporary.replace(destination)


def responsive_variants(image: Image.Image, directory: Path, stem: str) -> None:
    for requested_width in (480, 768, 1200):
        width = min(requested_width, image.width)
        height = round(image.height * width / image.width)
        resized = image if width == image.width else image.resize((width, height), Image.Resampling.LANCZOS)
        save_image(resized, directory / f"{stem}-{requested_width}.webp", 90)
        save_image(resized, directory / f"{stem}-{requested_width}.avif", 68)


def optimize_gallery() -> None:
    for stem in GALLERY_STEMS:
        source = PICTURES / f"{stem}.webp"
        optimized = trim_outer_background(Image.open(source))
        save_image(optimized, source, 92)
        responsive_variants(optimized, RESPONSIVE, stem)
        print(f"gallery {stem}: {optimized.width}x{optimized.height}")


def optimize_network() -> None:
    for stem in NETWORK_STEMS:
        source = NETWORK / f"{stem}-1200.webp"
        optimized = trim_outer_background(Image.open(source))
        responsive_variants(optimized, NETWORK, stem)
        print(f"network {stem}: {optimized.width}x{optimized.height}")


def optimize_certificate(source: Path) -> None:
    certificate = Image.open(source).convert("RGB")
    responsive_variants(certificate, CREDENTIALS, "starlink-internship-2026")
    print(f"certificate starlink-internship-2026: {certificate.width}x{certificate.height}")


def optimize_resume_preview(source: Path) -> None:
    preview = Image.open(source).convert("RGB")
    responsive_variants(preview, RESUME, "yahya-elsawi-resume")
    print(f"resume yahya-elsawi-resume: {preview.width}x{preview.height}")


def optimize_credential_previews() -> None:
    renderer = shutil.which("pdftoppm")
    if not renderer:
        raise RuntimeError("pdftoppm is required to render credential previews")

    with tempfile.TemporaryDirectory(prefix="portfolio-credentials-") as temporary:
        temporary_directory = Path(temporary)
        for filename, stem in PDF_CREDENTIALS.items():
            output = temporary_directory / stem
            subprocess.run(
                [renderer, "-f", "1", "-singlefile", "-png", "-r", "144", str(PDFS / filename), str(output)],
                check=True,
            )
            preview = Image.open(output.with_suffix(".png")).convert("RGB")
            responsive_variants(preview, CREDENTIALS, stem)
            print(f"credential {stem}: {preview.width}x{preview.height}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Trim and regenerate portfolio image variants.")
    parser.add_argument(
        "--certificate",
        type=Path,
        help="Optional source image for the StarLink internship certificate.",
    )
    parser.add_argument(
        "--resume-preview",
        type=Path,
        help="Optional rendered PNG source for the resume preview.",
    )
    parser.add_argument(
        "--credential-previews",
        action="store_true",
        help="Render the first page of every PDF credential and create responsive variants.",
    )
    arguments = parser.parse_args()

    if not arguments.certificate and not arguments.resume_preview and not arguments.credential_previews:
        optimize_gallery()
        optimize_network()
    if arguments.certificate:
        optimize_certificate(arguments.certificate.expanduser().resolve())
    if arguments.resume_preview:
        optimize_resume_preview(arguments.resume_preview.expanduser().resolve())
    if arguments.credential_previews:
        optimize_credential_previews()
