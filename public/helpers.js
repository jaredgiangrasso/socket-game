export const removeChildren = (element) => {
  while (element.lastChild) {
    element.removeChild(element.lastChild);
  }
};

export const showById = (element, show, displayValue = 'block') => {
  element.style.display = show ? displayValue : 'none';
};

export const addPlayerListItem = (playerList, players, showPoints) => {
  Object.values(players).forEach((player) => {
    const playerListIds = [...playerList.childNodes].map((player) => player.getAttribute('data-id'));
    if (!playerListIds.includes(player.pid)) {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');

      const name = document.createElement('span');

      name.classList.add('name');
      name.textContent = player.name;

      listItem.setAttribute('data-id', player.pid);
      listItem.appendChild(name);

      if (showPoints) {
        const points = document.createElement('span');
        points.classList.add('points');
        points.textContent = player.points;
        listItem.appendChild(points);
      }

      playerList.appendChild(listItem);
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
