let openDayData = null;

fetch("OpenDay.json")
  .then(res => res.json())
  .then(data => {
    openDayData = data;
    render(openDayData);
  })
  .catch(err => console.error("Failed to load JSON:", err));

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function render(data, query = "") {
  const container = document.getElementById("content");
  container.innerHTML = "";

  // Render event header
  container.innerHTML += `
    <div class="bg-white p-6 rounded shadow-md mb-6">
      <h2 class="text-2xl font-semibold mb-2">${data.description}</h2>
      <p><strong>Start:</strong> ${new Date(data.start_time).toLocaleString()}</p>
      <p><strong>End:</strong> ${new Date(data.end_time).toLocaleString()}</p>
      <img src="${data.cover_image}" alt="Cover Image" class="mt-4 rounded shadow max-w-full" />
    </div>
  `;

  // Render each topic box
  data.topics.forEach((topic, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("bg-white", "rounded", "shadow-md", "mb-4", "cursor-pointer", "transition", "hover:shadow-lg");
    wrapper.style.overflow = "hidden";

    const topicHeader = document.createElement("div");
    topicHeader.classList.add("p-6");

    topicHeader.innerHTML = `
      <h3 class="text-xl font-bold text-blue-800 mb-2">${highlight(topic.name, query)}</h3>
      <img src="${topic.cover_image}" alt="${topic.name}" class="mb-4 rounded" />
      <p class="mb-2">${topic.description}</p>
      <p class="text-sm text-gray-500 italic">Click to show/hide programs</p>
    `;

    const programList = document.createElement("ul");
    programList.classList.add("space-y-4", "px-6", "pb-6", "hidden"); // starts hidden

    topic.programs.forEach(program => {
      const li = document.createElement("li");
      li.classList.add("bg-blue-50", "p-4", "rounded", "border-l-4", "border-blue-600");

      const locationTitle = program.location?.title ? highlight(program.location.title, query) : "";
      const locationAddress = program.location?.address ? highlight(program.location.address, query) : "";

      li.innerHTML = `
        <strong class="block text-lg">${highlight(program.title, query)}</strong>
        <div class="text-sm text-gray-700">⏰ ${new Date(program.start_time).toLocaleTimeString()} - ${new Date(program.end_time).toLocaleTimeString()}</div>
        <div class="text-sm text-gray-700">📌 Room: ${program.room}</div>
        ${program.location ? `<div class="text-sm text-gray-600 mt-1">🏛️ ${locationTitle}<br>📍 ${locationAddress}</div>` : ""}
      `;
      programList.appendChild(li);
    });

    // Attach toggle behavior on click
    wrapper.addEventListener("click", () => {
      programList.classList.toggle("hidden");
    });

    wrapper.appendChild(topicHeader);
    wrapper.appendChild(programList);
    container.appendChild(wrapper);
  });
}

document.getElementById("search").addEventListener("input", function () {
  const query = this.value.toLowerCase();

  const filtered = {
    ...openDayData,
    topics: openDayData.topics.map(topic => {
      const topicMatches = topic.name.toLowerCase().includes(query);

      const filteredPrograms = topic.programs.filter(program => {
        const titleMatch = program.title.toLowerCase().includes(query);
        const locationMatch = program.location
          ? program.location.title.toLowerCase().includes(query)
          : false;

        return titleMatch || locationMatch || topicMatches;
      });

      return {
        ...topic,
        programs: filteredPrograms
      };
    }).filter(topic => topic.programs.length > 0)
  };

  render(filtered, query);
});

function sortPrograms() {
  const sortSelect = document.getElementById("sort-select");
  const sortValue = sortSelect ? sortSelect.value : "time";

  const sorted = {
    ...openDayData,
    topics: openDayData.topics.map(topic => {
      const sortedPrograms = [...topic.programs];

      if (sortValue === "time") {
        sortedPrograms.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      } else if (sortValue === "name") {
        sortedPrograms.sort((a, b) => a.title.localeCompare(b.title));
      }

      return {
        ...topic,
        programs: sortedPrograms
      };
    })
  };

  render(sorted);
}

