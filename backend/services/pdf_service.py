import io
import os
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa

# Define the absolute path to the templates directory
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates")

def generate_pdf_from_data(resume_data: dict, template_name: str = "base_template.html") -> io.BytesIO:
    """
    Renders a Jinja2 HTML template using resume_data and converts to PDF using xhtml2pdf.
    Returns a BytesIO stream of the PDF.
    """
    # Setup Jinja2 environment
    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
    template = env.get_template(template_name)

    # Render HTML string
    html_content = template.render(**resume_data)

    # Convert HTML to PDF using xhtml2pdf
    pdf_file = io.BytesIO()
    pisa_status = pisa.CreatePDF(
        src=html_content,
        dest=pdf_file,
        encoding='utf-8'
    )

    if pisa_status.err:
        print(f"[PDF Generation] xhtml2pdf error code: {pisa_status.err}")
        # Fallback: return raw HTML encoded as bytes if PDF fails
        pdf_file = io.BytesIO()
        pdf_file.write(html_content.encode('utf-8'))

    pdf_file.seek(0)
    return pdf_file
