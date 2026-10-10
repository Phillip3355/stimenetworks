const positionedPanels = new WeakSet<HTMLElement>();

export default function scrollConversation(end: HTMLElement | null, reduced: boolean) {
  const feed = end?.parentElement;
  if (!feed) return;
  const behavior = reduced ? 'auto' : 'smooth';
  feed.scrollTo({ top: feed.scrollHeight, behavior });
  const panel = feed.closest<HTMLElement>('[data-chat-panel]');
  if (!panel || positionedPanels.has(panel)) return;
  positionedPanels.add(panel);
  const grid = panel.parentElement;
  if (grid && getComputedStyle(grid).gridTemplateColumns.split(' ').length === 1) {
    panel.scrollIntoView({ block: 'start', behavior });
  }
}
