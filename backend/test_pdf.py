import io
from xhtml2pdf import pisa

html = "<html><body><h1>Hello PDF</h1></body></html>"
pdf_file = io.BytesIO()
pisa_status = pisa.CreatePDF(html, dest=pdf_file)

if not pisa_status.err:
    print(f"Success! PDF generated. Size: {len(pdf_file.getvalue())} bytes")
else:
    print(f"Error! pisa returned error code {pisa_status.err}")
