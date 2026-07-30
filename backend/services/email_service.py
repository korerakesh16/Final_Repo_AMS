import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any, Optional
from app.config import settings

def build_ticket_html_body(ticket_data: Dict[str, Any], employee_data: Optional[Dict[str, Any]] = None) -> str:
    emp_name = employee_data.get("name") if employee_data else ticket_data.get("reported_by", "Employee")
    emp_id = employee_data.get("id") if employee_data else ticket_data.get("reported_by", "N/A")
    emp_dept = employee_data.get("department") if employee_data else "N/A"
    emp_email = employee_data.get("email") if employee_data else "N/A"

    ticket_id = ticket_data.get("id", "N/A")
    asset_id = ticket_data.get("asset_id", "N/A")
    issue = ticket_data.get("issue", "N/A")
    description = ticket_data.get("description", "N/A")
    priority = ticket_data.get("priority", "Medium")
    request_date = ticket_data.get("request_date", "N/A")

    priority_color = "#DC2626" if priority == "High" else "#D97706" if priority == "Medium" else "#2563EB"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }}
            .container {{ max-width: 600px; background: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }}
            .header {{ background-color: #1E3A8A; color: #ffffff; padding: 24px; text-align: center; }}
            .header h2 {{ margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }}
            .header p {{ margin: 5px 0 0 0; font-size: 12px; opacity: 0.85; text-transform: uppercase; letter-spacing: 1px; }}
            .badge {{ display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; font-size: 11px; background-color: {priority_color}; margin-top: 10px; }}
            .content {{ padding: 24px; }}
            .section-title {{ font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; border-bottom: 2px solid #f3f4f6; padding-bottom: 6px; margin-bottom: 14px; margin-top: 18px; }}
            .info-table {{ width: 100%; border-collapse: collapse; margin-bottom: 10px; }}
            .info-table td {{ padding: 8px 0; font-size: 13px; vertical-align: top; }}
            .info-table td.label {{ color: #6b7280; font-weight: 600; width: 140px; }}
            .info-table td.value {{ color: #111827; font-weight: 600; }}
            .description-box {{ background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; font-size: 13px; color: #374151; line-height: 1.5; margin-top: 8px; }}
            .footer {{ background-color: #f9fafb; padding: 16px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Quadrant IT Services</h2>
                <p>New Support Ticket Notification</p>
                <div class="badge">Priority: {priority}</div>
            </div>
            <div class="content">
                <div class="section-title">Ticket Information</div>
                <table class="info-table">
                    <tr><td class="label">Ticket ID:</td><td class="value">{ticket_id}</td></tr>
                    <tr><td class="label">Issue Title:</td><td class="value">{issue}</td></tr>
                    <tr><td class="label">Asset ID:</td><td class="value">{asset_id}</td></tr>
                    <tr><td class="label">Submitted On:</td><td class="value">{request_date}</td></tr>
                </table>

                <div class="section-title">Employee Details</div>
                <table class="info-table">
                    <tr><td class="label">Raised By:</td><td class="value">{emp_name} ({emp_id})</td></tr>
                    <tr><td class="label">Department:</td><td class="value">{emp_dept}</td></tr>
                    <tr><td class="label">Email:</td><td class="value">{emp_email}</td></tr>
                </table>

                <div class="section-title">Detailed Symptoms / Description</div>
                <div class="description-box">
                    {description}
                </div>
            </div>
            <div class="footer">
                <p>This is an automated notification from the Quadrant IT Asset Management System.</p>
                <p>Please log in to the Admin Dashboard to review and accept/process this support request.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html

def send_ticket_raised_email_to_admins(
    admin_emails: List[str],
    ticket_data: Dict[str, Any],
    employee_data: Optional[Dict[str, Any]] = None
) -> None:
    """
    Sends email alert to all active admin emails when a new support ticket is raised.
    Executed as a background task.
    """
    if not settings.EMAILS_ENABLED:
        print("[Email Service]: Email sending is disabled via config (EMAILS_ENABLED=False).")
        return

    if not admin_emails:
        print("[Email Service]: No active admin emails found to send notification.")
        return

    ticket_id = ticket_data.get("id", "N/A")
    emp_name = employee_data.get("name") if employee_data else ticket_data.get("reported_by", "Employee")
    subject = f"[QITS Alert] New Support Ticket {ticket_id} Raised by {emp_name}"

    html_content = build_ticket_html_body(ticket_data, employee_data)

    # Check if SMTP configuration is provided
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[Email Service Simulation]: New ticket {ticket_id} raised by {emp_name}.")
        print(f"[Email Service Simulation]: Target active admins: {', '.join(admin_emails)}")
        print(f"[Email Service Simulation]: To enable real SMTP delivery, update SMTP_USER and SMTP_PASSWORD in backend/.env")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
        msg["To"] = ", ".join(admin_emails)

        part = MIMEText(html_content, "html")
        msg.attach(part)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(msg["From"], admin_emails, msg.as_string())

        print(f"[Email Service]: Successfully sent ticket alert email to {len(admin_emails)} admin(s): {', '.join(admin_emails)}")
    except Exception as e:
        print(f"[Email Service Error]: Failed to send email to admins ({', '.join(admin_emails)}): {e}")
