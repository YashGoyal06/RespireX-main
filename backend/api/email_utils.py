import os
import base64
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import (
    Mail, Attachment, FileContent, FileName, FileType, Disposition
)
from django.conf import settings

# --- CONFIGURATION ---
# 1. HARDCODE YOUR KEY HERE FOR TESTING (Remove before deploying to GitHub)
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY') 
SENDER_EMAIL = "gamingyash54@gmail.com" 
# ---------------------

def send_html_email(subject, recipient_list, html_content, pdf_buffer=None, filename="Report.pdf"):
    """
    Sends an email using SendGrid API (Bypasses Gmail SMTP).
    """
    message = Mail(
        from_email=SENDER_EMAIL,
        to_emails=recipient_list,
        subject=subject,
        html_content=html_content
    )

    if pdf_buffer:
        encoded_file = base64.b64encode(pdf_buffer.getvalue()).decode()
        attachment = Attachment(
            FileContent(encoded_file),
            FileName(filename),
            FileType('application/pdf'),
            Disposition('attachment')
        )
        message.attachment = attachment

    try:
        print(f"🚀 Sending email via SendGrid to {recipient_list}...")
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ SendGrid Status: {response.status_code}")
    except Exception as e:
        print(f"❌ SendGrid Failed: {str(e)}")
        # Don't raise here to prevent crashing the view if email fails
        pass

def get_medical_email_template(patient_name, test_date, risk_level, confidence):
    """
    Returns the HTML email body.
    """
    if risk_level in ["High", "Medium"]:
        color = "#e11d48" 
        icon = "⚠️"
    else:
        color = "#059669" 
        icon = "✅"
        
    dashboard_link = "https://respirex.vercel.app"

    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <div style="background-color: #0f172a; color: white; padding: 20px; text-align: center;">
            <h2 style="margin:0;">RespireX Report</h2>
        </div>
        <div style="padding: 30px;">
            <h3>Hello {patient_name},</h3>
            <p>Your analysis from {test_date} is complete.</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Result:</strong> <span style="color: {color}; font-weight: bold;">{icon} {risk_level} Risk</span></p>
                <p><strong>AI Confidence:</strong> {confidence}%</p>
            </div>
            
            <p>Please find the detailed PDF report attached.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="{dashboard_link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Dashboard</a>
            </div>
        </div>
    </div>
    """

def send_appointment_status_email(recipient_email, patient_name, doctor_name, appointment_date, status, doctor_note=""):
    """
    Sends an email notification when an appointment status changes.
    """
    subject = f"Appointment Update - Dr. {doctor_name}"
    
    if status == 'confirmed':
        color = "#059669" # Green
        status_text = "CONFIRMED"
        message_body = f"Your appointment has been <strong>confirmed</strong> for {appointment_date}."
    else:
        color = "#e11d48" # Red
        status_text = "NEEDS RESCHEDULING"
        message_body = f"Dr. {doctor_name} has sent a message regarding your appointment request for {appointment_date}."
        if doctor_note:
            message_body += f"<br><br><strong>Doctor's Note:</strong> <em style='background:#fff1f2; padding:5px;'>{doctor_note}</em>"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <div style="background-color: #0f172a; color: white; padding: 20px; text-align: center;">
            <h2 style="margin:0;">Appointment Update</h2>
        </div>
        <div style="padding: 30px;">
            <h3>Hello {patient_name},</h3>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid {color};">
                <p style="margin:0 0 10px 0; color: {color}; font-weight: bold; font-size: 1.1em;">STATUS: {status_text}</p>
                <p style="margin:0; line-height: 1.5;">{message_body}</p>
            </div>
            
            <p style="color: #64748b; font-size: 0.9em;">Please log in to your dashboard to view more details or book a new slot.</p>
        </div>
    </div>
    """
    
    try:
        send_html_email(subject, [recipient_email], html_content)
    except Exception as e:
        print(f"Failed to send appointment email: {e}")