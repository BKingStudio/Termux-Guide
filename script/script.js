function copyText(id) {
  // Get the text content from the target element
  const text = document.getElementById(id).innerText.trim();

  // Use the Clipboard API to copy the text
  navigator.clipboard.writeText(text).then(() => {
    // Optionally, change the button text for feedback
    const button = event.target;
    const originalText = button.innerText;
    button.innerText = 'Copied!';
    button.disabled = true;

    // Reset the button after 1.5 seconds
    setTimeout(() => {
      button.innerText = originalText;
      button.disabled = false;
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy text:', err);
    alert('Command Copied.');
  });
}


async function Search() {
  const query = document.getElementById('bking_search').value.trim().toLowerCase();
  if (!query) return alert("Please enter a search term.");

  const chapterCount = 20; // adjust based on how many chapters you have
  const results = document.getElementById("results") || createResultsBox();

  results.innerHTML = "<p>Searching...</p>";

  let output = "";
  for (let i = 1; i <= chapterCount; i++) {
    const filePath = `Chapters/chapter_${i}.html`;

    try {
      const res = await fetch(filePath);
      if (!res.ok) continue;

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Get all text content and search for the query
      const matches = Array.from(doc.querySelectorAll('table, tbody, tr')).filter(el => 
        el.textContent.toLowerCase().includes(query)
      );

      if (matches.length) {
        output += `<div class="p-4 border rounded mb-2 bg-white text-black">
          <h2 class="font-bold text-lg mb-1">Found in: <a href="${filePath}" target="_blank" class="text-blue-600 underline">Chapter ${i}</a></h2>
          <ul class="pl-4 list-disc">`;

        matches.slice(0, 5).forEach(match => {
          output += `<li>${highlightMatch(match.textContent, query)}</li>`;
        });

        output += `</ul></div>`;
      }

    } catch (e) {
      console.error(`Error reading ${filePath}:`, e);
    }
  }

  results.innerHTML = output || "<p class='text-red-600'>No matches found.</p>";
}

function createResultsBox() {
  const div = document.createElement("div");
  div.id = "results";
  div.className = "mt-4 px-6";
  const mainContent = document.querySelector('.p-4'); // Adjust selector as needed
  mainContent.appendChild(div);
  return div;
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[match]));
}

function highlightMatch(text, query) {
  const escapedText = escapeHTML(text);
  const escapedQuery = escapeHTML(query);
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  return escapedText.replace(regex, '<mark>$1</mark>');
}
