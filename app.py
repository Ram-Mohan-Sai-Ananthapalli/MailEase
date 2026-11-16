
import os

from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Connect to Groq
api_key = os.getenv("GROQ_API_KEY")

client = Groq(api_key=api_key) if api_key else None


# Home page
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


# Generate email using Groq
@app.route("/generate-email", methods=["POST"])
def generate_email():

    try:
        # Get JSON data from JavaScript
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "error": "Invalid request data"
            }), 400

        # Get user inputs
        purpose = data.get("purpose", "").strip()
        recipient = data.get("recipient", "").strip()
        tone = data.get("tone", "").strip()

        # Validate inputs
        if not purpose:
            return jsonify({
                "error": "Please enter email purpose"
            }), 400

        if not recipient:
            return jsonify({
                "error": "Please select a recipient"
            }), 400

        if not tone:
            return jsonify({
                "error": "Please select email tone"
            }), 400

        # Check API key
        if not client:
            return jsonify({
                "error": "Groq API key is missing. Check your .env file."
            }), 500

        # Create human-style email prompt
        prompt = f"""
Write a natural email that sounds like a real human wrote it.

Email purpose: {purpose}
Recipient: {recipient}
Tone: {tone}

Writing rules:
- Use simple, natural English.
- Sound human, friendly and genuine.
- Keep sentences clear and concise.
- Avoid robotic and repetitive phrases.
- Do not use Markdown formatting.
- Do not use bold, italic or decorative headings.
- Do not use bullet points or numbered lists.
- Do not use horizontal lines or separators.
- Write the email using normal paragraphs.
- Include a simple subject line.
- Include an appropriate greeting and closing.
- Do not invent personal information.
- Do not invent prices, features, dates or promises.
- Use only the details provided by the user.
- Return only the completed email as plain text.
"""

        # Generate email using Groq
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a natural and helpful human-style "
                        "email writing assistant. "
                        "Write emails that sound genuine, simple, "
                        "clear and conversational. "
                        "Never use Markdown formatting."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_completion_tokens=1500
        )

        # Extract generated email
        email_text = response.choices[0].message.content

        if not email_text:
            return jsonify({
                "error": "Groq did not return an email. Please try again."
            }), 500

        return jsonify({
            "success": True,
            "email": email_text.strip()
        }), 200

    except Exception as e:

        print("Groq error:", e)

        return jsonify({
            "error": "Unable to generate email. Please try again."
        }), 500


# Run Flask application
if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )
