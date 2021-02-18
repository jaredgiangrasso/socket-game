export const removeChildren = (element) => {
  while (element.lastChild) {
    element.removeChild(element.lastChild);
  }
};

export const showById = (element, show, displayValue = 'block') => {
  element.style.display = show ? displayValue : 'none';
};

export const addPlayerListItem = (playerList, players, showPoints) => {
  const playerListTable = playerList.querySelector('tbody');

  Object.values(players).forEach((player) => {
    const playerListIds = [...playerListTable.childNodes].map((player) => player.getAttribute('data-id'));
    if (!playerListIds.includes(player.pid)) {
      const tableRow = document.createElement('tr');
      const name = document.createElement('th');
      const points = document.createElement('td');

      name.classList.add('name');
      name.textContent = player.name;

      tableRow.setAttribute('data-id', player.pid);
      tableRow.appendChild(name);

      if (showPoints) {
        points.classList.add('points');
        points.textContent = player.points;
        tableRow.appendChild(points);
      }

      playerListTable.appendChild(tableRow);
    }
  });
};

export const removePlayerListItem = (playerList, players) => {
  const playerListTable = playerList.querySelector('tbody');
  const playerListIds = [...playerListTable.childNodes].map((player) => player.getAttribute('data-id'));
  const currentPlayerIds = Object.values(players).map((player) => player.pid);
  const removedPlayer = playerListIds.filter((pid) => currentPlayerIds.includes(pid))[0];

  [...playerListTable.childNodes].forEach((child) => {
    const childId = child.getAttribute('data-id');
    if (childId === removedPlayer) playerListTable.removeChild(child);
  });
};
