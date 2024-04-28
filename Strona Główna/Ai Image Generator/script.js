const apiKey = "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";

const maxImages = 2; // Number of images to generate for each prompt
let selectedImageNumber = null;

// Function to generate a random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to disable the generate button during processing
function disableGenerateButton() {
    document.getElementById("generate").disabled = true;
}

// Function to enable the generate button after process
function enableGenerateButton() {
    document.getElementById("generate").disabled = false;
}

// Function to clear image grid
function clearImageGrid() {
    const imageGrid = document.getElementById("image-grid");
    imageGrid.innerHTML = "";
}

// Function to generate images
async function generateImages(input) {
    disableGenerateButton();
    clearImageGrid();

    const loading = document.getElementById("loading");
    loading.style.display = "block";

    // Translation of prompt to English if it's not in English
    let translatedInput = input.toLowerCase();
    if (translatedInput !== 'english') {
        const translationResponse = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=${encodeURIComponent('pl|en')}`
        );
        const translationData = await translationResponse.json();
        if (translationData && translationData.responseData && translationData.responseData.translatedText) {
            translatedInput = translationData.responseData.translatedText.toLowerCase();
        }
    }

    const imageUrls = [];

    for (let i = 0; i < maxImages; i++) {
        // Generate a random number between 1 and 2000 and append it to the prompt
        const randomNumber = getRandomNumber(1, 2000);
        const prompt = `${translatedInput} ${randomNumber}`;
        // We added random number to prompt to create different results
        const response = await fetch(
            "https://api-inference.huggingface.co/models/prompthero/openjourney",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        if (!response.ok) {
            alert("Failed to generate image!");
        }

        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        imageUrls.push(imgUrl);

        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = `art-${i + 1}`;
        img.onclick = () => downloadImage(imgUrl, i);
        document.getElementById("image-grid").appendChild(img);
    }

    loading.style.display = "none";
    enableGenerateButton();

    selectedImageNumber = null; // Reset selected image number
}

document.getElementById("generate").addEventListener('click', () => {
    const input = document.getElementById("user-prompt").value;
    if (input.toLowerCase() === "filmy") {
        window.location.href = "../Filmy/index.html";
    } else {
        generateImages(input);
    }
});

document.getElementById("user-prompt").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        const input = document.getElementById("user-prompt").value;
        if (input.toLowerCase() === "filmy") {
            window.location.href = "../Filmy/index.html";
            event.preventDefault();
        } else {
            generateImages(input);
            event.preventDefault();
        }
    }
});

function downloadImage(imgUrl, imageNumber) {
    const link = document.createElement("a");
    link.href = imgUrl;
    // Set filename based on the selected image
    link.download = `image-${imageNumber + 1}.jpg`;
    link.click();
}
