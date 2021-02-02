export const removeChildren = (element) => {
  while (element.lastChild) {
    element.removeChild(element.lastChild);
  }
};

export const showById = (element, show, displayValue = 'block') => {
  element.style.display = show ? displayValue : 'none';
};
