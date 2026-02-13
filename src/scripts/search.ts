function performSearch(searchTerm: string): void {
  clearSearch();
  
  if (!searchTerm) return;
  
  const regex = new RegExp(searchTerm, 'gi');
  const bodyText = document.body.innerText;
  
  let match: RegExpExecArray | null;
  const results: number[] = [];
  
  while ((match = regex.exec(bodyText)) !== null) {
    results.push(match.index);
  }
  
  if (results.length > 0) {
    highlightSearchResults(searchTerm);
  }
}

function highlightSearchResults(searchTerm: string): void {
  if (!document.body) return;

  const textNodes: Text[] = getTextNodes(document.body);
  const regex = new RegExp(`(${searchTerm})`, 'gi');
    
  textNodes.forEach((node: Text) => {
    const nodeText = node.nodeValue;
    if (nodeText && nodeText.match(regex)) {
      const parts: string[] = nodeText.split(regex);
      const fragment: DocumentFragment = document.createDocumentFragment();
        
      parts.forEach((part: string) => {
        if (part.match(regex)) {
          const mark = document.createElement('mark');
          mark.className = 'highlight';
          mark.textContent = part;
          fragment.appendChild(mark);
        } else if (part) {
          fragment.appendChild(document.createTextNode(part));
        }
      });
        
      node.parentNode?.replaceChild(fragment, node);
    }
  });
}

function getTextNodes(node: Node): Text[] {
  let textNodes: Text[] = [];
  
  if (node.nodeType === 3) {
    textNodes.push(node as Text);
  } else if (node.hasChildNodes()) {
    node.childNodes.forEach((child: Node) => {
      textNodes = textNodes.concat(getTextNodes(child));
    });
  }
  
  return textNodes;
}

function clearSearch(): void {
  const highlightedElements = document.querySelectorAll('.highlight');
  
  highlightedElements.forEach((element) => {
    const textNode = document.createTextNode(element.textContent || '');
    element.parentNode?.replaceChild(textNode, element);
  });

  // Normalize to merge adjacent text nodes
  document.body.normalize();
}

window.performSearch = performSearch;
window.clearSearch = clearSearch;
