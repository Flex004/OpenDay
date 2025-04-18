let openDayData = null;
let currentQuery = "";

// Load JSON data
fetch("OpenDay.json")
  .then(res => res.json())
  .then(data => {
    openDayData = data;
    renderSubjects(data.topics);
    showSection("welcome");
    renderAllEvents(data.topics);
  })
  .catch(err => console.error("Failed to load JSON:", err));

// 🔄 Toggle between sections
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// 🔍 Global Search
document.addEventListener('DOMContentLoaded', function () {
  // Global search input
  document.getElementById('globalSearch').addEventListener("input", function () {
    currentQuery = this.value.toLowerCase();
    if (!openDayData) return;

    const filteredTopics = openDayData.topics.map(topic => {
      const topicMatch = topic.name.toLowerCase().includes(currentQuery) || topic.description.toLowerCase().includes(currentQuery);
      const filteredPrograms = topic.programs.filter(program =>
        program.title.toLowerCase().includes(currentQuery) ||
        (program.location && program.location.title.toLowerCase().includes(currentQuery))
      );

      return {
        ...topic,
        programs: topicMatch ? topic.programs : filteredPrograms
      };
    }).filter(t => t.programs.length > 0);

    showSection('subjects');
    renderSubjects(filteredTopics);
    renderAllEvents(filteredTopics);
  });

  // Event-specific search input
  document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    if (!openDayData) return;

    const filteredPrograms = openDayData.topics.flatMap((topic, ti) =>
      topic.programs
        .map((program, pi) => ({ ...program, topicIndex: ti, programIndex: pi, topic: topic.name }))
        .filter(program =>
          program.title.toLowerCase().includes(query) ||
          program.description.toLowerCase().includes(query)
        )
    );

    showSection('events');
    renderAllEventsFromFlatList(filteredPrograms);
  });

  // Clear search input
  document.getElementById("clearEventSearch").addEventListener("click", () => {
    const input = document.getElementById("searchInput");
    input.value = "";
    input.dispatchEvent(new Event("input"));
  });
});

// 🧭 Highlight search terms
function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// 👨‍🏫 Render Subjects
function renderSubjects(topics) {
  const container = document.getElementById("subject-list");
  container.innerHTML = "";

  topics.forEach((topic, index) => {
    const box = document.createElement("div");
    box.className = "bg-white p-6 rounded shadow-md transition hover:shadow-lg hover:bg-blue-50 cursor-pointer";
    box.innerHTML = `
      <h3 class="text-xl font-bold mb-2">${highlight(topic.name, currentQuery)}</h3>
      <img src="${topic.cover_image}" alt="${topic.name}" class="rounded mb-4"/>
      <p class="mb-4">${highlight(topic.description, currentQuery)}</p>
    `;

    box.addEventListener("click", () => renderTopicEvents(index, topics));
    container.appendChild(box);
  });
}

// 👨‍🏫 Render Topic Events
function renderTopicEvents(index, topics) {
  const topic = topics[index];
  const container = document.getElementById("event-list");
  showSection('events');
  container.innerHTML = `<h3 class="text-2xl font-semibold">${topic.name}</h3><p class="mb-4">${topic.description}</p>`;

  topic.programs.forEach((program, programIndex) => {
    const eventCard = document.createElement("div");
    eventCard.className = "bg-white p-4 rounded-2xl shadow hover:shadow-lg hover:bg-blue-50 cursor-pointer";
    eventCard.innerHTML = `
      <h4 class="text-lg font-semibold">${highlight(program.title, currentQuery)}</h4>
      <p class="text-sm text-gray-700">⏰ ${new Date(program.start_time).toLocaleTimeString()}</p>
      <p class="text-sm text-gray-700">📌 Room: ${program.room || "TBA"}</p>
    `;

    eventCard.addEventListener("click", () => renderProgramDetail(index, programIndex, topics));
    container.appendChild(eventCard);
  });
}

// 🧾 Render Program Detail
function renderProgramDetail(topicIndex, programIndex, topics) {
  const topic = topics[topicIndex];
  const program = topic.programs[programIndex];
  const container = document.getElementById("program-detail-content");

  showSection('program-detail');

  container.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">${openDayData.description}</h2>
    <h3 class="text-xl font-semibold text-blue-800 mb-2">${topic.name}</h3>
    <h4 class="text-lg font-semibold mb-2">${program.title}</h4>
    <img src="${topic.cover_image}" alt="${program.title}" class="mb-4 rounded shadow max-w-full" />

    ${topic.map_url ? `
    <div class="mb-6">
      <h5 class="font-semibold text-sm text-gray-700 mb-1">📍 Location on Map:</h5>
      <iframe src="${topic.map_url}" width="100%" height="250" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" class="rounded shadow-sm"></iframe>
    </div>` : ""}

    <div class="mb-4">
      <p><strong>Program Type:</strong> ${program.type}</p>
      <p><strong>Start Time:</strong> ${new Date(program.start_time).toLocaleString()}</p>
      <p><strong>End Time:</strong> ${new Date(program.end_time).toLocaleString()}</p>
    </div>

    <div class="mb-4">
      <p>${program.description}</p>
    </div>
  `;
}

// 🚀 Render All Events
function renderAllEvents(topics) {
  const container = document.getElementById("event-list");
  container.innerHTML = ""; // Reset content
  
  topics.forEach(topic => {
    topic.programs.forEach(program => {
      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded-2xl shadow-md hover:bg-blue-50 hover:shadow-lg cursor-pointer";
      card.innerHTML = `
        <h4 class="text-lg font-semibold">${highlight(program.title, currentQuery)}</h4>
        <p class="text-sm text-gray-700">⏰ ${new Date(program.start_time).toLocaleTimeString()}</p>
        <p class="text-sm text-gray-700">📍 ${program.location ? program.location.title : "TBA"}</p>
      `;
      card.addEventListener("click", () => renderProgramDetail(topics.indexOf(topic), topic.programs.indexOf(program), topics));
      container.appendChild(card);
    });
  });
}

// 🚀 Render All Events from Flat List
function renderAllEventsFromFlatList(filteredPrograms) {
  const container = document.getElementById("event-list");
  container.innerHTML = ""; // Reset content

  filteredPrograms.forEach((program) => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-2xl shadow-md hover:bg-blue-50 hover:shadow-lg cursor-pointer";
    card.innerHTML = `
      <h4 class="text-lg font-semibold">${highlight(program.title, currentQuery)}</h4>
      <p class="text-sm text-gray-700">⏰ ${new Date(program.start_time).toLocaleTimeString()}</p>
      <p class="text-sm text-gray-700">📍 ${program.location ? program.location.title : "TBA"}</p>
    `;
    card.addEventListener("click", () => renderProgramDetail(program.topicIndex, program.programIndex, openDayData.topics));
    container.appendChild(card);
  });
}

// Sort Functionality
function sortPrograms() {
  const selectedSort = document.getElementById("sort-select").value;
  
  if (selectedSort === "time") {
    const sortedEvents = openDayData.topics.map(topic => ({
      ...topic,
      programs: topic.programs.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    }));
    renderAllEvents(sortedEvents);
  } else if (selectedSort === "name") {
    const sortedEvents = openDayData.topics.map(topic => ({
      ...topic,
      programs: topic.programs.sort((a, b) => a.title.localeCompare(b.title))
    }));
    renderAllEvents(sortedEvents);
  }
}

// Refresh Button
document.getElementById("refreshBtn").addEventListener("click", function () {
  location.reload(); // Reloads the page
});

// Show the Contact Form Modal
document.getElementById("contactBtn").addEventListener("click", function() {
  document.getElementById("contactModal").classList.remove("hidden");
});

// Close the Modal
document.getElementById("closeModal").addEventListener("click", function() {
  document.getElementById("contactModal").classList.add("hidden");
});

// Handle Form Submission (Send Email)
document.getElementById("contactForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  const mailtoLink = `mailto:support@cardiffopen.day?subject=Question from ${name}&body=Name: ${name}%0D%0AEmail: ${email}%0D%0AMessage:%0D%0A${encodeURIComponent(message)}`;

  // Open the default email client with the pre-filled message
  window.location.href = mailtoLink;

  // Close the modal after submitting
  document.getElementById("contactModal").classList.add("hidden");

  // Optionally, clear the form fields
  document.getElementById("contactForm").reset();
});
