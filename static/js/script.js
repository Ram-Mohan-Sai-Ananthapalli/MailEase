
const generateButton = document.querySelector(".generate-button");

const purposeInput = document.querySelector("#purpose");
const recipientInput = document.querySelector("#recipient");
const toneInput = document.querySelector("#tone");
const emailOutput = document.querySelector(".email-output");

// Reserve the output area when the page loads
emailOutput.style.display = "block";
emailOutput.style.visibility = "hidden";

// Generate Email
generateButton.addEventListener("click", async function () {

    const purpose = purposeInput.value.trim();
    const recipient = recipientInput.value;
    const tone = toneInput.value;

    // Validate email purpose
    if (!purpose) {
        alert("Please enter your email purpose!");
        return;
    }

    // Validate recipient
    if (!recipient) {
        alert("Please select a recipient!");
        return;
    }

    // Remember current page position
    const previousScrollPosition = window.scrollY;

    // Show loading state
    generateButton.innerText = "Writing your email...";
    generateButton.disabled = true;

    emailOutput.style.visibility = "visible";
    emailOutput.innerText = "Preparing your email...";

    try {

        // Send request to Flask backend
        const response = await fetch("/generate-email", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                purpose: purpose,
                recipient: recipient,
                tone: tone
            })

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Email generation failed");
        }

        // Clear previous output
        emailOutput.replaceChildren();

        // Email heading
        const heading = document.createElement("h3");
        heading.textContent = "Your Generated Email";

        // Generated email content
        const emailText = document.createElement("pre");
        emailText.textContent = result.email;

        // Copy button
        const copyButton = document.createElement("button");
        copyButton.textContent = "Copy Email";
        copyButton.className = "copy-button";

        copyButton.addEventListener("click", async function () {

            try {

                await navigator.clipboard.writeText(result.email);

                showToast("Email copied successfully!", "success");

            } catch (error) {

                showToast("Unable to copy email. Please try again.", "error");

            }

        });

        // Display generated email
        emailOutput.append(heading, emailText, copyButton);

    } catch (error) {

        emailOutput.textContent = error.message;

    } finally {

        // Restore button
        generateButton.innerText = "✨ Generate Email";
        generateButton.disabled = false;

        // Keep the page at its previous position
        window.scrollTo(0, previousScrollPosition);

    }

});


// Toast Notification Function
function showToast(message, type = "success") {

    // Remove existing notification
    const existingToast = document.querySelector(".toast-message");

    if (existingToast) {
        existingToast.remove();
    }

    // Create notification element
    const toast = document.createElement("div");
    toast.className = `toast-message ${type}`;

    // Add icon and message
    const icon = type === "success" ? "✓" : "✕";

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span>${message}</span>
    `;

    // Add notification to page
    document.body.appendChild(toast);

    // Show notification
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    // Hide notification after 2.5 seconds
    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 2500);

}
