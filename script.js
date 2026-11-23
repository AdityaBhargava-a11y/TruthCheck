const claimInput = document.getElementById("claimInput");
const verifyButton = document.getElementById("verifyButton");

const resultBox = document.getElementById("resultBox");
const verdictBadge = document.getElementById("verdictBadge");
const summaryText = document.getElementById("summaryText");
const reasoningText = document.getElementById("reasoningText");
const limitationsText = document.getElementById("limitationsText");
const sourcesList = document.getElementById("sourcesList");

const SUPABASE_URL = "https://xilayhxmlsmvpzipajvc.supabase.co";
const SUPABASE_KEY = "sb_publishable_tM-MO0OBPP68K4A48Fu_Cw_1oLr8h7d";

verifyButton.addEventListener("click", async () => {
    const claim = claimInput.value.trim();

    if (claim.length < 15) {
        alert("Please enter a more detailed claim.");
        return;
    }

    verifyButton.disabled = true;
    verifyButton.textContent = "Analyzing...";
    resultBox.style.display = "none";

    try {
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/verify-claim`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({ claim })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Verification failed.");
        }

        const result = data.result || "";

        function extractSection(name, nextName) {
            const pattern = new RegExp(
                name + "\\s*:\\s*([\\s\\S]*?)(?=" +
                nextName + "\\s*:|$)",
                "i"
            );

            const match = result.match(pattern);

            return match
                ? match[1].trim().replace(/\*/g, "")
                : "Not provided.";
        }

        const verdict = extractSection("VERDICT", "SUMMARY");
        const summary = extractSection("SUMMARY", "REASONING");
        const reasoning = extractSection("REASONING", "LIMITATIONS");
        const limitations = extractSection("LIMITATIONS", "END");

        verdictBadge.textContent = verdict;
    
        summaryText.textContent = summary;
        reasoningText.textContent = reasoning;
        limitationsText.textContent = limitations;

        // Display sources
        sourcesList.replaceChildren();

        if (data.sources && data.sources.length > 0) {
            data.sources.forEach(source => {
                try {
                    const url = new URL(source.uri);

                    if (!["https:", "http:"].includes(url.protocol)) {
                        return;
                    }

                    const sourceItem = document.createElement("div");
                    sourceItem.className = "source-item";

                    const link = document.createElement("a");
                    link.href = url.href;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent = source.title || "View source";

                    const domain = document.createElement("span");
                    domain.className = "source-domain";
                    domain.textContent = url.hostname.replace(/^www\./, "");

const hostname = url.hostname.toLowerCase();

let credibility = "Use with caution";
let credibilityClass = "caution";

const highCredibility = [
    "unesco.org",
    "britannica.com",
    "who.int",
    "gov.in",
    "gov",
    "edu"
];

const lowCredibility = [
    "facebook.com",
    "instagram.com",
    "x.com",
    "twitter.com",
    "reddit.com"
];

if (highCredibility.some(domain =>
    hostname === domain || hostname.endsWith("." + domain)
)) {
    credibility = "High credibility";
    credibilityClass = "high";
}

if (lowCredibility.some(domain =>
    hostname === domain || hostname.endsWith("." + domain)
)) {
    credibility = "Low credibility";
    credibilityClass = "low";
}

const quality = document.createElement("span");
quality.className = `source-quality ${credibilityClass}`;
quality.textContent = credibility;


                    sourceItem.appendChild(link);
                    sourceItem.appendChild(domain);
                    sourceItem.appendChild(quality);
                    const analysisStatus = document.createElement("span");

analysisStatus.className = source.usedInAnalysis
    ? "source-analysis used"
    : "source-analysis unused";

analysisStatus.textContent = source.usedInAnalysis
    ? "Used in analysis"
    : "Not used in analysis";

sourceItem.appendChild(analysisStatus);

                    sourcesList.appendChild(sourceItem);

                } catch {
                    // Ignore invalid source URLs
                }
            });
        }

        if (!sourcesList.hasChildNodes()) {
            sourcesList.textContent =
                "No source links were returned for this claim.";
        }

        resultBox.style.display = "block";

        resultBox.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        resultBox.style.display = "block";

        verdictBadge.textContent = "Error";
        summaryText.textContent =
    "Unable to connect. Please check your internet connection and try again.";
        reasoningText.textContent = "";
        limitationsText.textContent = "";
        sourcesList.textContent = "";

    } finally {
        verifyButton.disabled = false;
        verifyButton.innerHTML = 'Verify Claim <span>→</span>';
    }
});

